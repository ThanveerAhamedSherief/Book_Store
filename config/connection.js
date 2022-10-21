let mongoose = require('mongoose');
require('dotenv/config');
let connection = async () =>{
    try {
      let connect= await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        if(connect) {
            console.log("Mongo db connected successfully.");
        }
    } catch (error) {
        console.log('Error while connecting to the mongoDB');
        throw error;
    }
};

module.exports = connection;