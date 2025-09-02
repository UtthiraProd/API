const asyncHandler = require('express-async-handler')
const Broker = require('../models/brokerModel')
const User = require('../models/userModel')
const UserRole = require('../models/userRoleModel')
const ValidationConfig = require('../models/validationConfigModel')
const { getBrokerimageUrl } = require('../azureservice/commonService');
const FORM_NAME = 'AddEditBroker'
const userBrokerRole = "Broker"
const userBrokerRoles = "Admin"
const { errorfunction,fieldValidationfunction } = require('./commonController');

/**
 * Function Description: Registers a broker.
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @param {function} next - A callback to the next middleware in the stack.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const registerBroker = asyncHandler(async (req, res, next) => {

    try {
         const { name, phoneNumber, matrimonyName, address1, address2,
            district, state, country, pincode } = req.body

            for (const [key, value] of Object.entries(req.body)) {
                let arrValidation = await ValidationConfig.find({ formName: 'AddEditBroker', fieldName: key })
                for (const currentObject of arrValidation) {
                    let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                    if (message != '') {
                        res.status(400)
                        throw new Error(message);
                        
                    }
                }
    
            }

        if (!name || !phoneNumber || !matrimonyName || !address1 || !state || !country || !district || !pincode) {
            res.status(200)
            let message = 'Please include all fields'
            throw new Error(message)
        }

        //find if user already exists
        const userExists = await User.findById(req.user.id)

        console.log(userExists)

        if (!userExists) {
            res.status(400)
            throw new Error('User not found')
        }


        const brokerExists = await Broker.findById(req.user.id)


        if (brokerExists != null) {
            res.status(400)
            throw new Error('Broker already exists')
        }
        
        const broker = await Broker.create({
            name,
            phoneNumber,
             userId: req.user.id,
            matrimonyName,
            address1,
           address2,
            district,
            state,
            country,
            pincode,
            container:"imagefolder",
            imageName:"",
            approved:false
        })

        if (broker) {
            res.status(201).json(broker)
        }
        else {
            res.status(400)
            throw new console.error('Invalid broker data');
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})


/**
 * Function Description: This method broker details to users, so we exclude some fields here
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */
 
const getBrokerById = asyncHandler(async (req, res) => {

    try {
        // get user using the id in the JWT
        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }

        const broker = await Broker.findById({ _id: req.params.id })

        if (!broker) {
            res.status(404)
            throw new Error('Broker not found')
        }

        if (broker.userId != req.user.id) {
            res.status(401)
            throw new Error('Unauthorized access')
        }
        res.status(200).json(broker)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})

