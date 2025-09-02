const mongoose = require('mongoose')
const matchProfileSchema = mongoose.Schema({

        match: [
            {
                matchstar: { type: mongoose.Schema.Types.String },
            }],
        
        star: {
            type: String,
            require: false
        }
});
    module.exports = mongoose.model('Matchprofile',matchProfileSchema)