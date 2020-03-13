var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/settings');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
const url = require('url');

router.post('/register', function(req, res) {
    const queryObject = url.parse(req.url, true).query;
    //console.log(queryObject.username);
    if (!queryObject.username || !queryObject.password) {
        res.json({ success: false, msg: 'Please pass username and password.' + 'you passed: ' + queryObject.username + ' and ' + queryObject.password });
    } else {
        var newUser = new User({
            username: queryObject.username,
            password: queryObject.password
        });
        // save the user
        newUser.save(function(err) {
            if (err) {
                return res.json({ success: false, msg: 'Username already exists.' });
            }
            res.json({ success: true, msg: 'Successful created new user.' });
        });
    }
});

router.post('/login', function(req, res) {
    console.log('reached');
    const queryObject = url.parse(req.url, true).query;
    console.log(queryObject.username, queryObject.password);
    User.findOne({
        username: queryObject.username
    }, function(err, user) {
        console.log(user)
        if (err) throw err;

        if (!user) {
            res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
        } else {
            // check if password matches
            user.comparePassword(queryObject.password, function(err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.sign(user.toJSON(), config.secret);
                    // return the information including token as JSON
                    res.json({ success: true, token: 'JWT ' + token });
                } else {
                    res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
                }
            });
        }
    });

});


router.post('/logout', passport.authenticate('jwt', { session: false }), function(req, res) {
    req.logout();
    res.json({ success: true });
});


module.exports = router;