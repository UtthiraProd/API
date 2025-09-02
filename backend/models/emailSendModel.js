const mongoose = require('mongoose')
const emailSent = mongoose.Schema({
    name: {
        type: String,
        require: false
    },
    emailSubject:{
        type:String,
        require:true
     },
     emailBody:{
         type:String,
         require:true,
     },
    email: {
        type: String,
        require: true,
        unique: true
    },

    otp:{
        type: Number,
        require: true
    },
   
    emailotp: {
        type: Number,
        require: true
    },
    phoneNumber: {
        type: Number,
        require: true,
        unique: true
    },
    status: {
        type: String,
        require: true,
        enum: ['New', 'Approved']
    },
    reSend:{
        type:Boolean,
        require:false
    },
    createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            require:[false]
        },
        updatedBy:{
            type:mongoose.Schema.Types.ObjectId,
            require:[false]
        }
},
    {
        timestamps: true,
    }

    
)

module.exports = mongoose.model('emailSend', emailSent)