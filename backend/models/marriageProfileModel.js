const mongoose = require('mongoose')
const User = require('../models/userModel')
const Broker = require('../models/brokerModel')

const marriageProfileSchema = mongoose.Schema({
    // user:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     require:true,
    //     ref:User
    // },

    brokerId:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:Broker,
        unique: false
    },

    // brokerId: {
    //     type: String,
    //     require: false
    // },
    profileID: {
        type: Number,
        require: false
    },
    name: {
        type: String,
        require: [true, 'Please add bride/bride groom name']
    },
    colour: {
        type: String,
        require: false
    },
    height: {
        type:Number,
        require: false
    },
    weight: {
        type: Number,
        require: false
    },
    bloodGroup: {
        type: String,
        require: false
    },
    maritalstatus: {
        type: String,
        require: [true, 'Please add the Marital status'],
        enum: ['Unmarried', 'Widowed','Divorced','Awaiting Divorce']
    },
    
    qualification: {
        type: String,
        require: [true, 'Please add qualification']
    },
    DOB: {
        type: Date,
        require: false
    },
    POB: {
        type: String,
        require: false
    },
    birthTime:{
        type: String,
        require: false
    },
    phoneNumber: {
        type: Number,
        require: [true, 'Please add phone number']
    },
    contactPerson: {
        type: String,
        require: [true, 'Please add contact person']
    },
    job:{
        type: String,
        require: false
    },
    salary: {
        type: Number,
        require: false
    },
    jobDescription: {
        type: String,
        require: false
    },
    jobLocation: {
        type: String,
        require: false
    },
    foreignCountry: {
        type: String,
        require: false
    },
    fatherName:{
        type: String,
        require: false
    },
    motherName:{
        type: String,
        require: false
    },

    fatherOccupation:{
        type: String,
        require: false
    },
    motherOccupation:{
        type: String,
        require: false
    },
    sex: {
        type: String,
        require: [true, 'Please add the sex'],
        enum: ['Male', 'Female']
    },
    religion: {
        type: String,
        require: [true, 'Please add the religion'],
    },
    foodPreference:{
        type: String,
        require: false
    },
    motherTongue: {
        type: String,
        require: [true, 'Please add the Mother Tongue'],
    },
    caste: {
        type: String,
        require: [true, 'Please add the cast'],
    },
    subcaste: {
        type: String,
        require: [false],
    },
    state: {
        type: String,
        require: [false],
    },
    district: {
        type: String,
        require: [false],
    },
    settledLocation: {
        type: String,
        require: [false],
    },
    address1: {
        type: String,
        require: [false],
    },
    address2: {
        type: String,
        require: [false],
    },
    star: {
        type: String,
        require: false
    },
    rasi: {
        type: String,
        require: false
    },
    dhosam: {
        type: String,
        require: false
    },
    container: {
        type: String,
        require: false
    },
    sistersMarried: {
        type: Number,
        require: false
    },
    sistersUnmarried: {
        type: Number,
        require: false
    },
    brothersMarried: {
        type: Number,
        require: false
    },
    brothersUnmarried: {
        type: Number,
        require: false
    },
    selfDescription: {
        type: String,
        require: false
    },
    expectationFromMarriage: {
        type: String,
        require: false
    },
    notes: {
        type: String,
        require: false
    },
    additionalQualification:{
        type:String,
        require:false
    },
   birthHour:{
    type:Number,
    require:false
   },
   birthMin:{
    type:Number,
    require:false
   },
   meridiem:{
    type:String,
    require:false,
      enum: ['AM','PM','']
      
   },
    status: {
        type: String,
        require: [true, 'Status'],
        enum: ['New', 'Marriage fixed - Payment Incomplete','Marriage fixed - Payment Complete','Marriage Complete']
    },
    publicProfId:{
        type:mongoose.Schema.Types.ObjectId,
    },

   // imageUrls:[],
    imageUrls: [
        {
            name: { type: String },  
            isProfile: { type: Boolean}
        }],

    //horoScope:{}

       command: [
            {
                command: { type: mongoose.Schema.Types.String },
                date:{type: mongoose.Schema.Types.Date}
            }
        ],

    horoScope: {
        profileId: String,
        meshaR: String,
        vrishbaR: String,
        mithunaR: String,
        karkataR: String,
        simhaR: String,
        kanyaR: String,
        tulaR: String,
        vrishikaR: String,
        dhanuR: String,
        makaraR: String,
        khumbhaR: String,
        meenaR: String,
        meshaA:String,
        vrishbaA: String,
        mithunaA: String,
        karkataA: String,
        simhaA: String,
        kanyaA: String,
        tulaA: String,
        vrishikaA: String,
        dhanuA: String,
        makaraA: String,
        khumbhaA: String,
        meenaA: String,
        dhasa: String,
        year: String,
        month: String,
        day: String
    },
    // ,
    // isWidow: {
    //     type: Boolean,
    //     require: false
    // },
    
   isBrokerApproved:{
       type:Boolean,
       default: false 
   },
   isAdminApproved:{
       type:Boolean,
       default: false 
   },
   createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    require:[false]
   },
   updatedBy:{
    type:mongoose.Schema.Types.ObjectId,
    require:[false]
   },
   planID:{
    type:mongoose.Schema.Types.ObjectId,
    require:false
   },
    description: {
        type: String,
        require: false
    },
    isPublicImage:{
        type:Boolean,
       default: false 
    },
    isPublicProfile:{
        type:Boolean,
       default: false 
    }
},
{
    timestamps: true,
},
{
toJSON: { virtuals: true },  // Make sure virtual fields are included in the output
toObject: { virtuals: true },
}
)



// Create a virtual field 'age' based on 'DOB'
marriageProfileSchema.virtual('age').get(function() {
    if (!this.DOB) return null;
    const today = new Date();
    const birthDate = new Date(this.DOB);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

module.exports = mongoose.model('MarriageProfile', marriageProfileSchema)