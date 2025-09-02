const mongoose = require ("mongoose")

const plan = mongoose.Schema({

    planName:{
      type: String,
      require : true
    },
    isActive:{
        type: Boolean,
        require: true
    },
    planFor:{
        type: String,
        require: true,
        enum: ['Public', 'Broker','User']
    },
    brokerName:{
        type:String,
        set: v => (v === '' ? undefined : v),
        required: false
    },
    brokerId:{
        type: mongoose.Schema.Types.ObjectId,
      set: v => (v === '' ? undefined : v),
    required: false
    },
    planPeriod:{
        type: String,
        require: true
    },
    planDuration:{
        type: Number,
        require: true
    },
    planCost:{
        type: Number,
        require: true
    },
    viewPerNoOfdays:{
        type: Number,
        require: true
    },
    viewCountLimit:{
        type: Number,
        require: true
    },
    downloadCountLimit:{
        type: Number,
        require: true
    },
    createdBy:{
        type : Date,
        require: false
    },
    createdDate:{
        type : Date,
        require: false
    },
    updatedBy:{
        type : Date,
        require: false
    },
    updateDate:{
        type : Date,
        require: false
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        require:false,
    },
    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        require:false,
    },
    viewImageCountLimit:{
        type: Number,
        require: true
    }


},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('plan',plan)