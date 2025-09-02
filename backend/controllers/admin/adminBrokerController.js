const asyncHandler = require('express-async-handler')
const Broker = require('../../models/brokerModel')
const UserRole = require('../../models/userRoleModel')
const User = require('../../models/userModel')
const PlanCatagory = require('../../models/planModel')
const { errorfunction, fieldValidationfunction } = require('../commonController')
const PUProfile = require ('../../models/PUMarriageProfileModel')
// const Broker = require('../../models/brokerModel')
const MarriageProfile = require('../../models/marriageProfileModel')
const userBrokerRole = "Admin"
const { getBrokerimageUrl } = require('../../azureservice/commonService');
const {getImageByContainerAndBlob} = require('../../azureservice/fileUploadService')
const sharp = require('sharp');
const bcrypt = require('bcryptjs')

const ValidationConfig = require('../../models/validationConfigModel')

const adminRegisterBroker = asyncHandler(async (req, res, next) => {

    try {
        const { name, phoneNumber, email, matrimonyName, pincode, additionalNumber, whatsAppNumber,registrationNumber,commissionPercentage,
            address1, address2, district, state, brokerCategory, rank, container, userName, password, confirmPassword } = req.body.data
        console.log(req.body.data)

        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'AddEditBroker', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);

                }
            }

        }

        if (!name || !phoneNumber || !email || !matrimonyName || !pincode || !address1 ||
            !address2 || !district || !state || !brokerCategory || !rank || !password || !confirmPassword) {

            return res.status(200).json({ isSuccess: false, message: "Invalid Data" })
        }

        const user = await User.findOne({ phoneNumber: phoneNumber })

        if (user) {
            return res.status(200).json({ isSuccess: false, message: phoneNumber + ' Already exists' })
        }

        const users = await User.findOne({ email: email })

        if (users) {
            return res.status(200).json({ isSuccess: false, message: email + ' Already exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //  if(email !=userName){
        //     return res.status(200).json({isSuccess:false,message: 'Mail Dose Not Match '})
        //  }

        if (password != confirmPassword) {
            return res.status(200).json({ isSuccess: false, message: 'Password Dose Not Match ' })
        }

        const userRole = await UserRole.findOne({ name: "Broker" })

        const _user = await User.create({
            name: name,
            phoneNumber: phoneNumber,
            email: email,
            isBroker: true,
            // state:state,
            roleId: userRole._id,
            password: hashedPassword,
            passwordTry: 0,
            isLocked: false,
            createdBy: req.user.id,
            updatedBy: req.user.id,
            lastLogginedTime: new Date(),
            isLoggedin: true,
            heartBeat: new Date()
        })

        if (_user) {
            const _broker = await Broker.create({
                name: name,
                phoneNumber: phoneNumber,
                email: email,
                matrimonyName: matrimonyName,
                pincode: pincode,
                additionalNumber: additionalNumber,
                registrationNumber:registrationNumber,
                commissionPercentage:"Please contact broker",
                whatsAppNumber: whatsAppNumber,
                address1: address1,
                address2: address2,
                district: district,
                state: state,
                brokerCategory: brokerCategory,
                rank: rank,
                userId: _user._id,
                container: "imagefolder",
                imageName: "",
                createdBy: req.user.id,
                updatedBy: req.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                isPublic:false,
                isActive:true
            })
            if (_broker) {
                return res.status(200).json({ isSuccess: true, message: "Broker Created Successfully", brokerId: _broker._id })
            }
            else {
                return res.status(200).json({ isSuccess: true, message: "User created successfully but failed to create Broker!!" })
            }
        }

        else {
            return res.status(200).json({ isSuccess: false, message: "Error while creating user!!" })
        }

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


const adminUpdateBroker = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if (user.isLoggedin !== true) {
            res.status(404)
            throw new Error('User not logged in')
        }
        const { brokId, name, phoneNumber, email, matrimonyName, pincode, additionalNumber, whatsAppNumber,registrationNumber,
            commissionPercentage,address1, address2, district, state, brokerCategory, rank } = req.body.data

        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'AddEditBroker', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);

                }
            }

        }
        if (phoneNumber) {

            const _brokerDetailsForPhoneNumber = await Broker.findById(brokId)

            if (_brokerDetailsForPhoneNumber.phoneNumber != phoneNumber) {
                const broker = await Broker.findOne({ phoneNumber })

                if (broker) {
                    return res.status(201).json({ isSuccess: false, message: phoneNumber + " Already Exists" })
                }
            }
        }

        if (email) {

            const _brokerDetailsForEmail = await Broker.findById(brokId)

            if (_brokerDetailsForEmail.email != email) {

                const users = await Broker.findOne({ email })
                if (users) {
                    return res.status(201).json({ isSuccess: false, message: email + " Already Exists" })
                }
            }
        }

        var updateAgainst = { _id: brokId }
        var newvalues = {
            $set: {
                name: name,
                phoneNumber: phoneNumber,
                email: email,
                matrimonyName: matrimonyName,
                pincode: pincode,
                additionalNumber: additionalNumber,
                commissionPercentage:commissionPercentage,
                registrationNumber:registrationNumber,
                whatsAppNumber: whatsAppNumber,
                address1: address1,
                address2: address2,
                district: district,
                state: state,
                brokerCategory: brokerCategory,
                rank: rank,
                updatedBy: req.user.id
            }
        }

        const _user = await Broker.updateOne(updateAgainst, newvalues)

        const use = await Broker.findOne({ _id: brokId })

        _Id = use.userId

        var updateagin = { _id: _Id }
        var newvalue = {
            $set: {

                name: name,
                phoneNumber: phoneNumber,
                email: email,
                updatedBy: req.user.id
            }
        }

        const _users = await User.updateOne(updateagin, newvalue)

        if (_users) {
            return res.status(200).json({ isSuccess: true, message: "Update Successfully" })
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


const adminDeleteBroker = asyncHandler(async (req, res, next) => {

    try {

        const { brokid, deletename } = req.body

        const _plan = await PlanCatagory.findOne({ brokerId: brokid })

        // planname =_plan.planName

        if (_plan && _plan.brokerId == brokid) {
            return res.status(200).json({ isSuccess: false, message: "Please delete the Broker's plan  '" + _plan.planName + "' before deleting the broker" })
        }
        const broker = await Broker.findOne({ _id: brokid })

        if (broker) {

            const _id = broker.userId

            if (broker) {
                const _broker = await Broker.deleteOne({ _id: brokid })
            }
            console.log(broker)

            const brokers = await User.deleteOne({ _id: _id })

            return res.status(200).json({ isSuccess: true, message: "Delete successfully" })
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})



const adminGetBrokerByID = asyncHandler(async (req, res) => {
    try {
        const { id } = req.query

        const _broker = await Broker.findById({ _id: id })

        if (_broker) {
            res.status(200).json({ isSuccess: true, brokerDetail: _broker })
        }
        else {
            res.status(201).json({ isSuccess: false, message: 'error occur' })
        }

    } catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})





const getBrokerPlan = asyncHandler(async (req, res, next) => {

    try {

        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if (user.isLoggedin !== true) {
            res.status(404)
            throw new Error('User not logged in')
        }
        const { id } = req.query

        const plan = await PlanCatagory.find({ brokerId: id })

        if (plan) {
            return res.status(200).json({ isSuccess: true, GetAllBrokerPlanList: plan })
        }

    }

    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

const topUpPlanBroker = asyncHandler(async (req, res) => {

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(401).json({ isSuccess: false, message: 'User not found' });
            return;
        }
        else if (user.isLoggedin !== true) {
            res.status(404)
            throw new Error('User not logged in')
        }

        let { id, balanceAmount } = req.body.data
        console.log(req.body.data)

        for (const [key, value] of Object.entries(req.body.data)) {
            let arrValidation = await ValidationConfig.find({ formName: 'TopUpPlanBroker', fieldName: key })
            for (const currentObject of arrValidation) {

                let message = await fieldValidationfunction.ValidateFields(currentObject, value);
                if (message != '') {
                    res.status(400)
                    console.log(message)
                    throw new Error(message);
                }
            }
        }
        const _userRole = await UserRole.findOne({ _id: user.roleId })
        console.log(_userRole)

        if (_userRole.name !== userBrokerRole) {
            res.status(404)
            throw new error("error")
        }

        if (!balanceAmount) {
            return res.status(200).json({ isSuccess: false, message: "Please enter the amount" })
        }

        const _broker = await Broker.updateOne(
            { _id: id },
            { $inc: { balanceAmount: balanceAmount } },

        )

        if (_broker) {
            return res.status(200).json({ isSuccess: true, message: "Top-up done successfully" })
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
})


const getAllBroker = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        let _skip = 0;
        let _pagesize = 10;

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if (user.isLoggedin !== true) {
            res.status(404)
            throw new Error('User not logged in')
        }

        const { name, district, matrimonyName, phoneNumber, skip, pagesize } = req.body

        if (pagesize) {

            if (skip == 1) {
                _skip = skip - 1
                _pagesize = pagesize
            }
            else {
                _skip = ((skip - 1) * pagesize)
                _pagesize = pagesize
            }

            if (_pagesize > 10) {
                _pagesize = 10;
            }
        }

        let query = {};

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
                return { "brokerId": doc._id, "imageUrl": imageurl }
            })
        )

        res.status(200).json({
            "brokerList": _brokerList, "totalRecourd": Math.ceil(_totalRecord / _pagesize),
            imageUrls: imageUrlList
        })


    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

})

