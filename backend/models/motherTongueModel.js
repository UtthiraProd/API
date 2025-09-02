const mongoose = require("mongoose")

const motherTongue = mongoose.Schema({

    motherTongue:{
        type:String,
        require:[true]
    }
})

module.exports = mongoose.model('MotherTongue',motherTongue)