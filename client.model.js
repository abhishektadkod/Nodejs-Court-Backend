const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Client = new Schema({
    username: {
        type: String,
		
    },
    pass: {
        type: String
		
    },
    logged: {
        type: Number
		
    }
});

module.exports = mongoose.model('Client', Client);