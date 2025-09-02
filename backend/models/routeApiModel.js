const mongoose = require('mongoose')
const routeApiSchema = mongoose.Schema({

route: {
    type: String,
    require: [true, 'Please add the formName']
},

apiList: [
    {
        apiUrl: { type: String },  
        apiDesc:{ type: String }
    }]

})
module.exports = mongoose.model('routeApi', routeApiSchema)