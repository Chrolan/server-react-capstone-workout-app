'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const { Workout } = require('./models');

const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const jsonParser = bodyParser.json();

router.get( '/' , jsonParser,  (req, res) => {

    Workout.find({user: req.user.username})
        .limit(5)
        .sort({'date' : -1})
        .then(workouts => {
            res.status(200).json(workouts.map(workout => {
                return workout
                }))
        })
        .catch(err => {
            res.status(500).json({message: 'Could not retreive workouts'})
        })
});

router.get('/:id', jsonParser, (req, res) => {

    Workout.findOne({_id:req.params.id})
        .then(workout => {
            if (workout != null && Object.keys(workout).length > 0) {
                res.status(200).json(workout)
            }
        else {
                res.status(500).json({message: 'Workout Does not exsist'})
            }})
        .catch(err => {
            res.status(500).json({message: 'Internal Server Error'})
        })
});

router.post('/' , jsonParser , (req, res) => {

    Workout.findOne({ name: req.body.name, date: req.body.date})
        .then(workout => {
            if (workout != null && Object.keys(workout).length > 0) {
                res.status(500).json({message: 'Workout already exists'})
            }
            else {
                Workout.create({
                    name : req.body.name,
                    date : req.body.date,
                    exercises : req.body.exercises,
                    user : req.user.username
                    })
                    .then(workout => {
                        res.status(200).json(workout)
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({message: 'Could not create workout'})
                    })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({message: 'Internal Server Error'})
        });
});


router.put('/:id', jsonParser, (req,res) => {

    console.log(req.body);

    if (!(req.params.id && req.body._id && req.params.id === req.body._id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    // we return here to break out of this function
    return res.status(400).json({message: message});
  }

    Workout.findOne({_id:req.params.id})
        .then(workout => {
            if(workout != null && Object.keys(workout).length > 0) {
                Workout.update({
                    name: req.body.name,
                    date: req.body.date,
                    exercises: req.body.exercises
                })
                    .then(workout => {
                        res.status(204).json({message: 'Workout updated!', workout})
                    })
                    .catch(err => {
                        res.status(500).json({message: 'Could not update workout'})
                    })
            }
            else {
                res.status(500).json({message: 'Could not find workout to update'})
            }
        })
        .catch(err => {
            res.status(500).json({message: 'Internal Server Error'})
        })
});


router.delete('/:id', jsonParser, (req,res) => {

    Workout.findOne({_id:req.params.id})
        .then(workout => {
            if(workout != null && Object.keys(workout).length > 0) {
                Workout.deleteOne(workout)
                    .then(res.status(204).json({message: 'Success'}))
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({message: 'Error deleting Workout'})
                    })
            }
            else {
                res.status(400).json({message: 'Workout does not exist'})
            }})
        .catch(err => {
            console.log(err);
            res.status(200).json({message: 'Could not find Workout'})
        })
});

module.exports = { router };
