const mongoose = require('mongoose')

const jobSchema = mongoose.Schema({
    job: {
        type: String,
        require: [true, 'Please add the Job']
    },
   
})

module.exports = mongoose.model('Job', jobSchema)