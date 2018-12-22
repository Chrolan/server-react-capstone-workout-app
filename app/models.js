'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const exerciseSchema = mongoose.Schema ({
    name : {type: String, required: true },
    reps : {type: Number, default: 0 },
    sets : {type : Number, default: 0},
    weight : {typ: Number, default: 0}
});


const workoutSchema =  mongoose.Schema ({
    name : {type: String, required: true, default: 'Workout'},
    date : {type: Date, required: true},
    exercises : [ exerciseSchema ]
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = { Workout };