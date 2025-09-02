const mongoose = require ('mongoose')

const otherLocationSchema = mongoose.Schema({
    order:{
        type: Number,
        require:[true]
    },
    location:{
        type: String,
        require:[true]
    }
})

module.exports = mongoose.model('otherlocation',otherLocationSchema)