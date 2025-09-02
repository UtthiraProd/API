const mongoose = require('mongoose')

const casteSchema = mongoose.Schema({
    caste: {
        type: String,
        require: [true, 'Please add the caste']
    },
    order: {
        type: Number,
        require: true
    },
   
})

module.exports = mongoose.model('Caste', casteSchema)