const mongoose = require('mongoose')

const configSchema = mongoose.Schema({
    
    key: {
        type: String,
        require: [true, 'Please add the key']
    },
    value: {
        type: String,
        require: [true, 'Please add the value']
    },
})

module.exports = mongoose.model('Config', configSchema)