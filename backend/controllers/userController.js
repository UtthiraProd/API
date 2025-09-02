const asyncHandler = require('express-async-handler')
require("dotenv").config()
const axios = require('axios');
const express = require('express');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const JWT_SECRETE = 'Ganapathy@123'
const expire = '1d'
const User = require('../models/userModel')
const Config = require('../models/configModel')
const UserAccessMenu = require('../models/UserAccessMenuModel')
const UserRole = require('../models/userRoleModel')
const TempUserOTP = require('../models/tempUserOTPModel')
const emailsend = require('../models/emailSendModel')
const { errorfunction, fieldValidationfunction } = require('./commonController')
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const { generateRandomNumber } = require('../azureservice/commonService');
const ValidationConfig = require('../models/validationConfigModel')
const SendEmailOTP = require('../externalService/sendEmail')
const SendMobileOTP = require('../externalService/twilioSendOtp')
const MarriageProfile = require('../models/marriageProfileModel')
const PlanSchedule = require('../models/planScheduleModel')
const PublicUser = require('../models/PUMarriageProfileModel');
const MultipleUserAccess = require('../models/multipleUserAccessModel')
const Broker = require('../models/brokerModel')
const userRole = "BrokerUser"
const brokerRole = "Broker"





//const key = require('../Config/utthira-1732172606054-0a8d0bea2dfc.json');

const client = new RecaptchaEnterpriseServiceClient();

// const auth = new google.auth.GoogleAuth({
//     credentials: key,
//     scopes: 'https://www.googleapis.com/auth/cloud-platform', // Change scope as per the API you are using
// });








//added for local: start

// const { GoogleAuth } = require('google-auth-library');
// const authen = new GoogleAuth();

// async function checkCredentials() {
//   try {
//     const client = await authen.getClient();
//     console.log("Credentials successfully loaded.");
//   } catch (err) {
//     console.error("Error loading credentials:", err);
//   }
// }

//checkCredentials();

//added for local: end




