const mongoose = require('mongoose')
const multipleUserAccess = mongoose.Schema({
email: {
    type: String,
    require: [true]
}
})
module.exports = mongoose.model('multipleuseraccess', multipleUserAccess)