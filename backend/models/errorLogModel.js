const mongoose = require('mongoose')
const User = require('./userModel')

const unhandleErrorSchema = mongoose.Schema({
    userName: {
        type: String,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:User
    },
    errorMessage: {
        type: String,
    },
    errorName: {
        type: String,
    },
    errorStack: {
        type: String,
    },
    createdDate: {
        type: Date,
    },
    errorObject: {
        type: Object,
    },
})

module.exports = mongoose.model('errorLog', unhandleErrorSchema)