/**
 * Function Description: to register a user
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const apptoCheckCaptcha = express();
apptoCheckCaptcha.disable('x-powered-by');
apptoCheckCaptcha.use(express.json());

const registerUser = asyncHandler(async (req, res) => {

    try {
        //  return res.status(500).json({ success: false, message: 'No access!!' });

        const { name, email, password, confirmPassword, phoneNumber, sex, district, DOBDate, profileFor, captchaToken } = req.body
        console.log('I came here nalini magesh1');

        if (!captchaToken) {
            return res.status(500).json({ success: false, message: 'Captcha Token is missing' });
        }

        try {
            const isValid = await verifyToken(captchaToken);

            if (isValid) {

                // if (!name || !email || !password || !phoneNumber || !confirmPassword) {
                //     res.status(200)
                //     return res.send({ "isSuccess": false, "message": "Please fill all the required fileds" })
                // }

                if(!password){
                     return res.send({ "isSuccess": false, "message": "Please enter the password" })
                }

                if(!confirmPassword){
                    return res.send({ "isSuccess": false, "message": "Please enter the confirm password" })
                }

                if (password != confirmPassword) {
                    res.status(200)
                    return res.send({ "isSuccess": false, "message": "Password mismatch" })
                }

                if (!validatePassword(password)) {
                    return res.send({ isSuccess: false, message: "Your password must be at least 8 characters long and include: an uppercase letter, a lowercase letter, a number, and a special character " })
                }

                const phoneOTP = await TempUserOTP.findOne({ phoneNumber });
                const emailOTP = await emailsend.findOne({ phoneNumber });
                var today = new Date();

                var minuteDiff = await diffMinutes(phoneOTP.updatedAt, today); //validate 30 minute diff

                if (minuteDiff > 10) {
                    res.status(200)
                    return res.send({ "isSuccess": false, "message": "Session expired. Please signup again" })
                }

                if (phoneOTP.status == "Approved" && emailOTP.status == "Approved" && minuteDiff < 10) {
                    console.log("Authorised to sign up with us");

                } else {

                    return res.send({ "isSuccess": false, "message": "Not authorised to sign up with us" })
                }


                //find if user already exists

                const userExistsByEmail = await User.findOne({ email })
                if (userExistsByEmail) {
                    res.status(400)
                    throw new Error('User email already exists')
                }

                const userExistsByPhoneNumber = await User.findOne({ phoneNumber })
                if (userExistsByPhoneNumber) {
                    res.status(400)
                    throw new Error('User phone number already exists')
                }

                //Hash password

                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(password, salt)

                const userRole = await UserRole.findOne({ name: "User" })
                //create user
                const user = await User.create({
                    name,
                    email,
                    password: hashedPassword,
                    isBroker: false,
                    phoneNumber: phoneNumber,
                    passwordTry: 0,
                    isLocked: false,
                    roleId: userRole._id,
                    lastLogginedTime: new Date(),
                    isLoggedin:true,
                    heartBeat: new Date()
                })

                if (user) {
                    const publicProfile = await PublicUser.create({
                        userId: user._id,
                        name: user.name,
                        sex: sex,
                        district: district,
                        DOB: DOBDate,
                        profileFor: profileFor,
                        phoneNumber: phoneNumber,
                        status: "Pending",
                        container: district
                    })

                    // await TempUser.deleteOne({ phoneNumber })
                    // await emailsend.deleteOne({ phoneNumber })
                    // await emailsend.deleteOne({ email })

                    return res.send({
                        "isSuccess": true, "message": "User registered successfully", "data": {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            password: user.password,
                            token: generateToken(user._id)
                        }
                    })
                }
                else {
                    res.status(400)
                    throw new console.error('Invalid user data');
                }
            }
        } catch (error) {
            return res.status(500).json({ isSuccess: false, message: 'Captcha Server error' });
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})



const registerUserByBroker = asyncHandler(async (req, res) => {

    try {

        // check here only admin can create the user
        const { name, email, password, confirmPassword, phoneNumber, sex, userCategory } = req.body
        if (!name || !email || !password || !phoneNumber || !confirmPassword || !sex) {
            res.status(200)
            return res.send({ "isSuccess": false, "message": "Please fill all the required fileds" })
        }
        const userExists = await User.findById(req.user.id)

        if (!userExists) {
            res.status(400)
            throw new Error('User not found')
        }

        if (password != confirmPassword) {
            res.status(200)
            return res.send({ "isSuccess": false, "message": "Password mismatch" })
        }

        if (!validatePassword(password)) {
            return res.send({ "isSuccess": false, "message": "Password is invalid" })
        }

        if (!isValidEmail(email)) {
            return res.send({ isSuccess: false, message: "Invalid email format" })
        }

        //find if user already exists

        const userExistsByEmail = await User.findOne({ email })
        if (userExistsByEmail) {
            return res.send({ "isSuccess": false, "message": "User email already exists" })
        }
        // const userExistsByName = await User.findOne({ name })
        // if (userExistsByName) {
        //     res.status(400)
        //     throw new Error('User name already exists')
        // }

        const userExistsByPhoneNumber = await User.findOne({ phoneNumber })

        if (userExistsByPhoneNumber) {
            // res.status(400)
            // throw new Error('User phone number already exists')
            return res.send({ "isSuccess": false, "message": "User phone number already exists" })
        }

        // const userExistsByRoleId = await User.findOne({})
        //if (userExistsByRoleId){

        // throw new Error('error founded')
        // }
        //Hash password

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userRole = await UserRole.findOne({ name: "BrokerUser" })
        //create user

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isBroker: false,
            phoneNumber: phoneNumber,
            passwordTry: 0,
            isLocked: false,
            // otp: otp,
            roleId: userRole._id,
            brokerUserId: req.user.id,
            sex: sex,
            otpUpdatedTime: new Date()
        })

        if (user) {

            // await TempUser.deleteOne({ phoneNumber })

            return res.send({
                "isSuccess": true, "message": "User registered successfully"
            })
        }
        else {
            res.status(400)
            throw new console.error('Invalid user data');
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})



/**
 * Function Description: to validate password
 * @param password - Password to validate
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

function validatePassword(password) {
    try {
        // Regular expression to validate password
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
            ;

        // At least 8 characters long
        // Contains at least one uppercase letter
        // Contains at least one lowercase letter
        // Contains at least one digit
        //Contains at least one special character

        // Test the password against the regex
        return passwordRegex.test(password);
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


/**
 * Function Description: to reset password
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */
const resetUserPassword = asyncHandler(async (req, res) => {

    try {

        const { name, email, password, confirmPassword, phoneNumber, otp, captchaToken } = req.body
        console.log('I came here nalini magesh2');

        if (!captchaToken) {
            return res.status(500).json({ success: false, message: 'Captcha Token is missing' });
        }


        try {
            const isValid = await verifyToken(captchaToken);

            if (isValid) {


                if ((!phoneNumber && (!name || !email)) || !password || !confirmPassword || !otp) {
                    res.status(200)
                    return res.send({ isSuccess: false, message: "Please include all fields" })
                }

                if (password != confirmPassword) {
                    res.status(200)
                    return res.send({ isSuccess: false, message: "Password mismatch" })
                }

                //find if user already exists
                let userExists = null;

                if (phoneNumber) {
                    userExists = await User.findOne({ phoneNumber })
                    req.user = userExists
                }


                if (!userExists || userExists == null) {
                    return res.send({ isSuccess: false, message: "User not exists.Please check the input" })
                }

                if (!validatePassword(password)) {
                    return res.send({ isSuccess: false, message: "Your password must be at least 8 characters long and include: an uppercase letter, a lowercase letter, a number, and a special character" })
                }


                let tempUserOTP = null;
                if (phoneNumber && userExists)
                    tempUserOTP = await TempUserOTP.findOne({ phoneNumber })



                const configPasswordTryCount = await Config.findOne({ key: "ResetPasswordTryCount" })

                const configPasswordTryWaitingTimeInMinute = await Config.findOne({ key: "PasswordTryWaitingTimeInMinute" })



                let waitingTimeInMinute = parseInt(configPasswordTryWaitingTimeInMinute.value);
                let passwordTryCount = parseInt(configPasswordTryCount.value)

                var today = new Date();
                var minuteDiff = waitingTimeInMinute - diffMinutes(tempUserOTP.UpdatedTime, today); //validate 30 minute diff
                //let minuteDiff = diffMinutes(userExists.otpUpdatedTime,new Date());

                if (tempUserOTP.passwordTry > passwordTryCount && userExists.isLocked == true && minuteDiff > 0) {
                    return res.send({ isSuccess: false, message: "Your account is locked.Please try after " + minuteDiff + " minute(s)" })
                }

                if (otp != tempUserOTP.otp) {
                    let invalidTry
                    let message

                    invalidTry = userExists.passwordTry + 1

                    if (invalidTry <= passwordTryCount) {


                        await User.findByIdAndUpdate(userExists._id, {
                            $set: {
                                "passwordTry": invalidTry,
                            }
                        }
                            , {
                                new: true, useFindAndModify: false
                            }
                        )
                        message = 'Invalid OTP.Your account will lock ' + configPasswordTryWaitingTimeInMinute.value + ' min after your ' + configPasswordTryCount.value + ' invalid try.'
                        return res.send({ isSuccess: false, message: message })
                    }
                    else {
                        //await User.updateOne({phoneNumber:userExists.phoneNumber},{$set:{isLocked:true,otpUpdatedTime:new Date()}})


                        await User.findByIdAndUpdate(userExists._id, {
                            $set: {
                                "otpUpdatedTime": new Date(),
                                "isLocked": true,

                            }
                        }
                            , {
                                new: true, useFindAndModify: false
                            }
                        )

                        message = "Your account is locked please rest your password after " + configPasswordTryWaitingTimeInMinute.value + " minutes."
                        return res.send({ isSuccess: false, message: message })
                    }

                }

                if (userExists) {
                    //Hash password
                    const salt = await bcrypt.genSalt(10)
                    const hashedPassword = await bcrypt.hash(password, salt)
                    //const user = await User.update({phoneNumber:phoneNumber},{$set:{password:hashedPassword}})

                    await User.findByIdAndUpdate(userExists._id, {
                        $set: {
                            "password": hashedPassword,
                            "isLocked": false,
                            "passwordTry": 0,
                            updatedBy: req.user.id
                        }
                    }
                        , {
                            new: true, useFindAndModify: false
                        }
                    )

                    await TempUserOTP.deleteOne({ phoneNumber })

                    return res.send({ isSuccess: true, message: "Password reset success" })
                }
                else {
                    return res.send({ isSuccess: false, message: "User not exists" })
                }
            }

        } catch (error) {
            return res.status(500).json({ isSuccess: false, message: 'Captcha Server error' });
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})


/**
 * Function Description: to find difference in minutes
 * @param dt1 - Time 1
 * @param dt2 - Time 2
 * @returns minuteDiff - difference in minutes
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */
async function diffMinutes(dt2, dt1) {
    try {
        var diffMs = (dt2 - dt1);
        var minuteDiff = Math.abs((Math.round(((diffMs % 86400000) % 3600000) / 60000))); // minutes
        return minuteDiff;
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
}


/**
 * Function Description: to find difference in seconds
 * @param dt1 - Time 1
 * @param dt2 - Time 2
 * @returns diffMs - difference in seconds
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */
function diffSeconds(dt2, dt1) {
    try {
        var diffMs = Math.abs((dt2 - dt1) / 1000);
        return diffMs;
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
}


/**
 * Function Description: to reset password using OTP
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getResetPasswordOTP = asyncHandler(async (req, res) => {

    try {
        // send OTP to mobile functionality here.
        const { phoneNumber, captchaToken } = req.body

        for (const [key, value] of Object.entries(req.body)) {
            let arrValidation = await ValidationConfig.find({ formName: 'ResetPassword', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    throw new Error(message);

                }
            }

        }
        console.log('I came here nalini magesh3');

        if (!captchaToken) {
            return res.status(500).json({ success: false, message: 'Captcha Token is missing' });
        }

        let tempUserOTPResult;
        let tempUser;

        try {
            const isValid = await verifyToken(captchaToken);

            if (isValid) {

                const userExist = await User.findOne({ phoneNumber })

                if (!userExist) {
                    return res.send({ isSuccess: false, message: "User not exists..." })
                }
                else {
                    console.log("User exists...")
                }

                tempUser = await TempUserOTP.findOne({ phoneNumber })

                if (tempUser) {

                    const configPasswordTryCount = await Config.findOne({ key: "ResetPasswordTryCount" })

                    const configPasswordTryWaitingTimeInMinute = await Config.findOne({ key: "PasswordTryWaitingTimeInMinute" })


                    //Move all the below three variable to config table and take those from there
                    let expectedSecondsToReceiveOTP = 60;
                    let waitingTimeInMinute = parseInt(configPasswordTryWaitingTimeInMinute.value) * 60;
                    let passwordTryCount = parseInt(configPasswordTryCount.value)



                    let today = new Date();
                    let secondsDiff = expectedSecondsToReceiveOTP - diffSeconds(tempUser.UpdatedTime, today);
                    if (secondsDiff > 0) {
                        return res.send({ message: "Please wait for 1 minute OTP will receive your mobile" })
                    }

                    if (diffSeconds(tempUser.UpdatedTime, today) > waitingTimeInMinute) {
                        tempUserOTPResult = await TempUserOTP.updateOne({ phoneNumber: phoneNumber },
                            { $set: { UpdatedTime: new Date(), passwordTry: 0 } })
                    }
                    else if (tempUser.passwordTry > passwordTryCount) {
                        return res.send({ isSuccess: false, message: "You exceeded maximum attempt.Please try after 30 minutes" })
                    }
                }


                let otp = generateRandomNumber()
                await TempUserOTP.deleteOne({ phoneNumber });

                tempUserOTPResult = await TempUserOTP.create({
                    phoneNumber: phoneNumber,
                    otp: otp,
                    passwordTry: 1,
                    isLocked: false,
                    type: "ResetUser",
                    // CreatedTime: new Date(),
                    // UpdatedTime: new Date(),
                    updatedAt: new Date(),

                })

                SendMobileOTP.sendMobileOTP(phoneNumber, otp)

                //write a code to send a sms
                {
                    tempUserOTPResult = await TempUserOTP.updateOne({ phoneNumber: phoneNumber },
                        { $set: { updatedAt: new Date(), otp: otp, passwordTry: tempUser.passwordTry + 1 } })
                    //write a code to send a sms
                }

                if (tempUserOTPResult) {
                    return res.send({ isSuccess: true, message: "OTP sent to your mobile" })
                }

                else {
                    return res.send({ isSuccess: false, message: "Failed to send OTP!!!" })
                }

            }
        } catch (error) {
            return res.status(500).json({ isSuccess: false, message: 'Captcha Server error' });
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

//ForGotOTP

// function generateRamdomNumber() {
//     try {
//         return Math.floor(100000 + Math.random() * 900000)
//     }
//     catch (err) {
//         errorfunction.errorHandler(err, req, res)
//     }
// }

/**
 * Function Description: to request OTP when user forgets his username
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 14 Mar 2025
 * Update History: 
 */

const getForgotUserOTP = asyncHandler(async (req, res) => {

    try {
        // send OTP to mobile functionality here.
        const { phoneNumber, captchaToken } = req.body.data
        console.log('I came here nalini magesh4');
        for (const [key, value] of Object.entries(req.body)) {
            let arrValidation = await ValidationConfig.find({ formName: 'ForgotUser', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    throw new Error(message);

                }
            }

        }

        if (!captchaToken) {
            return res.status(500).json({ success: false, message: 'Captcha Token is missing' });
        }

        let fotgotUserOTPResult;
        let forgotuser;

        try {
            const isValid = await verifyToken(captchaToken);

            if (isValid) {
                const userExist = await User.findOne({ phoneNumber });
                if (!userExist) {
                    return res.send({ isSuccess: false, message: "User does not exist." });
                }

                forgotuser = await TempUserOTP.findOne({ phoneNumber });

                if (forgotuser) {
                    const configPasswordTryCount = await Config.findOne({ key: "ResetPasswordTryCount" });
                    const configPasswordTryWaitingTimeInMinute = await Config.findOne({ key: "PasswordTryWaitingTimeInMinute" });

                    let expectedSecondsToReceiveOTP = 60;
                    let waitingTimeInMinute = parseInt(configPasswordTryWaitingTimeInMinute.value) * 60;
                    let passwordTryCount = parseInt(configPasswordTryCount.value);

                    let today = new Date();
                    let secondsDiff = expectedSecondsToReceiveOTP - diffSeconds(forgotuser.UpdatedTime, today);
                    if (secondsDiff > 0) {
                        return res.send({ message: "Please wait for 1 minute, OTP will be sent to your mobile." });
                    }

                    if (diffSeconds(forgotuser.UpdatedTime, today) > waitingTimeInMinute) {
                        await TempUserOTP.updateOne({ phoneNumber }, { $set: { UpdatedTime: new Date(), passwordTry: 0 } });
                    } else if (forgotuser.passwordTry > passwordTryCount) {
                        return res.send({ isSuccess: false, message: "You exceeded maximum attempts. Please try after 30 minutes." });
                    }
                }

                let otp = generateRandomNumber();
                await TempUserOTP.deleteOne({ phoneNumber });

                fotgotUserOTPResult = await TempUserOTP.create({
                    phoneNumber,
                    otp,
                    passwordTry: 1,
                    isLocked: false,
                    type: "ForgotUser",
                    // CreatedTime: new Date(),
                    updatedAt: new Date(),
                });

                SendMobileOTP.sendMobileOTP(phoneNumber, otp)

                if (forgotuser) {
                    fotgotUserOTPResult = await TempUserOTP.updateOne({ phoneNumber },
                        { $set: { updatedAt: new Date(), otp, passwordTry: forgotuser.passwordTry + 1 } });
                }

                if (fotgotUserOTPResult) {
                    return res.send({ isSuccess: true, message: "OTP sent to your mobile" });
                }
                else {
                    return res.send({ isSuccess: false, message: "Failed to send OTP!" });
                }

            }

        } catch (error) {
            // errorfunction.errorHandler(err, req, res)
            return res.status(500).json({ isSuccess: false, message: 'Server error!!!' });
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})


/**
 * Function Description: to verify OTP
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 14 Mar 2025
 * Update History: 
 */

const forgotUserVerify = asyncHandler(async (req, res) => {

    try {
        const { phoneNumber, otp, captchaToken } = req.body
        console.log('I came here nalini magesh5');

        if (!captchaToken) {
            return res.status(500).json({ success: false, message: 'Captcha Token is missing' });
        }

        try {
            const isValid = await verifyToken(captchaToken);

            if (isValid) {

                if (!phoneNumber) {
                    res.status(200)
                    return res.send({ "isSuccess": false, "message": "Please Enter valid Phone Number" })
                }

                if (!otp) {
                    return res.send({ isSuccess: false, message: "OTP are required" });
                }
                const userExist = await User.findOne({ phoneNumber });
                const forgotuser = await TempUserOTP.findOne({ phoneNumber });

                // Validate OTP
                if (otp != forgotuser.otp) {
                    return res.send({ isSuccess: false, message: "Invalid OTP. Please enter the valid OTP." });
                }

                // OTP is valid: Delete OTP record and proceed
                await TempUserOTP.deleteOne({ phoneNumber });

                await emailsend.deleteOne({ phoneNumber });

                const emailSendEntry = await emailsend.create({
                    name: userExist.name,
                    email: userExist.email,
                    phoneNumber,
                })

                SendEmailOTP.SendEmailForgetUser(emailSendEntry.email)

                if (emailSendEntry) {
                    return res.send({ isSuccess: true, message: "OTP verified successfully! Email process completed." });
                }
                else {
                    return res.send({ isSuccess: false, message: "Failed to complete email process." });
                }

            }
        } catch (error) {

            return res.status(500).json({ isSuccess: false, message: 'Server error' });
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})



/**
 * Function Description: to get new OTP
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: Deepika A, 31 May 2025
 */

const getNewRegisterOTP = asyncHandler(async (req, res) => {
    try {

        let expectedSeconds = 60
        //validate 30 minute diff

        const { name, email, phoneNumber, sex, district, DOB, captchaToken } = req.body
        console.log('I came here nalini magesh6');

        for (const [key, value] of Object.entries(req.body)) {
            let arrValidation = await ValidationConfig.find({ formName: 'RegisterUser', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    throw new Error(message);
                }
            }
        }

        if (!captchaToken) {
            return res.status(500).json({ success: false, message: 'Captcha Token is missing' });
        }

        if (!isValidEmail(email)) {
            return res.send({ isSuccess: false, message: "Invalid email" })
        }

        try {
            const isValid = await verifyToken(captchaToken);
            //  const isValid = true

            if (isValid) {

                if (!name) {
                    return res.send({ isSuccess: false, message: "User name is must" })
                }
                if (!email) {
                    return res.send({ isSuccess: false, message: "Email is must" })
                }
                if (!phoneNumber) {
                    return res.send({ isSuccess: false, message: "Phone number is must" })
                }

                let tempuserExistsPhone = await User.findOne({ phoneNumber: phoneNumber })
                if (tempuserExistsPhone) {
                    res.status(200).json({ isSuccess: false, message: phoneNumber + " Already Exists" })
                    return;
                }

                let tempuserExistsEmail = await User.findOne({ email: email })
                if (tempuserExistsEmail) {
                    res.status(200).json({ isSuccess: false, message: email + " Already Exists" })
                    return;
                }

                const existsMobileOTP = await TempUserOTP.findOne({ phoneNumber });

                if (existsMobileOTP) {
                    const configPasswordTryCount = await Config.findOne({ key: "ResetPasswordTryCount" });
                    const configPasswordTryWaitingTimeInMinute = await Config.findOne({ key: "PasswordTryWaitingTimeInMinute" });

                    let expectedSecondsToReceiveOTP = 60;
                    let waitingTimeInMinute = parseInt(configPasswordTryWaitingTimeInMinute.value) * 60;
                    let passwordTryCount = parseInt(configPasswordTryCount.value);

                    let today = new Date();
                    let secondsDiff = expectedSecondsToReceiveOTP - diffSeconds(existsMobileOTP.UpdatedTime, today);
                    if (secondsDiff > 0) {
                        return res.send({ message: "Please wait for 1 minute, OTP will be sent to your mobile." });
                    }

                    if (diffSeconds(existsMobileOTP.UpdatedTime, today) > waitingTimeInMinute) {
                        await TempUserOTP.updateOne({ phoneNumber }, { $set: { UpdatedTime: new Date(), passwordTry: 0 } });
                    } else if (existsMobileOTP.passwordTry > passwordTryCount) {
                        return res.send({ isSuccess: false, message: "You exceeded maximum attempts. Please try after 30 minutes." });
                    }
                }

                let otp = generateRandomNumber()
                // let emailotp = generateRamdomNumber()

                await TempUserOTP.deleteOne({ phoneNumber })
                // await emailsend.deleteOne({ email })
                // await emailsend.deleteOne({ phoneNumber })

                const tempUser = await TempUserOTP.create({
                    name,
                    email,
                    passwordTry: 0,
                    phoneNumber: phoneNumber,
                    isLocked: false,
                    otp: otp,
                    type: "RegisterUser",
                    status: "New"
                })
                SendMobileOTP.sendMobileOTP(phoneNumber, otp)


                return res.status(200).json({ message: "OTP sent to your mobile number." });
            }
        } catch (error) {
            errorfunction.errorHandler(err, req, res)
            return res.status(500).json({ isSuccess: false, message: 'Captcha Server error' });
        }
    }


    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }


})

/**
 * Function Description: to verify OTP while signing up
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 15 Mar 2025
 * Update History: 
 */

const VerifyRegisterOTP = (async (req, res) => {
    try {

        const { name, phoneNumber, otp, email, captchaToken } = req.body;
        console.log('I came here nalini magesh7');

        for (const [key, value] of Object.entries(req.body)) {
            let arrValidation = await ValidationConfig.find({ formName: 'RegisterUser', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    throw new Error(message);
                }
            }
        }

        if (!captchaToken) {
            return res.status(500).json({ success: false, message: 'Captcha Token is missing' });
        }

        try {
            const isValid = await verifyToken(captchaToken);
            // const isValid = true

            if (isValid) {
                if (!otp) {
                    return res.send({ isSuccess: false, message: "OTP both are required" });
                }

                const phoneOTP = await TempUserOTP.findOne({ phoneNumber });

                // Get OTP expiry time
                const config = await Config.findOne({ key: 'VerifyMobileOTPWaitingTimeInMinute' });
                const expiryMinutes = config?.value || 3; // default to 3 minutes if not found
                // Check if OTP expired
                const otpCreatedAt = new Date(phoneOTP.createdAt);
                const expiryTime = otpCreatedAt.getTime() + expiryMinutes * 60 * 1000;

                if (Date.now() > expiryTime) {
                    return res.send({ isSuccess: false, message: `OTP expired. It is only valid for ${expiryMinutes} minutes.` });
                }


                if (otp == phoneOTP.otp && phoneOTP.status == "New") {
                    //Changing status from New to Approved after OTP verification
                    await TempUserOTP.updateOne({ phoneNumber: phoneNumber }, { $set: { status: "Approved" } });
                }
                else {
                    return res.send({ isSuccess: false, message: "Invalid OTP. Please enter the correct OTP." });
                }
                // Phone OTP is correct, generate email OTP
                const emailotp = generateRandomNumber();
                await emailsend.deleteOne({ phoneNumber: phoneNumber });
                await emailsend.deleteOne({ email: email });

                await emailsend.create({
                    name,
                    email,
                    phoneNumber: phoneNumber,
                    emailSubject: "User Register OTP",
                    emailBody: "Your OTP will expired 10 minutes",
                    emailotp,
                    status: "New"
                });

                SendEmailOTP.SendEmailOTP(email, emailotp)

                return res.send({ isSuccess: true, message: "Phone Number verified. OTP sent to your email." });

            }
        } catch (error) {
            return res.status(500).json({ isSuccess: false, message: 'Captcha Server error' });
        }

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


const verifyRegEmailOTP = (async (req, res) => {
    try {
        const { phoneNumber, email, emailotp, captchaToken } = req.body

        for (const [key, value] of Object.entries(req.body)) {
            let arrValidation = await ValidationConfig.find({ formName: 'RegisterUser', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    throw new Error(message);
                }
            }
        }

        if (!captchaToken) {
            return res.status(500).json({ success: false, message: 'Captcha Token is missing' });
        }

        try {
            const isValid = await verifyToken(captchaToken);
            // const isValid = true

            if (isValid) {
                if (!emailotp) {
                    return res.send({ isSuccess: false, message: "OTP are required" });
                }

                const email = await emailsend.findOne({ phoneNumber });

                // Get OTP expiry time
                const config = await Config.findOne({ key: 'VerifyEmailOTPWaitingTimeInMinute' });
                const expiryMinutes = config?.value || 11; // default to 10 minutes if not found

                // Check if OTP expired
                const otpCreatedAt = new Date(email.createdAt);
                const expiryTime = otpCreatedAt.getTime() + expiryMinutes * 60 * 1000;

                if (Date.now() > expiryTime) {
                    return res.send({ isSuccess: false, message: "OTP expired. Please Try Again." });
                }

                if (emailotp == email.emailotp && email.status == "New") {
                    //Changing status from New to Approved after OTP verification
                    await emailsend.updateOne({ phoneNumber: phoneNumber }, { $set: { status: "Approved" } });
                    return res.send({ isSuccess: true, message: "OTP Verified Successfully..!!" });
                }
                else {
                    return res.send({ isSuccess: false, message: "Invalid OTP. Please enter the correct OTP." });
                }
            }
        }
        catch (error) {
            return res.status(500).json({ isSuccess: false, message: 'Captcha Server error' });
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

/**
 * Function Description: to create plan schedule
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Deepika A, 21 June 2025
 * Update History: 
 */


const resentEmailOTP = async (req, res) => {
    try {
        const { name, phoneNumber, email, captchaToken } = req.body.data

        if (!captchaToken) {
            return res.status(400).json({ success: false, message: 'Captcha Token is missing' });
        }

        try {
            const isValid = await verifyToken(captchaToken);

            if (isValid) {
                const phoneOTP = await TempUserOTP.findOne({ phoneNumber: phoneNumber });

                if (phoneOTP.status === "Approved") {

                    // Check if an OTP was sent recently (within 60 seconds)
                    const lastEmailOtp = await emailsend.findOne({ phoneNumber })

                    let createdAt = lastEmailOtp.createdAt

                    if (lastEmailOtp) {
                        const currentTime = new Date();
                        const timeDiff = (currentTime - createdAt) / 1000; // in seconds

                        if (timeDiff < 60) {
                            return res.status(200).json({
                                isSuccess: false,
                                message: "Please wait..!Try again after 1 minute.",
                            });
                        }
                    }
                    const emailotp = generateRandomNumber();

                    await emailsend.deleteMany({ $or: [{ phoneNumber }, { email }] });

                    await emailsend.create({
                        name,
                        email,
                        phoneNumber,
                        emailSubject: "User Register OTP",
                        emailBody: "Your OTP will expire in 10 minutes",
                        emailotp,
                        status: "New",
                    });
                    SendEmailOTP.SendEmailOTP(email, emailotp)

                    return res.status(200).json({ isSuccess: true, message: "OTP resent to your email." });
                } else {
                    return res.status(400).json({ isSuccess: false, message: "Phone OTP not approved." });
                }
            }
        }
        catch (error) {
            return res.status(500).json({ isSuccess: false, message: 'Captcha Server error' });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};




const verifyToken = async (token) => {
    const [assessment] = await client.createAssessment({
        parent: `projects/utthira-1732172606054`,
        assessment: {
            event: {
                token: token,
                siteKey: '6LfOt60qAAAAAC7D3mqw1FwDQVGDcsWUwTX8PXXy',
            },
        },
    });

    // Check the assessment score and take appropriate action
    if (assessment.tokenProperties.valid) {
        if (assessment.riskAnalysis.score >= 0.5) {
            console.log(assessment.riskAnalysis.score);
            // The request is likely legitimate
            return true;
        } else {
            // The request is potentially risky
            return false;
        }
    } else {
        // The token is invalid
        return false;
    }
};

/**
 * Function Description: to generate token
 * @param id - 
 * @returns - generated token
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const generateToken = (id) => {
    try {
        return jwt.sign({ id }, JWT_SECRETE, {
            expiresIn: expire
        })
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
}

/**
 * Function Description: to get user menu by passing id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getUserMenuDetailsById = asyncHandler(async (req, res) => {

    try {
        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }

        //     const{userId} = req.body

        const _userAccessMenuDetail = await UserAccessMenu.findOne({ roleId: user.roleId });

        //     if(!_userAccessMenuDetail){
        //         res.status(404)
        //         throw new Error('menu details not found')
        //     }

        res.status(200).json(_userAccessMenuDetail)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})


/**
 * Function Description: to login
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */


const loginUser = asyncHandler(async (req, res) => {
    try {
        console.log('I came here nalini magesh8');
        const { email, password, captchaToken, token} = req.body

        if (!captchaToken) {

            return res.status(500).json({ success: false, message: 'Captcha Token is missing' });
        }
        // let logmessage = "secret:" + process.env.RECAPTCHA_SECRET_KEY + ";captchavalue:"+captchaToken
        //errorfunction.errorLogmessage(logmessage,'logmessage',user)

        try {
            const isValid = await verifyToken(captchaToken);
            // const isValid = true

            // errorfunction.errorLogmessage(process.env.RECAPTCHA_SECRET_KEY,'process.env.RECAPTCHA_SECRET_KEY',user)
            //let logmessage = "secret:" + process.env.RECAPTCHA_SECRET_KEY + ";captchavalue:"+captchaToken
            //errorfunction.errorLogmessage(response.data.success,'responsesuccess',user)

            if (isValid) {

                const user = await User.findOne({ email })
                errorfunction.errorLogmessage('req.body', 'inputdata', user)
                if (!user) {
                    res.status(400)
                    return res.send({ isSuccess: false, message: "User not found", data: {} })
                }

                if (user.isLocked) {
                    res.status(200)
                    res.send({ isSuccess: false, message: "Your account is locked.Please reset password and proceed.", data: {} })
                    return;
                }

                const _userRoles = await UserRole.findOne({ _id: user.roleId });

                if(_userRoles.name == brokerRole){
                    const isActive = await Broker.findOne({userId:user._id})
      
                    if(isActive.isActive !== true ){
                        return res.status(200).json({isSuccess:false,message:"Please contact your Utthira broker serivce"})
                    }
                }

                if (_userRoles.name == userRole) {
                    const _plan = await PlanSchedule.findOne({ profileID: user.profileId })

                    if (!_plan) {
                        return res.status(200).json({ isSuccess: false, message: 'Please contact broker to select the plan..' });
                    }

                    else if(_plan) {
                        
                        const profile = await MarriageProfile.findOne({_id:user.profileId})

                        const planId = profile.planID;

                         const _plan = await PlanSchedule.findOne({
                              profileID: profile._id,
                             'planSchedule.planID': planId
                        });

                        if (_plan && _plan.planSchedule && _plan.planSchedule.length > 0) {
                           const firstSchedule = _plan.planSchedule[0];
                           const expiryDate = new Date(firstSchedule.expiryDate);
                           const todayDate = new Date();
    
                        if(todayDate >= expiryDate) {
                           return res.status(200).json({ isSuccess: false, message: 'Your plan expired please contact broker..' });
                         }
                       }
                    }
                }

                const multipleUsers = await MultipleUserAccess.findOne({ email: user.email });

                var today = new Date();
                let isAllowLoginByTime = false

                var minuteDiff = await diffMinutes(user.lastLogginedTime, today); //validate 30 minute diff

                const SessionTimeInMinute = await Config.findOne({ key: "SessionTimeInMinute" })

                const diffInMinutes = await diffMinutes(user.heartBeat, today)
                const SessionLoginTimeInMinute = await Config.findOne({key:"SessionLoginTimeInMinute"})

                if (multipleUsers) {            
                    if (email === multipleUsers.email) {
                        isAllowLoginByTime = true
                    }
                }

               if (!multipleUsers && user.isLoggedin === true) {
             
                              if(token){
                    
                                   const decoded = jwt.verify(token, JWT_SECRETE);
                                   const tokenUser = await User.findById(decoded.id).select('-password');                              

                                if(tokenUser){
                                 if (tokenUser.email === user.email) {
                                    isAllowLoginByTime = true;
                                  }

                                else{
                                     if (diffInMinutes >= parseInt(SessionLoginTimeInMinute.value)) {
                                       isAllowLoginByTime = true;
                                    }
                                    else {
                                    return res.status(201).json({ isSuccess: false, message: 'Your Account is already logged in please try again after ' + (SessionLoginTimeInMinute.value - diffInMinutes) + ' minutes' });
                                    }
                                   }
                                }                   
                            }
                               else{
                                    if (!token && diffInMinutes >= parseInt(SessionLoginTimeInMinute.value)) {
                                     isAllowLoginByTime = true
                                 }
                                 else {
                                     return res.status(201).json({ isSuccess: false, message: 'Your Account is already logged in please try again after ' + (SessionLoginTimeInMinute.value - diffInMinutes) + ' minutes' });
                                 }
                                //   if (minuteDiff >= SessionTimeInMinute.value && !token && diffInMinutes >= parseInt(SessionLoginTimeInMinute.value)) {
                                //     console.log("Not token")
                                //      isAllowLoginByTime = true
                                //  }
                                //  else {
                                //     console.log("session error")
                                //      return res.status(201).json({ isSuccess: false, message: 'Your session locked please try again after ' + (SessionTimeInMinute.value - minuteDiff) + ' minutes' });
                                //  }
                              }
                               
                             }
                             else {
                                 isAllowLoginByTime = true
                                 await User.updateOne({ email: email }, { $set: { isLoggedin: true, lastLogginedTime: new Date() } })
                             }   




                //return res.status(200).json({ success: true, message: 'Verification passed' });
                if (user && (await bcrypt.compare(password, user.password)) && isAllowLoginByTime) {

                    if (user) {
                        user.passwordTry = 0;
                        await user.save(); // this persists the change

                        await User.updateOne(
                         { email: email },
                         { $set: { isLoggedin: true,heartBeat: new Date() } })
                    }                   
                    
                    return res.send({
                        isSuccess: true, message: "",
                        data: {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            role: _userRoles.name,
                            brokerId: user.brokerId,
                            token: generateToken(user._id),
                            isLoggedin:true
                        },
                        logout: user._id,
                    })
                }

                else {
                    let _passwordTry = user.passwordTry + 1
                    await User.updateOne({ email: email }, { $set: { passwordTry: _passwordTry } })
                    if (_passwordTry > 10) {
                        await User.updateOne({ email: email }, { $set: { isLocked: true } })
                        res.status(200)
                        return res.send({ isSuccess: false, message: "Your account is locked.Please reset password and proceed.", data: {} })
                    }

                    else {
                        res.status(200)
                        return res.send({ isSuccess: false, message: "Invalid credentials.", data: {} })
                    }
                }
            }
            else {
                const user1 = await User.findOne({ email })
                // console.log(response.data['error-codes'][0])
                //return res.status(500).json({ isSuccess: false, message: 'Captcha Verification failed' });
                errorfunction.errorLogmessage(response.data['error-codes'], 'error code', user1)
                return res.status(400).send({ isSuccess: false, message: response.data['error-codes'] });
            }

        }


        catch (error) {
            // errorfunction.errorHandler(err, req, res)
            return res.status(500).json({ isSuccess: false, message: 'Server error!!!' });
        }


        //Check the user and password match

        //command start

        //command end


    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


const logoutTrue = asyncHandler(async (req, res) => {

    try {
        const { _id, isLoggedin } = req.body

        var updateAgainst = { _id: _id }
        var newvalues = { $set: { isLoggedin: isLoggedin } }

        const _logout = await User.updateOne(updateAgainst, newvalues)

        if (_logout) {
            return res.status(200).json({ isSuccess: true })
        }
    }

    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

const activeUser = asyncHandler(async(req,res)=>{
    try{
        const user = await User.findById(req.user.id)
        console.log("hiii user")

        const {userId} = req.body
        if(!user){
            return
        }  

        const update = await User.findByIdAndUpdate(
            {_id:user.id},
            {$set:{
                heartBeat:new Date()
            }}
        )

        if(update){
            return res.status(200).json({isSuccess: true})
        }
    }

    catch(err){
 errorfunction.errorHandler(err, req, res)
    }
})

module.exports = {
    registerUser,
    loginUser,
    getUserMenuDetailsById,
    resetUserPassword,
    getNewRegisterOTP,
    getResetPasswordOTP,
    registerUserByBroker,
    getForgotUserOTP,
    forgotUserVerify,
    VerifyRegisterOTP,
    verifyRegEmailOTP,
    resentEmailOTP,
    logoutTrue,
    activeUser
}
