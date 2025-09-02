const mongoose = require('mongoose')
const User = require('../models/userModel')
const brokerSchema = mongoose.Schema({
    name: {
        type: String,
        require: [true, 'Please add Broker name']
    },
    type: {
        type: String,
        require: false
    },
    region:{
        type: String,
        require: false
    },
    address1: {
        type: String,
        require: [true, 'Please add Address1']
    },
    address2: {
        type: String,
    },
    country: {
        type: String,
        require: [false, 'Please add country'],
        enum: ['India']
    },
    state: {
        type: String,
        require: [true, 'Please add state'],
        enum: ['Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Karnataka ']
    },
   district: {
       type: String,
       require: [true, 'Please add district'],
       enum: ['Kanyakumari', 'Thirunelveli', 'Thoothukudi', 'Madurai']
   },
    pincode: {
        type: Number,
        require: [true, 'Please add pin code'],
    },
    phoneNumber:{
        type: Number,
        require: [true, 'Please phone number'],
    },
    email:{
        type:String,
        require:[true]
    },
    matrimonyName:{
        type:String,
        require:[true]
    },
    brokerCategory:{
        type:String,
        require:[true],
        Enum:[ 'Gold', 'Silver', 'Bronze']
    },
    rank:{
        type:Number,
        require:[true]
    },
    
   additionalNumber:{
    type:Number,
    require:[false]
   },
  whatsAppNumber:{
    type:Number,
    require:[false]
  },
    commissionPercentage:{
    type:String,
    require:[false]
  },
    registrationNumber:{
    type:String,
    require:[false]
  },
  roleId:{
        type:String,
        require:[true]
    },
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    require:true,
    ref:User
    },
   balanceAmount:{
    type:Number,
    require:[true]
   },

    profileIds:[],
     approved:{type:Boolean},
    container:{
        type: String,
        require: false,
    },
    imageName:{
        type: String,
        require: false,
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        require:[false]
    },
    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        require:[false]
    },
      isPublic:{
        type:Boolean
    },
      isActive:{
        type:Boolean
    },
    brokerTobroker:[
        {
            _id:{type: mongoose.Schema.Types.ObjectId }
        }
    ]
},
    {
        timestamps: true,
    })

module.exports = mongoose.model('Broker', brokerSchema)