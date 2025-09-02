
const mongoose = require('mongoose')
const userRoleSchema = mongoose.Schema({
name: {
    type: String,
    require: [true, 'Please add the role']
}
})
module.exports = mongoose.model('UserRole', userRoleSchema)
