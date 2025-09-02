const asyncHandler = require('express-async-handler')
require("dotenv").config()
const axios = require('axios');
const express = require('express');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const JWT_SECRETE = 'Ganapathy@123'
const expire = '1d'
const User = require('../models/userModel')
const UserAccessMenu = require('../models/UserAccessMenuModel')
const UserRole = require('../models/userRoleModel')
const TempUser = require('../models/tempUserOTPModel')
const { errorfunction } = require('./commonController')
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');

const { google } = require('googleapis');
const key = require('../Config/utthira-1732172606054-0a8d0bea2dfc.json');

const client = new RecaptchaEnterpriseServiceClient();

const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: 'https://www.googleapis.com/auth/cloud-platform', // Change scope as per the API you are using
});

console.log(auth);

// Instantiate the Cloud Storage client
const storage = google.storage('v1');

// Example: List buckets in the project
async function listBuckets() {
  const authClient = await auth.getClient();
  const projectId = await auth.getProjectId();
  
  const res = await storage.buckets.list({
    auth: authClient,
    project: projectId
  });

  console.log('Buckets:', res.data.items);
}

listBuckets().catch(console.error);


//added to test

const { GoogleAuth } = require('google-auth-library');
const authen = new GoogleAuth();

async function checkCredentials() {
  try {
    const client = await authen.getClient();
    console.log("Credentials successfully loaded.");
  } catch (err) {
    console.error("Error loading credentials:", err);
  }
}

checkCredentials();

