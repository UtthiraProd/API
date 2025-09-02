const mongoose = require('mongoose')
const UserRole = require('./userRoleModel')
const userAccessApiRoleSchema = mongoose.Schema({

roleld:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:UserRole
    },

routeApiIds: []

})
module.exports = mongoose.model('userAccessApiRole', userAccessApiRoleSchema)
