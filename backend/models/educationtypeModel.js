const mongoose = require('mongoose')

const educationtypeSchema = mongoose.Schema({
    educationtype: {
        type: String,
        require: [true, 'Please add the educationtype']
    },
   
})

module.exports = mongoose.model('Educationtype', educationtypeSchema)