//added to test



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

        // check here only admin can create the user
        const { name, email, password, confirmPassword, phoneNumber } = req.body

        // if (!name || !email || !password || !phoneNumber || !confirmPassword || !otp) {
        if (!name || !email || !password || !phoneNumber || !confirmPassword) {
            res.status(200)
            return res.send({ "isSuccess": false, "message": "Please fill all the required fileds" })
        }

        if (password != confirmPassword) {
            res.status(200)
            return res.send({ "isSuccess": false, "message": "Password mismatch" })
        }

        if (validatePassword(password)) {

            // tempuserRegister = await TempUser.findOne({ phoneNumber })

            // if (!tempuserRegister) {
            //     return res.send({ "isSuccess": false, "message": "Please get OTP and proceed" })
            // }


            // if (otp != tempuserRegister.otp) {
            //     return res.send({ "isSuccess": false, "message": "Invalid OTP" })
            // }

        } else {
            
            return res.send({ "isSuccess": false, "message": "Password is invalid" })
        }


        //find if user already exists

        const userExistsByEmail = await User.findOne({ email })
        if (userExistsByEmail) {
            res.status(400)
            throw new Error('User email already exists')
        }

        const userExistsByName = await User.findOne({ name })
        if (userExistsByName) {
            res.status(400)
            throw new Error('User name already exists')
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
            // otp: otp,
            //roleId: userRole._id,
            otpUpdatedTime: new Date()
        })

        if (user) {

        // await TempUser.deleteOne({ phoneNumber })

            return res.send({
                "isSuccess": true, "message": "User registered successfully", "data": {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id)
                }
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

const registerUserByBroker = asyncHandler(async (req, res) => {

    try {

        // check here only admin can create the user
        const { name, email, password, confirmPassword, phoneNumber,sex,userCategory } = req.body
     console.log(req.body)
        // if (!name || !email || !password || !phoneNumber || !confirmPassword || !otp) {
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

        if (validatePassword(password)) {

        } else {
            
            return res.send({ "isSuccess": false, "message": "Password is invalid" })
        }
        console.log('mani')

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
        console.log(userExistsByPhoneNumber)
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
            brokerUserId:req.user.id,
            sex:sex,
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
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        // At least 8 characters long
        // Contains at least one uppercase letter
        // Contains at least one lowercase letter
        // Contains at least one digit

        // Test the password against the regex
        return passwordRegex.test(password);
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
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
   
        const { name, email, password, confirmPassword, phoneNumber, otp } = req.body

        if ((!phoneNumber && (!name || !email)) || !password || !confirmPassword || !otp) {
            res.status(200)
            return res.send({isSuccess:false,message: "Please include all fields"})
        }

        if (password != confirmPassword) {
            res.status(200)
            return res.send({isSuccess:false, message: "Password mismatch"})
        }

        //find if user already exists
        let userExists =null;

        if (email)
            userExists = await User.findOne({ email })


        if(!userExists || userExists ==null) 
        {
        return res.send({isSuccess:false, message: "User not exists.Please check the input"})
        }

        if (phoneNumber && !userExists)
            userExists = await User.findOne({ phoneNumber })

        var today = new Date();
        var minuteDiff = 30 - diffMinutes(userExists.otpUpdatedTime, today); //validate 30 minute diff
        //let minuteDiff = diffMinutes(userExists.otpUpdatedTime,new Date());
        console.log(minuteDiff)
        if (userExists.passwordTry == 3 && userExists.isLocked == true && minuteDiff > 0) {
            return res.send({isSuccess:false, message: "Your account is locked.Please try after " + minuteDiff + " minute(s)"})
        }


        if (otp != userExists.otp) {
            let invalidTry
            let message

            invalidTry = userExists.passwordTry + 1

            if (invalidTry <= 100) {


                await User.findByIdAndUpdate(userExists._id, {
                    $set: {
                        "passwordTry": invalidTry,
                    }
                }
                    , {
                        new: true, useFindAndModify: false
                    }
                )
                message = 'Invalid OTP.Your account will lock 30 min after your 3rd invalid try.'
                return res.send({isSuccess:false, message: message})
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

                message = "Your account is locked please rest your password after 30 minutes."
                return res.send({isSuccess:false, message: message})
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
                    "passwordTry": 0
                }
            }
                , {
                    new: true, useFindAndModify: false
                }
            )

            return res.send({isSuccess:true, message: "Password reset success" })
        }
        else {
            return res.send({isSuccess:false, message: "User not exists" })
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
        const { name, email, phoneNumber } = req.body

        const userExist = await User.findOne({ phoneNumber })

        if (!userExist) {
            return res.send({isSuccess:false, message: "User not exists please check your input" })
        }

        let otp = generateRamdomNumber()

        await User.updateOne({ phoneNumber: phoneNumber }, { $set: { otp: otp, otpUpdatedTime: new Date() } })
        return res.send({isSuccess:true, message: "OTP sent to your mobile" })
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


/**
 * Function Description: to generate random number
 * @param - 
 * @returns - Generated random number
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

function generateRamdomNumber() {
    try {
        return Math.floor(100000 + Math.random() * 900000)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
}


/**
 * Function Description: to get new OTP
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */
const getNewRegisterOTP = asyncHandler(async (req, res) => {
    try { 

        let expectedSeconds = 60
        //validate 30 minute diff

        console.log('I came here in Recaptcha test file');

        const { name, email, phoneNumber } = req.body

        if (!name) {
            //res.status(200)
            // throw new Error('Please include all fields')
            return res.send({ message: "User name is must" })
        }
        if (!email) {
            //res.status(200)
            // throw new Error('Please include all fields')
            return res.send({ message: "Email is must" })
        }
        if (!phoneNumber) {
            //res.status(200)
            // throw new Error('Please include all fields')
            return res.send({ message: "Phone number is must" })
        }

        let tempuserExistsPhone = await TempUser.findOne({ phoneNumber })

        if (tempuserExistsPhone) {
            let today = new Date();
            let secondsDiff = expectedSeconds - diffSeconds(tempuserExistsPhone.UpdatedTime, today);
            if (secondsDiff > 0) {
                return res.send({ message: "Please wait for 1 minute OTP will receive your mobile" })
            }
        }
        // if (tempuserExistsPhone) {
        //     await TempUser.deleteOne({ phoneNumber })
        // }
        // if (tempuserExistsEmail) {
        //     await TempUser.deleteOne({ email })
        // }

        // if (tempuserExistsname) {
        //     await TempUser.deleteOne({ name })
        // }
        let otp = generateRamdomNumber()
        // if(tempuserExistsPhone)
        //     {
        //         await TempUser.updateOne({ phoneNumber: tempuserExistsPhone.phoneNumber }, { $set: { otp: otp,
        //             UpdatedTime: new Date() } })

        //      return res.send({message: "OTP sent to your mobile" })
        //     }

        await TempUser.deleteOne({ phoneNumber })

        const tempUser = await TempUser.create({
            name,
            email,
            passwordTry: 0,
            phoneNumber: phoneNumber,
            isLocked: false,
            otp: otp,
            CreatedTime: new Date(),
            UpdatedTime: new Date()
        })
        return res.send({ message: "OTP sent to your mobile" })

        // res.status(200).json({ message: "OTP sent to your mobile" })

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

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
 * Function Description: to login
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const loginUser2doneforCaptcha= asyncHandler(async (req, res) => {
    try {
        const { email, password,captchaToken } = req.body

        if (!captchaToken) {
            //return res.status(400).json({ success: false, message: 'Token is missing' });
            return res.status(500).json({ success: false, message: 'Captcha Token is missing' });
          }
          // let logmessage = "secret:" + process.env.RECAPTCHA_SECRET_KEY + ";captchavalue:"+captchaToken
          //errorfunction.errorLogmessage(logmessage,'logmessage',user)
        
          try {
            const isValid = await verifyToken(token);


           // errorfunction.errorLogmessage(process.env.RECAPTCHA_SECRET_KEY,'process.env.RECAPTCHA_SECRET_KEY',user)
            //let logmessage = "secret:" + process.env.RECAPTCHA_SECRET_KEY + ";captchavalue:"+captchaToken
            //errorfunction.errorLogmessage(response.data.success,'responsesuccess',user)
        
            if (isValid) {

                const user = await User.findOne({ email })
                console.log('I came here');
                console.log(req.body)
                errorfunction.errorLogmessage('req.body','inputdata',user)
                if (!user) {
                    res.status(400)
                    return res.send({isSuccess:false,message: "User not found" })
                }
        
                if (user.isLocked) {
                    res.status(400)
                    return res.send({isSuccess:false,message: "Your account is locked.Please reset password and proceed." })
                }
        
                const _userRoles = await UserRole.findOne({ _id: user.roleId });

              //return res.status(200).json({ success: true, message: 'Verification passed' });
              if (user && (await bcrypt.compare(password, user.password))) {

                  return res.send({isSuccess:true,message: "",
                                  data:{
                                      _id: user._id,
                                      name: user.name,
                                      email: user.email,
                                      role: _userRoles.name,
                                      token: generateToken(user._id)
                                  }
                  })
                  
              }
              else {
                  let _passwordTry = user.passwordTry + 1
                  await User.updateOne({ email: email }, { $set: { passwordTry: _passwordTry } })
                  if (_passwordTry > 2) {
                      await User.updateOne({ email: email }, { $set: { isLocked: true } })
                      res.status(400)
                      return res.send({isSuccess:false,message: "Your account is locked.Please reset password and proceed." })
                  }
                  else {
                      res.status(400)
                      return res.send({isSuccess:false,message: "Invalid credentials." })
                  }
              }
            } else {
                const user1 = await User.findOne({ email })
                console.log(user1)
                console.log(response.data['error-codes'][0])
              //return res.status(500).json({ isSuccess: false, message: 'Captcha Verification failed' });
              errorfunction.errorLogmessage(response.data['error-codes'],'error code',user1)
              return res.status(400).send({ isSuccess: false, message: response.data['error-codes'] });
            }
          } catch (error) {
            console.log(error)
           // errorfunction.errorHandler(err, req, res)
            return res.status(500).json({ isSuccess: false, message: 'Captcha Server error' });
          }

       
        //Check the user and password match

        //command start
          
            
         
 //command end


    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


const loginUser1 = asyncHandler(async (req, res) => {
    try {
        const { email, password,captchaToken } = req.body
        const user = await User.findOne({ email })
        //errorfunction.errorLogmessage(req.body, req, res)
        if (!user) {
            res.status(400)
            return res.send({isSuccess:false,message: "User not found" })
        }

        if (user.isLocked) {
            res.status(400)
            return res.send({isSuccess:false,message: "Your account is locked.Please reset password and proceed." })
        }

        const _userRoles = await UserRole.findOne({ _id: user.roleId });
        //Check the user and password match

        
          
           
         




        if (user && (await bcrypt.compare(password, user.password))) {

            return res.send({isSuccess:true,message: "",
                            data:{
                                _id: user._id,
                                name: user.name,
                                email: user.email,
                                role: _userRoles.name,
                                token: generateToken(user._id)
                            }
            })
            // res.status(200).json(
            //     {
            //         _id: user._id,
            //         name: user.name,
            //         email: user.email,
            //         role: _userRoles.name,
            //         token: generateToken(user._id)
            //     }
            // )
        }
        else {
            let _passwordTry = user.passwordTry + 1
            await User.updateOne({ email: email }, { $set: { passwordTry: _passwordTry } })
            if (_passwordTry > 2) {
                await User.updateOne({ email: email }, { $set: { isLocked: true } })
                res.status(400)
                return res.send({isSuccess:false,message: "Your account is locked.Please reset password and proceed." })
            }
            else {
                res.status(400)
                return res.send({isSuccess:false,message: "Invalid credentials." })
            }
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

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

const loginUser= asyncHandler(async (req, res) => {
    try {
        const { email, password,captchaToken } = req.body

        console.log(req.body);

        console.log('I came here nalini magesh');
        console.log(captchaToken);

        if (!captchaToken) {
            //return res.status(400).json({ success: false, message: 'Token is missing' });
            return res.status(500).json({ success: false, message: 'Captcha Token is missing' });
          }
          // let logmessage = "secret:" + process.env.RECAPTCHA_SECRET_KEY + ";captchavalue:"+captchaToken
          //errorfunction.errorLogmessage(logmessage,'logmessage',user)
        
          try {
            const isValid = await verifyToken(captchaToken);


           // errorfunction.errorLogmessage(process.env.RECAPTCHA_SECRET_KEY,'process.env.RECAPTCHA_SECRET_KEY',user)
            //let logmessage = "secret:" + process.env.RECAPTCHA_SECRET_KEY + ";captchavalue:"+captchaToken
            //errorfunction.errorLogmessage(response.data.success,'responsesuccess',user)
        
            if (isValid) {

                const user = await User.findOne({ email })
                console.log('I came here');
                console.log(req.body)
                errorfunction.errorLogmessage('req.body','inputdata',user)
                if (!user) {
                    res.status(400)
                    return res.send({isSuccess:false,message: "User not found" })
                }
        
                if (user.isLocked) {
                    res.status(400)
                    return res.send({isSuccess:false,message: "Your account is locked.Please reset password and proceed." })
                }
        
                const _userRoles = await UserRole.findOne({ _id: user.roleId });

              //return res.status(200).json({ success: true, message: 'Verification passed' });
              if (user && (await bcrypt.compare(password, user.password))) {

                  return res.send({isSuccess:true,message: "",
                                  data:{
                                      _id: user._id,
                                      name: user.name,
                                      email: user.email,
                                      role: _userRoles.name,
                                      token: generateToken(user._id)
                                  }
                  })
                  
              }
              else {
                  let _passwordTry = user.passwordTry + 1
                  await User.updateOne({ email: email }, { $set: { passwordTry: _passwordTry } })
                  if (_passwordTry > 2) {
                      await User.updateOne({ email: email }, { $set: { isLocked: true } })
                      res.status(400)
                      return res.send({isSuccess:false,message: "Your account is locked.Please reset password and proceed." })
                  }
                  else {
                      res.status(400)
                      return res.send({isSuccess:false,message: "Invalid credentials." })
                  }
              }
            } else {
                const user1 = await User.findOne({ email })
                console.log(user1)
               // console.log(response.data['error-codes'][0])
              //return res.status(500).json({ isSuccess: false, message: 'Captcha Verification failed' });
              errorfunction.errorLogmessage(response.data['error-codes'],'error code',user1)
              return res.status(400).send({ isSuccess: false, message: response.data['error-codes'] });
            }
          } catch (error) {
            console.log(error)
           // errorfunction.errorHandler(err, req, res)
            return res.status(500).json({ isSuccess: false, message: 'Captcha Server error' });
          }

       
        //Check the user and password match

        //command start
          
            
         
 //command end


    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


/**
  * Create an assessment to analyze the risk of a UI action.
  *
  * projectID: Your Google Cloud Project ID.
  * recaptchaSiteKey: The reCAPTCHA key associated with the site/app
  * token: The generated token obtained from the client.
  * recaptchaAction: Action name corresponding to the token.
  */
async function createAssessment({
  // TODO: Replace the token and reCAPTCHA action variables before running the sample.
  projectID = "utthira-1732172606054",
  recaptchaKey = "6LfOt60qAAAAAC7D3mqw1FwDQVGDcsWUwTX8PXXy",
  token = "action-token",
  recaptchaAction = "action-name",
}) {
  // Create the reCAPTCHA client.
  // TODO: Cache the client generation code (recommended) or call client.close() before exiting the method.
  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);

  // Build the assessment request.
  const request = ({
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  });

  const [ response ] = await client.createAssessment(request);

  // Check if the token is valid.
  if (!response.tokenProperties.valid) {
    console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);
    return null;
  }

  // Check if the expected action was executed.
  // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
  if (response.tokenProperties.action === recaptchaAction) {
    // Get the risk score and the reason(s).
    // For more information on interpreting the assessment, see:
    // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
    response.riskAnalysis.reasons.forEach((reason) => {
      console.log(reason);
    });

    return response.riskAnalysis.score;
  } else {
    console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
    return null;
  }
}


module.exports = {
    registerUser,
    loginUser,
    getUserMenuDetailsById,
    resetUserPassword,
    getNewRegisterOTP,
    getResetPasswordOTP,
    registerUserByBroker
}