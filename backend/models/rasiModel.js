const mongoose = require('mongoose')

const rasiSchema = mongoose.Schema({
    state: {
        type: String,
        require: [true, 'Please add the state']
    },
    rasi: {
        type: String,
        require: [true, 'Please add the rasi']
    },
    order: {
        type: Number,
        require: true
    },
})

module.exports = mongoose.model('Rasi', rasiSchema)