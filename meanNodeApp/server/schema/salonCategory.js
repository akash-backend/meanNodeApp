var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var SalonCategorySchema = new Schema({
    category_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
     salon_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
   },{
    collection: 'salonCategory'
});


module.exports = mongoose.model('SalonCategory', SalonCategorySchema);