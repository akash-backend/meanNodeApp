var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var CardInfoSchema = new Schema({
    user_id: {
        type: Number,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    card_no: {
        type: String,
        required: true
    },
    created_at: { type: Date, default: Date.now },
   });


module.exports = mongoose.model('CardInfo', CardInfoSchema);