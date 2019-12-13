var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var BarberSchema = new Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    phone_number: {
        type: Number,
    },
     show_status: {
        type: Number,
    },
    bio: {
        type: String,
    },
    salon_id: {
        type: Schema.Types.ObjectId,
    },
    profile_image: {
        type: String,
    }
   },{
    collection: 'barber'
});


module.exports = mongoose.model('Barber', BarberSchema);