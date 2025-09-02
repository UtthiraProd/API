const User = require('../models/userModel')
const ErrorLog = require('../models/errorLogModel')
const asyncHandler = require('express-async-handler')
const NODE_ENV = 'dev'

var errorfunction = {
    errorHandler:async function(err,req,res) {

         let errorMessage = err.message;
          let errorName =  err.name ;
          let errorStack =  err.stack;
          let createdDate = new Date();

        if(req!=null && req.user !=null && req.user.id!=null)
        {
          const user = await User.findById(req.user.id)
          let userName = user.name;
          let userId = req.user.id;
          const errorLog = await ErrorLog.create({
            userName,
            user:userId,
            errorMessage,
            errorName,
            errorStack,
            createdDate
        })
    }
    else
    {
        const errorLog = await ErrorLog.create({
            userName:'User not found',
            errorMessage,
            errorName,
            errorStack,
            createdDate
        })
    }
    },
    errorLogmessage:async function(logMessage,errorName) {
       
          let createdDate = new Date();
          const errorLog = await ErrorLog.create({
            userName:'captcha test user',
           // user:user.name,
           errorObject:logMessage,
            errorName:errorName,
            errorStack:'recaptcha errorStack',
            createdDate
        })
    },
   
 };
 var fieldValidationfunction = {
    ValidateFields:async function(currentValidationConfig, value) {
       
        let errorMessage = ''
    if (currentValidationConfig.validationType == 'fieldLength') {
        if (value.length > parseInt(currentValidationConfig.value)) { 

            errorMessage = currentValidationConfig.message
        }

    }
    else if (currentValidationConfig.validationType === 'phoneLength') {
    const trimmedValue = String(value).trim();
    const digitsOnly = trimmedValue.replace(/\D/g, ''); // Remove non-digit characters

    if ((digitsOnly.length > 0 && digitsOnly.length < 10)) {
        errorMessage = currentValidationConfig.message;
    }
}
else if (currentValidationConfig.validationType == 'noNumbers') {
    var format = /\d/;
    if (format.test(value)) {
        errorMessage = currentValidationConfig.message;
    }
}


    else if (currentValidationConfig.validationType == 'specialChar') {
        // var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        var format = /[!@#$%^&*()_+\-=\[\]{};'"\\|<>?~`]| {4,}/;
        if (format.test(value)) {
            errorMessage = currentValidationConfig.message
        }
    }
    else if (currentValidationConfig.validationType == 'specialCharForNotes') {
        // var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        var format = /[!@#$%^&*()_+\-=\[\]{};'"\\|<>?~`]/;

        if (format.test(value)) {
            errorMessage = currentValidationConfig.message
        }
    }
    else if (currentValidationConfig.validationType == 'email') {
        // var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        var format = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (format.test(value)) {
            errorMessage = currentValidationConfig.message
        }
    }
    else if (currentValidationConfig.validationType == 'specialFordot') {
    // Disallow all special characters except dot
    var format = /[!@#$%^&*()_+\-=\[\]{};'"\\|<>?~`]/;

    if (format.test(value)) {
        errorMessage = currentValidationConfig.message;
    }
    }


    return errorMessage
  }

 }



module.exports ={errorfunction,fieldValidationfunction}