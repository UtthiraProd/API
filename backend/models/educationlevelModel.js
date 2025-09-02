const mongoose = require('mongoose')

const educationlevelSchema = mongoose.Schema({
    educationlevel: {
        type: String,
        require: [true, 'Please add the educationlevel']
    },
    
    order: {
        type: Number,
        require: true
    },
})

module.exports = mongoose.model('Educationlevel', educationlevelSchema)