/**
 * Function Description: Get broker details for an id
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getBrokerDetailById = asyncHandler(async (req, res) => {

    try {

        console.log("Rajaaa")
        let _brokerId
        // get user using the id in the JWT
        const user = await User.findById(req.user.id)
        const  {brokerId} = req.body

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }


        if(brokerId == 'null' || !brokerId || (brokerId==null))
        {
            const _userRole = await UserRole.findOne({_id:user.roleId});

            if(_userRole.name == userBrokerRole)
            {
            let _brokerDetail =  await Broker.findOne({userId:req.user.id});
            _brokerId = _brokerDetail._id
            
            }
        }
        else
        {   
            _brokerId = brokerId
        }


        const broker = await Broker.findById({ _id: _brokerId },{profileIds:0})

        if (!broker) {
            res.status(404)
            throw new Error('Broker not found')
        }

        if (broker.userId != req.user.id) {
            res.status(401)
            throw new Error('Unauthorized access')
        }

        let imageurl=""
        
        if(broker.imageName !="")
        imageurl = await getBrokerimageUrl(_brokerId)
        res.status(200).json({"brokerDetails":broker,"imageUrl":imageurl,"email":user.email})

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

/**
 * Function Description: Gets all brokers
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllBroker = asyncHandler(async (req, res) => {

    try {
        
        const user = await User.findById(req.user.id)
        let _skip = 0;
        let _pagesize = 10;

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        const { name, district, matrimonyName,phoneNumber,skip, pagesize } = req.body

        if (pagesize) {

            if (skip == 1) {
                _skip = skip - 1
                _pagesize = pagesize
            }
            else {
                _skip = ((skip - 1) * pagesize)
                _pagesize = pagesize
            }

            if(_pagesize > 10)
            {
                _pagesize = 10;
            }

        }

        let query = {};

        //query.brokerId = searchBrokerId
        if (name) {
            query.name = name;
        }
        if (district) {
            query.district = district;
        }
        if (matrimonyName) {
            query.matrimonyName = matrimonyName;
        }
        
        if (phoneNumber) {
            query.phoneNumber = phoneNumber;
        }
        
        
        const _brokerList = await Broker.find(query).skip(_skip).limit(_pagesize)
        const _totalRecord = await Broker.find(query).countDocuments()

        
        const imageUrlList = await Promise.all(
            (await _brokerList).map(async (doc) => {
            // Perform asynchronous operations here if needed
            let imageurl = await getBrokerimageUrl(doc._id)
            return {"brokerID":doc._id,"imageUrl":imageurl};
            })
        );

        res.status(200).json({"brokerList":_brokerList,"totalRecourd":Math.ceil(_totalRecord/_pagesize),"imageUrls":imageUrlList} )
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})


/**
 * Function Description: Gets broker by page number
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllBrokerByPaging = asyncHandler(async (req, res) => {

    try {
        // get user using the id in the JWT
        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }

        const broker = await Broker.find({})
            //.sort("-_id")
            .skip(1)
            .limit(3)
            .exec();

        if (!broker) {
            res.status(404)
            throw new Error('Broker not found')
        }

        res.status(200).json(broker)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

/**
 * Function Description: Gets all brokers
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getAllBroker1_tmp = asyncHandler(async (req, res) => {

    try {
        // get user using the id in the JWT
        // const user = await User.findById(req.user.id)

        const broker = await Broker.find({})

        if (!broker) {
            res.status(404)
            throw new Error('Broker not found')
        }

        res.status(200).json(broker)
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

/**
 * Function Description: Deletes a broker
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const deleteBroker = asyncHandler(async (req, res) => {

    try {
        //1.get all profiles under broker
        //2.deltete all images in azure against profile
        //3.finally delete the broker

        const user = await User.findById(req.user.id)
    
        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        const { brokerId } = req.body

        _broker = await Broker.findById({ _id: brokerId })

        for (const data of _broker.profileIds) {
            deleteProfile(data._id)
        }

        await Broker.deleteOne({_id:brokerId})

        res.status(200).json({"message":"Broker deleted successfully"})
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

/**
 * Function Description: Deletes a profile
 * @param profileId - The profile id to delete
 * @returns {void} - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

async function deleteProfile(profileId){

    try{
        
        const _marriageProfileDetail = await MarriageProfile.findOne({ _id: profileId })

        if (!_marriageProfileDetail) {
                res.status(404)
                throw new Error('profile detail not found')
            }

        await removeAllProfileImageByID(profileId,null,req.user.id)

        //step-1:Remove profileID inside the broker
        await Broker.findByIdAndUpdate(_marriageProfileDetail.brokerId, {
            $pull: {
                profileIds: {
                    _id: _marriageProfileDetail._id
                }
            }
        })

        let marriageProfile = await MarriageProfile.deleteOne({_id:profileId})
    
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

}

const topUpPlanBroker = asyncHandler (async(req,res)=>{
    
    try{
        const user = await User.findById(req.user.id);
        
        if (!user) {
            res.status(401).json({ isSuccess: false, message: 'User not found' });
            return;
        }

        let {id,balanceAmount}=req.body.data
        console.log(req.body.data)

           for (const [key, value] of Object.entries(req.body.data)) {
                let arrValidation = await ValidationConfig.find({ formName: 'TopUpPlanBroker', fieldName: key })
                for (const currentObject of arrValidation) {
        
                    let message =await fieldValidationfunction.ValidateFields(currentObject, value);
                    if (message != '') {
                        res.status(400)
                        console.log(message)
                        throw new Error(message);
                    }
                }
            }          
                  
             console.log("valid")
                      const _userRole = await UserRole.findOne({_id:user.roleId})
                      console.log(_userRole)
                      
                      if(_userRole.name !== userBrokerRole){
                          res.status(404)
                          throw new error("error")
                      }
                    console.log("role ok")

        if(!balanceAmount){
            return res.status(200).json({isSuccess:false,message:"Please enter the amount"})
         }  

        const _broker = await Broker.updateOne(
            {_id:id },
            {$inc: {balanceAmount:balanceAmount}},
           
        )

        if(_broker){
          return res.status(200).json({isSuccess:true,message:"Top-up done successfully"})
        }
    }
    catch (err) {
    errorfunction.errorHandler(err, req, res)
    }
})

module.exports = {
    registerBroker,
    getBrokerById,
    getAllBroker,
    getAllBrokerByPaging,
    getBrokerDetailById,
    deleteBroker,
    topUpPlanBroker
}

//Error handler
//https://dev.to/qbentil/how-to-write-custom-error-handler-middleware-in-expressjs-using-javascript-29j1