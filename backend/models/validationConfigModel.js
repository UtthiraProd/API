const mongoose = require('mongoose')
const validationConfigSchema = mongoose.Schema({
    formName: {
        type: String,
    },
    fieldName: {
        type: String,
    },
    validationType: {
        type: String,
    },
    value: {
        type: String,
    },
    message: {
        type: String,
    },
})

module.exports = mongoose.model('ValidationConfig', validationConfigSchema)