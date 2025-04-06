// set up the postgres db connection
    const { Pool } = require('pg');
    const dotenv = require('dotenv');
    dotenv.config();

    const pool = new Pool({
        user: process.env.DB_USERNAME,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
        password: process.env.DB_PASSWORD,
        ssl: {
            rejectUnauthorized: false
        }
    });
    pool.connect();

// set up how the backend interacts with the database 
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

const db = {};
db.testConnection = async() => {
    try {
        await pool.query('SELECT NOW()');
        console.log('Database connected');
    } catch (error) {
        throw new Error('Cannot connect to the database:', error);
    }
}

db.createUser = async (username, password) => {
    if (username && password) {
        const query = {
            text: 'INSERT INTO users (username, password, final_result) VALUES ($1, $2, $3)',
            values: [username, password, 0]
        };
        try{
            await pool.query(query);
            return true;
        } catch (error){
            throw new Error('There is an error during user creation:', error);
        }
    } else {
        throw new Error('User name and password are required');
    }
};

db.userExists = async (username) => {
    if (username) {
        const query = {
            text: 'SELECT * FROM users WHERE username = $1',
            values: [username]
        }; 
        try{
            const result = await pool.query(query);
            return result.rows.length > 0;
        } catch (error){
            throw new Error(`There is an error during user verification:', ${error.message}`)} 
        } else {
        throw new Error('User name is required');
    }
};


db.verifyUser = async (username, password) => {
//if the select username from user database matches with the password then send back true response
    if (username && password) {
        const query = {
            text: 'SELECT * FROM users WHERE username = $1 AND password = $2',
            values: [username, password]
        };
        try {const result = await pool.query(query);
        return result.rows.length > 0;
        } catch(error) {
            throw new Error(`There is an error during user verification:', ${error.message}`);
        }
    } else {
        throw new Error('Please enter valid username and password');
    }
};

db.getFinalResult = async (username) => {
    if (username) {
        const query = {
            text: 'SELECT final_result FROM users WHERE username = $1',
            values: [username]
        };
        try{
        const result = await pool.query(query);
        return result.rows[0].final_result;
        } catch (error) {
            console.error('Cannot retrieve the final result:', error);
        }
    } else {
        throw new Error('Please provide a valid username');
    }
};

db.updateFinalResult = async (username, finalResult) => {
    if (username && finalResult !== undefined) {
        const query = {
            text: 'UPDATE users SET final_result = $2 WHERE username = $1',
            values: [username, finalResult] 
        };
        try {await pool.query(query);
        return true;}
        catch (error) {
            throw new Error('Cannot update the final result:', error);
        }   
    } else {
        throw new Error('Please provide a valid username and final result');
    }   
};   



module.exports = db;