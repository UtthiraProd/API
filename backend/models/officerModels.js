const mongoose= require("mongoose");
const officerSchema = mongoose.Schema({

    name:{
        type:String,
        require:[true,'please add name']
    },
    branch:{
        type:String,
        require:[true,'please add branch']
    },
    age:{
        type:String,
        require:[true,'please add age']
    },
    gender:{
        type:String,
        require:[true,'please add gender']
    },
    nationality:{
        type:String,
        require:[true,'please add nationality']
    }
})
module.exports = mongoose.model('officer',officerSchema)