const asyncHandler = require('express-async-handler')
require("dotenv").config()
const axios = require('axios');
const express = require('express');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const JWT_SECRETE = 'Ganapathy@123'
const expire = '1d'
const User = require('../../models/userModel')
const Config = require('../../models/configModel')
const UserRole = require('../../models/userRoleModel')
const TempUserOTP = require('../../models/tempUserOTPModel')
const emailsend = require('../../models/emailSendModel')
const { errorfunction, fieldValidationfunction } = require('../commonController')
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const ValidationConfig = require('../../models/validationConfigModel')
const SendEmailOTP = require('../../externalService/sendEmail')
const SendMobileOTP = require('../../externalService/twilioSendOtp')
const MarriageProfile = require('../../models/marriageProfileModel')
const Broker = require('../../models/brokerModel')


//const key = require('../Config/utthira-1732172606054-0a8d0bea2dfc.json');

const client = new RecaptchaEnterpriseServiceClient();

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


function generateRamdomNumber() {
    try {
        return Math.floor(100000 + Math.random() * 900000)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
}


const getBrokerUserOTP = asyncHandler(async (req, res) => {
    try {
        
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(401).json({ isSuccess: false, message: 'User not found' });
            return;
        }
        else if(user.isLoggedin !== true)
        {
           res.status(404)
           throw new Error('User not logged in')
        }

        const isActive = await Broker.findOne({userId:user._id})
                        
        if(isActive.isActive !== true ){
            throw new Error('Broker isActive is false')
        }

        let expectedSeconds = 60

        const { name, email, phoneNumber, profID } = req.body.data

        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'RegisterUser', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }
            }
        }

        if (!email) {
            return res.send({ isSuccess: false, message: "Email is must" })
        }
        if (!phoneNumber) {
            return res.send({ isSuccess: false, message: "Phone number is must" })
        }

        if (!isValidEmail(email)) {
            return res.send({ isSuccess: false, message: "Invalid email format" })
        }

        let tempuserExistsPhone = await User.findOne({ phoneNumber: phoneNumber })
        if (tempuserExistsPhone) {
            res.status(200).json({ isSuccess: false, message: phoneNumber + " Already Exists" })
            return;
        }

        if (tempuserExistsPhone) {
            let today = new Date();
            let secondsDiff = expectedSeconds - diffSeconds(tempuserExistsPhone.UpdatedTime, today);
            if (secondsDiff > 0) {
                return res.send({ message: "Please wait for 1 minute OTP will receive your mobile" })
            }
        }

        let tempuserExistsEmail = await User.findOne({ email: email })
        if (tempuserExistsEmail) {
            res.status(200).json({ isSuccess: false, message: email + " Already Exists" })
            return;
        }

        if (tempuserExistsEmail) {
            let today = new Date();
            let secondsDiff = expectedSeconds - diffSeconds(tempuserExistsEmail.UpdatedTime, today);
            if (secondsDiff > 0) {
                return res.send({ message: "Please wait for 1 minute OTP will receive your Email" })
            }
        }

        let otp = generateRamdomNumber()
        let emailotp = generateRamdomNumber()

        await TempUserOTP.deleteOne({ phoneNumber })
        await emailsend.deleteOne({ email })
        await emailsend.deleteOne({ phoneNumber })
        
        const tempUser = await TempUserOTP.create({
            name,
            email,
            passwordTry: 0,
            phoneNumber: phoneNumber,
            isLocked: false,
            otp: otp,
            type: "BrokerUserRegister",
            status: "New",
            createdBy: req.user.id,
        })

        const Emailsend = await emailsend.create({
            name,
            email,
            phoneNumber: phoneNumber,
            emailSubject: "User Register OTP",
            emailBody: "Your OTP will expired 10 minutes",
            emailotp: emailotp,
            status: "New",
            createdBy: req.user.id,
        })

        SendEmailOTP.SendEmailOTP(email, emailotp)
        SendMobileOTP.sendMobileOTP(phoneNumber, otp)

        res.status(200).json({ message: "OTP sent to your mobile && email Address" })
    }

    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


