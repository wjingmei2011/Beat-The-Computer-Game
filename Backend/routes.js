// set up the routes to direct the api endpoints to the proper backend logic

const express = require('express');
const router = express.Router();
const controller = require('./controller');

// define the routes
router.post('/signup', controller.signup);
router.post('/signin', controller.signin);
router.post('/updateFinalResult', controller.updateFinalResult);
router.get('/getFinalResult', controller.getFinalResult);

module.exports = router; 