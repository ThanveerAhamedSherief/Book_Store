
var mongoose = require('mongoose');
var imageSchema = new mongoose.Schema({
	name: String,
	desc: String,
});
module.exports = new mongoose.model('Image', imageSchema);
