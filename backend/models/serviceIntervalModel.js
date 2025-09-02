const mongoose = require('mongoose')

const serviceInterval = mongoose.Schema({
    
    ServicePeriod:{
        type:String,
        require: [true, 'Please add the ServicePeriod']
    },
    ServiceDuration:{
        type:Number,
        require:[true, 'Please add the ServiceDuration']
    },
    ServiceName:{
        type:String,
        require:[true, 'Please add the ServiceName']
    }
})

module.exports = mongoose.model('serviceinterval', serviceInterval)