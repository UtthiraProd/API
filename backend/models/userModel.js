const mongoose = require('mongoose')
const UserRole = require('./userRoleModel')
const userSchema = mongoose.Schema({

    name: {
        type: String,
        require: [true, 'Please add a name']
    },
    email: {
        type: String,
        require: [true, 'Please add email'],
        unique: true
    },
    phoneNumber: {
        type: Number,
        require: [false, 'Please add phone number'],
        
    },
    password: {
        type: String,
        require: [true, 'Please add pin code'],
    },
    state: {
        type: String,
        require: [true, 'Please add state'],
    },
    isBroker:{
        type:Boolean,
        require:false
    },
    roleId:{
        type:mongoose.Schema.Types.ObjectId,
        require:false,
        ref:UserRole
    },
    passwordTry: {
        type: Number,
        require: true
    },
    isLocked:{
        type:Boolean
    },
    state: {
        type: String,
        require: [true, 'Please add state'],
        enum: ['Tamil Nadu']
    },
    otp: {
        type: Number,
        require: false
    },
    otpUpdatedTime: {
        type: Date,
        require:false
    },
    profileId:{
        type:mongoose.Schema.Types.ObjectId,
        require:false,
        // ref:MarriageProfile
        
    },
    brokerId:{
        type:mongoose.Schema.Types.ObjectId,
        require:false,
        // ref:MarriageProfile
    },
    userName:{
        type:String,
        require:[true]
    },
    password:{
        type:String,
        require:[true]
    },
    confirmPassword:{
        type:String,
        require:[true]
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        require:[false]
    },
    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        require:[false]
    },
    isLoggedin:{
        type:Boolean
    },
     lastLogginedTime: {
        type: Date,
        require:false
    },
    heartBeat:{
        type: Date,
        require: false
    }
},
    {
        timestamps: true,
    }

)

module.exports = mongoose.model('User', userSchema)