const brokerUserOTPVerify = (async (req, res) => {

    try {

          const user = await User.findById(req.user.id);

        if (!user) {
            res.status(401).json({ isSuccess: false, message: 'User not found' });
            return;
        }
        else if(user.isLoggedin !== true)
        {
           res.status(404)
           throw new Error('User not logged in')
        }

        const isActive = await Broker.findOne({userId:user._id})
                        
        if(isActive.isActive !== true ){
            throw new Error('Broker isActive is false')
        }

        const { phoneNumber, email, otp, emailotp } = req.body.data;

        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'RegisterUser', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }
            }
        }

        if (!otp && !emailotp) {
            return res.send({ isSuccess: false, message: "OTP both are required" });
        }

        const UserPhoneNumber = await TempUserOTP.findOne({ phoneNumber });
        const UserEmail = await emailsend.findOne({ email });
        
        if(!UserPhoneNumber || !UserEmail){
             return res.send({ isSuccess: false, message: "User not found" });
        }

        if (String(otp) !== String(UserPhoneNumber.otp) || UserPhoneNumber.status !== "New") {
             return res.send({ isSuccess: false, message: "Invalid Mobile OTP" });
        }

        if (String(emailotp) !== String(UserEmail.emailotp) || UserEmail.status !== "New") {
             return res.send({ isSuccess: false, message: "Invalid Email OTP" });
        }

        await TempUserOTP.updateOne({ phoneNumber: phoneNumber }, { $set: { status: "Approved" } });
        await emailsend.updateOne({ phoneNumber: phoneNumber }, { $set: { status: "Approved" } });

        return res.send({ isSuccess: true, message: "OTP verified successfully!" });

        // if (otp == UserPhoneNumber.otp && UserPhoneNumber.status == "New" && emailotp == UserEmail.emailotp && UserEmail.status == "New") {
        //     //Changing status from New to Approved after OTP verification
        //     await TempUserOTP.updateOne({ phoneNumber: phoneNumber }, { $set: { status: "Approved" } });
        //     await emailsend.updateOne({ phoneNumber: phoneNumber }, { $set: { status: "Approved" } });
        //     return res.send({ isSuccess: true, message: "OTP verified successfully!" });
        // }
        // else {
        //     return res.send({ isSuccess: false, message: "Invalid OTP. Please enter the correct OTP." });
        // }
    }

    catch (err) {
        console.log(err)
        errorfunction.errorHandler(err, req, res)
    }
})

const userLoginCreate = asyncHandler(async (req, res) => {

    try {
        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if(user.isLoggedin !== true)
        {
           res.status(404)
           throw new Error('User not logged in')
        }

        const isActive = await Broker.findOne({userId:user._id})
                        
        if(isActive.isActive !== true ){
            throw new Error('Broker isActive is false')
        }

        const { email, password, confirmPassword, phoneNumber, profID } = req.body.data

        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'RegisterUser', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }
            }
        }

        if (!password || !confirmPassword) {
            res.status(200)
            return res.send({ "isSuccess": false, "message": "Please fill all the required fileds" })
        }

        if (!validatePassword(password)) {
            return res.send({ isSuccess: false, message: "Your password must be at least 8 characters long and include: an uppercase letter, a lowercase letter, a number, and a special character" })
        }

        if (password != confirmPassword) {
            res.status(200)
            return res.send({ "isSuccess": false, "message": "Password mismatch" })
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
        const userId = await User.findOne({ profileId: profID })

        if (userId) {
            return res.send({ isSuccess: false, message: userId.name + " Already Exists" })
        }
        const userEmail = await User.findOne({ email: email })
        if (userEmail) {
            return res.send({ isSuccess: false, message: "Already Exists" })
        }

        const userphoneNumber = await User.findOne({ phoneNumber: phoneNumber })
        if (userphoneNumber) {
            return res.send({ isSuccess: false, message: "Already Exists" })
        }

        // //Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userProfile = await MarriageProfile.findById(profID)

        const userRole = await UserRole.findOne({ name: "BrokerUser" })

        const createLogin = await User.create({
            name: userProfile.name,
            phoneNumber: phoneNumber,
            email: email,
            isBroker: false,
            password: hashedPassword,
            roleId: userRole._id,
            brokerId: userProfile.brokerId,
            profileId: userProfile._id,
            passwordTry: 0,
            isLocked: false,
            createdBy: req.user.id,
            updatedBy: req.user.id,
            lastLogginedTime: new Date(),
            isLoggedin:true,
            heartBeat: new Date()
        })

        res.status(200).json({ isSuccess: true, message: "User Created Successfully..!!" })
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
    console.log('testttt')
    return emailRegex.test(email);
}

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
//  */

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


module.exports = {
    getBrokerUserOTP,
    brokerUserOTPVerify,
    userLoginCreate,
}