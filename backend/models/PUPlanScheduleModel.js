const mongoose = require ("mongoose")
const PUMarriageProfile = require('../models/PUMarriageProfileModel')

const PUPlanSchedule = mongoose.Schema({

   profileID:{
            type:mongoose.Schema.Types.ObjectId,
            require:true,
            ref:PUMarriageProfile
        },
    isPublicProfile:{
           type: Boolean,
           require:false,
    },
    // Schedule Array,
    planSchedule: [
    {
        planID: { type: mongoose.Schema.Types.ObjectId },  
        expiryDate: { type: Date},
        isActive: { type: Boolean},
        createdBy: { type: String},
        createdDate: { type: Date},
        updatedBy: { type: String},
        updatedDate: { type: Date},
       
        Schedule: [
            {
                seriallNo: { type: Number },  
                Date: { type: Date},
                viewCountLimit: { type: Number},
                currentViewCount: { type: Number},
                viewedProfiles: { type: String},
                downloadCountLimit: { type: Number},
                currentDownloadCount: { type: Number},
                downloadedProfiles: { type: String},
                viewImageCountLimit:{type:Number},
                currentViewImageCount:{type: Number},
                viewedImages:{type:String},
                status: { type: String},
                viewedProfile:[],
                downloadedProfile:[]
            }],
    }],

},
)

module.exports = mongoose.model('PUPlanSchedule', PUPlanSchedule)