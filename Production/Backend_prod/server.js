// For this file: initialize the server, set up middleware and sessions
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const routes = require('./routes');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const { RedisStore } = require('connect-redis');
const {createClient} = require('redis');
const db = require('./database');


console.log('server.js is running');

// Test database connection
db.testConnection();

// Middleware for enabling environment variables without exposing them in the code
dotenv.config();

//initialize the server
const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

// Middleware for logging HTTP requests to the console
app.use(morgan('dev'));


// Middleware for enabling CORS
app.use(cors(
    {
        origin: [process.env.CORS_ORIGIN],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
    }
));

//initialize the Redis client
const redisClient = createClient({
    url: process.env.REDIS_URL,
});

// Connect to Redis
redisClient.connect().then(()=> {
    console.log('Redis Connected');
}).catch(console.error);

// Handle Redis connection errors
redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

//initialize the Redis store
const store = new RedisStore({
    client: redisClient
});


// Middleware for session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // don't save session when there's no modification
    saveUninitialized: true, // always create a session even if there's no data
    store: store,
    cookie: {
        httpOnly: true, // prevent client-side JavaScript from accessing the cookie
        secure: true, // when HTTPS is enabled
        sameSite: 'None',
        maxAge: 1000 * 60 * 15, // cookie expiration time (15 mins)
        domain: 'onrender.com'
    },
}));



// define API routes
app.use('/game', routes);

// define static files
app.use(express.static(path.join(__dirname, '../Frontend/public')));

// serve index.html 
app.get('*', (req,res)=>{
    res.sendFile(path.join(__dirname, '../Frontend/public/index.html'));
});


// error handling
app.use((err, req, res, next)=>{
    res.status(500).send(err);
});

//define the port and start the server
const PORT = process.env.PORT || 4001;
app.listen(PORT, ()=>{console.log(`Server is listening on ${PORT}`)});
