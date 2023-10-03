const express = require('express');
const router = express.Router();
const connect = require('../dbConfig/db');

router.use('/test', (req, res, next) => {
    console.log('hitting router.get middle wire');
    console.log(req.ip);
    next();
})

router.get('/test', (req, res) => {
    console.log('inside the test route');
    res.send({message: 'hi there'})
})

router.get('/fake/:one-:two', (req, res) => {
    console.log('inside the fake route', req.params);
    res.send({message: 'hi there'})
})

router.get('/', async(req, res) => {
    const {userCollection} = await connect();
    const email = req.query.email;
    if(!email){
        return res.status(400).send({error: true, message: 'mandatory query email not found'})
    }
    const result = await userCollection.findOne({email: email});
    res.send(result);
})


module.exports = router;