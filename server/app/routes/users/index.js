'use strict';
const router = require('express').Router();
module.exports = router;
const mongoose = require('mongoose');
const User = mongoose.model('User');
const ensure = require('../../configure/authentication/ensure');

// router.param('id', function(req, res, next, id) {
//     User.findById(id).exec()
//         .then(function(user) {
//             if (!user) throw new Error(404);
//             req.requestedUser = user;
//             next();
//         })
//         .catch(next);
// });

// must be logged in
router.get('/', ensure.authenticated, (req, res) => { // get all
    User.find({})
        .then(users => res.send(users))
});

// no auth
router.post('/', (req, res) => { // create new
    User.create(req.body)
        .then(newUser => res.send(newUser))
});

// must be logged in
router.get('/:id', ensure.authenticated, (req, res) => { // get one
    res.json(req.requestedUser);
});

// must be user or admin
router.put('/:id/friends', (req, res) => { // edit one
    User.findById(req.body.id)
        .then((friend) => {
            return req.requestedUser.addFriend(friend._id);
        })
        .then(savedUser => res.send(savedUser))
});

// must be user or admin
router.put('/:id?', ensure.authenticated, ensure.selfOrAdmin, (req, res) => { // edit one
    if (req.body.blinkZero) {req.session.calibrate = req.body}
    if (!req.user) {return res.send("no user found")}
    let userId = req.params.id || req.user._id
    User.findById(req.user._id)
        .then(user => {
            for (let key in req.body) { // doesn't require sending the whole object back and forth
                user[key] = req.body[key]
            }
            // user = req.body // requires sending the whole object, but maybe less risky than overwriting the whole object?
            return user.save()
        })
        .then(newUser => res.send(newUser))
});
