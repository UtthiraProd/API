const mongoose = require('mongoose')
const UserRole = require('./userRoleModel')
const userAccessMenuSchema = mongoose.Schema({
    roleld:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:UserRole
    },
    menuDetails:[]
})

module.exports = mongoose.model('UserAccessMenu', userAccessMenuSchema)