const getallBrokerName =asyncHandler(async(req,res)=>{

    try{
        const user = await User.findById(req.user.id)

         if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if (user.isLoggedin !== true) {
            res.status(404)
            throw new Error('User not logged in')
        }

        const _userRole = await UserRole.findOne({ _id: user.roleId })

        if (_userRole.name !== userBrokerRole) {
            res.status(404)
            throw new error("error")
        }
    
      const _broker = await Broker.find()
    
    if(_broker){
        res.status(200).json(_broker)
    }
        else{
            console.log('error')
        }
     }
    catch(err){
    errorfunction.errorHandler(err,req,res)
    }
})

const AsignBroker = asyncHandler (async(req,res)=>{
    try{

        const _user = await User.findById(req.user.id)

         if (!_user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if (_user.isLoggedin !== true) {
            res.status(404)
            throw new Error('User not logged in')
        }

        const _userRole = await UserRole.findOne({ _id: _user.roleId })

        if (_userRole.name !== userBrokerRole) {
            res.status(404)
            throw new error("error")
        }

        const {profileID,brokerId}=req.body

        const user = await PUProfile.findById(profileID).select("name");
       
        const broker = await Broker.findById(brokerId).select("matrimonyName");
       

        const PublicuserName = user.name;
        const matrimonyName = broker.matrimonyName;

        const profile = await PUProfile.findOne({"_id":profileID,"brokerID._id":brokerId})

      //  let brokerExists =profile.brokerID.some(id=> id.toString() === BrokerId.toString())
        
        if (profile){
             console.log("This broker was already assigned to the user")
            
          return res.status(400).json({isSuccess:false,message: "'"+PublicuserName +"'"+" is already assigned to "+"'"+ matrimonyName+"'."})
        }
        
else{
        const PUAsignBroker = await PUProfile.updateOne(
            {"_id":profileID},{$push:{"brokerID":{"_id":brokerId}}}
        )
        
        if(PUAsignBroker){
            return res.status(201).json({isSuccess:true,message: "'"+PublicuserName+"'"+" asigned to " +"'"+matrimonyName+"'"+ " successfully."})
        }
        }
    
    }
    catch(err){
        errorfunction.errorHandler(err,req,res)
    }
})

const adminAssignBrokertoPublic =asyncHandler(async(req,res)=>{
    try{

        const user = await User.findById(req.user.id)

         if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if (user.isLoggedin !== true) {
            res.status(404)
            throw new Error('User not logged in')
        }

        const _userRole = await UserRole.findOne({ _id: user.roleId })

        if (_userRole.name !== userBrokerRole) {
            res.status(404)
            throw new error("error")
        }

        const {brokerId,isPublic}=req.body
        
        if(isPublic == true){
          const bork =  await Broker.findByIdAndUpdate(
            brokerId,{
                 $set :{
                     isPublic:true
                    }
                }
            )
            if(bork){
             res.status(200).json({isSuccess:true,message:"Broker removed from public successfully"})
            }
        }

    
        else if(isPublic == false){
           const broker =  await Broker.findByIdAndUpdate(
            brokerId,{
                 $set :{ 
                    isPublic:false
                }
              }
           )
        if(broker){     res.status(201).json({isSuccess:false,message:"Broker assigned to public successfully"})
        }
        }
           
        
    }       
    catch(err){
        errorfunction.errorHandler(err,req,res)
    }
})

const getBrokertoBroker =asyncHandler(async(req,res)=>{

    try{    

        const user = await User.findById(req.user.id)

         if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if (user.isLoggedin !== true) {
            res.status(404)
            throw new Error('User not logged in')
        }

        const _userRole = await UserRole.findOne({ _id: user.roleId })

        if (_userRole.name !== userBrokerRole) {
            res.status(404)
            throw new error("error")
        }

        const {brokerId,name,matrimonyName,phoneNumber, skip, pagesize }=req.body
    
        let _skip = 0;
        let _pagesize = 6;
                if (pagesize) {

            if (skip == 1) {
                _skip = skip - 1
                _pagesize = pagesize
            }
            else {
                _skip = ((skip - 1) * pagesize)
                _pagesize = pagesize
            }

            if (_pagesize > 7) {
                _pagesize = 6;
            }
        }

       let query = {};

        if (name) {
            query.name = name;
        }
        if (matrimonyName) {
            query.matrimonyName = matrimonyName;
        }

        if (phoneNumber) {
            query.phoneNumber = phoneNumber;
        }       
        
      const _broker = await Broker.find({_id:{$ne:brokerId}}).find(query).skip(_skip).limit(_pagesize);
      const _totalRecord = await Broker.find(query).countDocuments()

     

      let selectedBrokerIds =[]
      
      const _mainBroker = await Broker.findById(brokerId)

      let assignedBrokerIds = _mainBroker.brokerTobroker

      _broker.forEach(element => {
       if (
        assignedBrokerIds.some(
            assigned => assigned._id.toString() === element._id.toString()
        )
    )     {
            selectedBrokerIds.push(element._id)
          }
        
      });

          const brokImageList = await Promise.all(
      await _broker.map(async (doc) => {
        try{
              const image = doc.imageName;

              const blobResponse = await getImageByContainerAndBlob(doc.container, image);

         if (!blobResponse || !blobResponse.readableStreamBody) {
            return { _id: doc._id, imageBase64: null };
          }         
              let imageToShow;
              imageToShow = blobResponse.readableStreamBody.pipe(sharp())
            
              const blurredBuffer = await streamToBuffer(imageToShow);
              
              const base64Image = `data:image/jpeg;base64,${blurredBuffer.toString('base64')}`;

          return {
            _id: doc._id,
            imageBase64: base64Image,
          };
          
        }
        catch (err) {
          console.error(`Error processing image for profile ${doc._id}:`, err);
          return { profileID: doc.profileID, imageBase64: null };
        }
      })
    )

    if(_broker){
        res.status(200).json({BrokerToBroker:_broker,selectedBrokerIdList:selectedBrokerIds,brokImageList: brokImageList,"totalRecourd": Math.ceil(_totalRecord / _pagesize)})
    }
        else{
            res.status(201).json('error')
        }
     }
    catch(err){
    errorfunction.errorHandler(err,req,res)
   }
})
const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

const adminAssignBrokertoBroker =asyncHandler(async(req,res)=>{
    try{

        const user = await User.findById(req.user.id)

         if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        else if (user.isLoggedin !== true) {
            res.status(404)
            throw new Error('User not logged in')
        }

        const _userRole = await UserRole.findOne({ _id: user.roleId })

        if (_userRole.name !== userBrokerRole) {
            res.status(404)
            throw new error("error")
        }
        
        const {brokerId,brokID}=req.body  

        
   const brokers = await Broker.findById({_id:brokerId})


let Brok = brokers.brokerTobroker.some(b => b._id.toString() === brokID);

//toString() ==> convert objectID to string  "maniiiiiii"

        if(!Brok){
        const broker = await Broker.updateOne(
            {"_id":brokerId},{$push:{"brokerTobroker":{"_id":brokID}}}
        )
        if(broker){
            res.status(200).json({isSuccess:true,message:"Assign"})
        }}
        else{
        const brok =await Broker.updateOne(
            {"_id":brokerId},{$pull:{"brokerTobroker":{"_id":brokID}}}
        )
        if(brok){
            res.status(200).json({isSuccess:false,message:"Remove"})
        }   
     }     
 }
 catch(err){
    errorfunction.errorHandler(err,req,res)
 }
})


module.exports = {
    adminRegisterBroker,
    adminUpdateBroker,
    adminDeleteBroker,
    adminGetBrokerByID,
    getBrokerPlan,
    topUpPlanBroker,
    getAllBroker,
    getallBrokerName,
    AsignBroker,
    adminAssignBrokertoPublic,
    getBrokertoBroker,
    adminAssignBrokertoBroker
}