const mongoose = require('mongoose')

const stateSchema = mongoose.Schema({
    
    name: {
        type: String,
        require: [true, 'Please add the state']
    },
})

module.exports = mongoose.model('State', stateSchema)