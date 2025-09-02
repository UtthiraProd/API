const mongoose = require('mongoose')
const tempUserOTPSchema = mongoose.Schema({
    name: {
        type: String,
        require: false
    },
    // email: {
    //     type: String,
    //     require: false,
    //     unique: true
    // },
    phoneNumber: {
        type: Number,
        require: true,
        unique: true
    },
    otp: {
        type: Number,
        require: true
    },
    type: {
        type: String,
        require: true,
        enum: ['ForgotUser', 'ResetUser','RegisterUser','BrokerUserRegister']
    },
    updatedAt: {
        type: Date,
        require: true
    },
    passwordTry: {
        type: Number,
        require: true,
        default: 0
    },
    isLocked: {
        type: Boolean
    },
    CreatedTime: {
        type: Date,
        require: true
    },
    status: {
        type: String,
        require: true,
        enum: ['New', 'Approved']
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

module.exports = mongoose.model('tempUserOTP', tempUserOTPSchema)