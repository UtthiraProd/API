const mongoose = require('mongoose')

const religionSchema = mongoose.Schema({
    religion: {
        type: String,
        require: [true, 'Please add the religion']
    },
   
})

module.exports = mongoose.model('Religion', religionSchema)