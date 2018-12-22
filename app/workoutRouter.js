'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const { Workout } = require('./models');

const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const jsonParser = bodyParser.json();

router.get( '/' , jsonParser,  (req, res) => {

    const filters = {};
    const queryFields = [];

    //appends fields to filters object, which is later used by Device.find in filtering mongo search
    queryFields.forEach(field => {
        if (req.query[field]){
            filters[field] = req.query[field]
        }
    });

    Workout.find(filters)
        .limit(5)
        .sort({'name' : 1})
        .then(workouts => {
            res.json({ workouts : workouts.map(workout => {
                return workout
                })})
        })
        .catch(err => {
            res.status(500).json({message: 'Could not retreive workouts'})
        })
});

router.post('/' , jsonParser , (req, res) => {

    console.log(req.body);

    Workout.findOne({ name: req.body.name, date: req.body.date})
        .then(workout => {
            if (workout != null && Object.keys(workout).length > 0) {
                res.status(500).json({message: 'Workout already exists'})
            }
            else {
                Workout.create({
                    name : req.body.name,
                    date : req.body.date,
                    exercises : req.body.exercises
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

module.exports = { router };
