const mongoose = require('mongoose')
const User = require('../models/userModel')
const UserRole = require('../models/userRoleModel')
const auditLogSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: User
    },

    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        require: [true],
        ref: UserRole
    },

    collectionId: {  //unique id(_id) for the collection
        type: mongoose.Schema.Types.ObjectId,
        require: [true]
    },

    collectionName: {
        type: String,
        required: true
    },

    action: {
        type: String,
        require: [true],
        Enum: ['Create', 'Update', 'Delete', 'File Upload']
    },

    description: {
        type: String,
        require: [true]
    },
    api: {
        type: String,
        require: [true]
    },
    functionName: {
        type: String,
        require: [true]
    },
    priority: {  //Based on the priority we will keep the duration of the log ex) 1 for 6 month,2 for 3 month
        type: Number,
        require: [true]
    },
    changes: {
        before: mongoose.Schema.Types.Mixed, // store old values
        after: mongoose.Schema.Types.Mixed   // store new values
    },

    ipAddress: { //get it from req.ip
        type: String,
        required: true
    },

    userAgent: { //get it from req.ip
        type: String,
        required: true
    },

    // createdAt: {
    //     type: Date,
    //     default: Date.now,
    //     expires: '180d'  // MongoDB TTL index
    // }

},
    {
        timestamps: true,
    })

module.exports = mongoose.model('auditLog', auditLogSchema)