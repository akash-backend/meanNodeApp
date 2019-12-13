var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var SalonSchema = new Schema({
    full_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    account_type: {
        type: Number,
    },
    country_code: {
        type: String,
    },
    phone_number: {
        type: String,
    },
    lon: {
        type: Number,
    },
    lat: {
        type: Number,
    },
    location: {
        type: String,
    },
    gender: {
        type: String,
    },
    salon_name: {
        type: String,
    },
     category: {
        type: Object,
    },
    time_schedule: {
        type: Object,
    },
     specification: {
        type: String,
    },
     working_hour: {
        type: String,
    },
     opening_hour: {
        type: String,
    },
     closed_hour: {
        type: String,
    },
    profile_image: String,
    created_at: { type: Date, default: Date.now },
   });


module.exports = mongoose.model('Salon', SalonSchema);