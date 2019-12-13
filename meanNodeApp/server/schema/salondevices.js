var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SalondevicesSchema = new Schema({
    salon_id: {
        type: String,
        required: true,
    },
    device_token: {
        type: String,
        required: true,
        unique:true
    },
    device_type: {
        type: String,
        required: true,
    },
    device_id: {
        type: String,
        required: true,
    },
    notified_at:{ type: Date, default: Date.now },
});

module.exports = mongoose.model('Salondevices', SalondevicesSchema);