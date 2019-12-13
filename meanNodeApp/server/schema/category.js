var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var CategorySchema = new Schema({
    category_name: {
        type: String,
        required: true
    }
   },{
    collection: 'category'
});


module.exports = mongoose.model('Category', CategorySchema);