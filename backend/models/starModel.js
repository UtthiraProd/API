const mongoose = require('mongoose')

const starSchema = mongoose.Schema({
    state: {
        type: String,
        require: [true, 'Please add the state']
    },
    star: {
        type: String,
        require: [true, 'Please add the state']
    },
    order: {
        type: Number,
        require: true
    },
})

module.exports = mongoose.model('Star', starSchema)