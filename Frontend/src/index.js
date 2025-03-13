import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import App from "./app";
import Auth from "./auth";

console.log('index.js is running');

const container = document.getElementById('root'); // get the root element from the index.html
const root = createRoot(container); // create the root element

// render the root element with the Router and Routes
root.render (
    <Router>
        <Routes>
            <Route path='/game' element={<App />} />
            <Route path='/' element={<Auth />} />
            <Route path='*' element={<Auth />} />
        </Routes>
    </Router>
); 


