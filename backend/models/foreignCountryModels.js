const mongoose = require('mongoose')

const ForeignSchema = mongoose.Schema({
    order:{
    type: Number,
    require:[true]
},
foreignCountry:{
    type: String,
    require:[true]
}
})
module.exports = mongoose.model('ForeignCountry', ForeignSchema)