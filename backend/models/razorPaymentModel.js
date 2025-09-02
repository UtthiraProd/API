
const mongoose = require ("mongoose")

const razorPayment = mongoose.Schema({

planId:{
    type:mongoose.Schema.Types.ObjectId,
    require:false,
},
userId:{
    type:mongoose.Schema.Types.ObjectId,
    require:false,
},
isPayment:{
    type:String,
    require:false,
},
updatedBy:{
    type : Date,
    require: false
},
updateDate:{
    type : Date,
    require: false
},
razorpayOrderId:{
    type:String,
    require:false,
},
razorpayPaymentId:{
    type:String,
    require:false,
},
razorpaySignature:{
    type:String,
    require:false,
},

},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('razorPayments',razorPayment)