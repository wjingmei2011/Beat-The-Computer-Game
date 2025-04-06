// controls how the backend responds to frontend requests, using express

const express = require('express');
const db = require('./database'); // import the database module

const controller = {}; // create an object to hold the controller functions 

controller.signup = async (req, res, next) => {
    const {username, password} = req.body;
    if (!username || !password) {
       return res.status(400).json({message: 'Please provide a valid username and password'});}
    if (await db.userExists(username)) {
       return res.status(400).json({message: 'Username already exists'});
    }
    try {
        await db.createUser(username, password);
        res.status(201).json({message:'User created'});
    } catch (error) {
        console.error('Error during user creation:', error);
        next(error);
    }
};

controller.signin = async (req, res, next) => {
    const {username, password} = req.body;
    if (!username || !password) {
       return res.status(400).json({message: 'Please provide a valid username and password'});
    }
    try {
        const result = await db.verifyUser(username, password); 
        if (result) {
        req.session.username = username; // store the username in the session
        res.status(200).json({message:'User signed in', username});
        } else {
            res.status (401).json({message: 'Invalid username or password'});
        } 
    } catch (error) {
        console.error('Error during user verification:', error);
        next(error);
    }
};

controller.getFinalResult = async (req, res, next) => {
    console.log('Session Data:', req.session);
    const username = req.session.username;
    if (!username) {
        return res.status(401).json({message:'/unauthorized: Please sign in'});
    } 
    try{
        const finalResult = await db.getFinalResult(username);
        if (finalResult !== undefined) {
            console.log('Final Result:', finalResult);
            res.status(200).json({finalResult});
        } else {
            res.status(404).json({message:'Final result not found in the database'});
        }
    } catch (error){
        console.error('Error when retrieving the final result:', error);
        next(error);
    };
};

controller.updateFinalResult = async (req, res, next) => {
    const {username, finalResult} = req.body;
    if (!username || finalResult === undefined) {
        return res.status(400).json({message: 'please provide a valid username and final result'});
    } 
    try {
        const result = await db.updateFinalResult(username, finalResult)
        if (result) {
        res.status(200).json({message: 'Final result updated'});
    } else {
        res.status(404).json({message:'Final result cannot be updated'});
    }
    } catch (error) {
        console.error('Error during updating final result:', error);
        next(error);
    }
};

module.exports = controller;