const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    filename : {
        type : String,
        required: true
    },
    contentType : {
        type: String,
        required : true
    },
    imageBase64 : {
        type : String,
        required: true
    },
    parentId:{
        type:String
    }
})

module.exports = UploadModel = mongoose.model('uploads', uploadSchema);