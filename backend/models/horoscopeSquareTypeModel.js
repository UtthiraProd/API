const mongoose = require('mongoose')

const horoscopeSquareTypeSchema = mongoose.Schema({
  
    name: {
        type: String,
        require: [true, 'Please add the horoscope type'],
    },
    language: {
        type: String,
        require: [true, 'Please add the language'],
    },
})

module.exports = mongoose.model('HoroscopeSquareType', horoscopeSquareTypeSchema)