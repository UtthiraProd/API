const mongoose = require('mongoose')

const qualificationSchema = mongoose.Schema({
    qualification: {
        type: String,
        require: [true, 'Please add the qualification']
    },
   
})

module.exports = mongoose.model('Qualification', qualificationSchema)