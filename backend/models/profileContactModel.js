const mongoose = require('mongoose')
const User = require('./userModel')
const Broker = require('./brokerModel')
const MarriageProfile = require('./marriageProfileModel')

const marriageProfileSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:User
    },
    broker:{
        type:mongoose.Schema.Types.ObjectId,
        require:false,
        ref:Broker
    },
    MarriageProfile:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:MarriageProfile
    },
    
    address1: {
        type: String,
        require: [true, 'Please add the address1'],
    },
    address2: {
        type: String,
        require: false,
    },
    phonenumber: {
        type: String,
        require: [false, 'Please add the phone number'],
    },
    job: {
        type: String,
        require: [false, 'Please add the job'],
    },
    company: {
        type: String,
        require: [false, 'Please add the company']
    },
       
})

module.exports = mongoose.model('MarriageProfile', marriageProfileSchema)