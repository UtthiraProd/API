const mongoose = require('mongoose')

const districtSchema = mongoose.Schema({
    state: {
        type: String,
        require: [true, 'Please add the state']
    },
    district: {
        type: String,
        require: [true, 'Please add the district']
    },
    order: {
        type: Number,
        require: true
    },
})

module.exports = mongoose.model('District', districtSchema)