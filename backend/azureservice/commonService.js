
require("dotenv").config()
const azureStorage = require('azure-storage');
const MarriageProfile = require('../models/marriageProfileModel')
const Broker = require('../models/brokerModel')
const crypto = require('crypto');
const { errorfunction } = require('../controllers/commonController')
const blobService = azureStorage.createBlobService(process.env.AZURE_ACCOUNT_NAME, process.env.AZURE_ACCESS_KEY);
const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    newPipeline,
    ContainerClient,
} = require("@azure/storage-blob")

const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_ACCOUNT_NAME,
    process.env.AZURE_ACCESS_KEY,
);

/**
 * Function Description: to get profile image url
 * @param brokerId - broker id
 * @param profileId - profile id
 * @returns - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

async function getPrfileimageUrl(brokerId,profileId){
    try {

        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setMinutes(startDate.getMinutes() + 100);
        startDate.setMinutes(startDate.getMinutes() - 100);

        const sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.READ,
                Start: startDate,
                Expiry: expiryDate
            }
        };
        var ImageName;
        let sasUrl =""
        let containerName = ""
        let _broker =await Broker.findById({_id:brokerId});
       
        containerName = _broker.container 
        

        const { container } = _broker;
      

        if( profileId !=null)
        {

           
        let _profile =  await MarriageProfile.findById({ _id: profileId });
        var image = _profile.imageUrls;
       
       

        if(image && image !=null && image!=undefined )
        {

            if(image.length > 0)
            {
                const result = image.find(item => item.isProfile ===true);
                if(result !=undefined && result!="" &&  result !=null)
                {
                    ImageName = result.name;
                }
                else
                {
                    ImageName = image[0].name
                }
            }
        }
        
        }   
        else
            {
                ImageName = _broker.imageName
            }

        if(ImageName != "" && ImageName!=undefined && containerName != "" && containerName!=undefined)
        {
            const token = blobService.generateSharedAccessSignature(containerName, ImageName, sharedAccessPolicy);
            sasUrl = blobService.getUrl(containerName, ImageName, token);
            return sasUrl;
        }
        else
        {
            return "";
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

}


/**
 * Function Description: to get Broker's Image URL
 * @param brokerId - broker id
 * @returns - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */
async function getBrokerimageUrl(brokerId){

    try {
        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setMinutes(startDate.getMinutes() + 100);
        startDate.setMinutes(startDate.getMinutes() - 100);

        const sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.READ,
                Start: startDate,
                Expiry: expiryDate
            }
        };
        var ImageName;
        let sasUrl =""

        let _broker =await Broker.findById({_id:brokerId});

        if(_broker.imageName !="" && _broker.imageName!=undefined && _broker.imageName!='null' && _broker.imageName!=null)
        {
        const token = blobService.generateSharedAccessSignature(_broker.container, _broker.imageName, sharedAccessPolicy);
        sasUrl = blobService.getUrl(_broker.container, _broker.imageName, token);
        }

        return sasUrl;
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
}


// const getProfileImageUrl = async (req, res) => {
//     try {
        
//         const { profileId,brokerId } = req.body

//         console.log("Broker Id:"+ brokerId)
//         console.log("Profile Id:"+ profileId)

//         const user = await User.findById(req.user.id)
               
//         if(!user){
//             res.status(401)
//             throw new Error('User not found')
//         }

//         const startDate = new Date();
//         const expiryDate = new Date(startDate);
//         expiryDate.setMinutes(startDate.getMinutes() + 100);
//         startDate.setMinutes(startDate.getMinutes() - 100);

//         const sharedAccessPolicy = {
//             AccessPolicy: {
//                 Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.READ,
//                 Start: startDate,
//                 Expiry: expiryDate
//             }
//         };
        
//         let _profile =  await MarriageProfile.findById({ _id: profileId });
//         var image = _profile.imageUrls;
//         var firstImageName =image[0].name;
//         let _brokerId;

       
//         console.log(user)
//         console.log(brokerId)
//          if(brokerId == 'null' || !brokerId || (brokerId==null))
//          {
//           console.log('broker....')
//           console.log(user.roleId)
//              const _userRole = await UserRole.findById({_id:user.roleId});
//              console.log("user role")
//              console.log(_userRole)
     
     
//              if(_userRole.name == userBrokerRole)
//              {
//                  console.log(_userRole.name)
//               let _brokerDetail =  await Broker.findOne({userId:req.user.id});
//                 _brokerId = _brokerDetail._id
                
//              }
//          }
//          else
//          {
//              _brokerId = brokerId
//          }

//         let _broker =await Broker.findById({_id:_brokerId});
//         const token = blobService.generateSharedAccessSignature(_broker.container, blobName, sharedAccessPolicy);
//         let sasUrl = blobService.getUrl(_broker.container, firstImageName, token);
//         console.log(sasUrl)

//         var imageUrls = []
//         if(sasUrl)
//         {
//             image.forEach(image => {
//             let  newsasUrl = sasUrl.replace(firstImageName,image.name)
//             imageUrls.push(newsasUrl)
//           });
//         }
//         res.send({"isSuccess":true,"message":"success","data":imageUrls})
//     }
//     catch (err) {

//         console.log(err)
//      }
// }


/**
 * Function Description: to generate random number
 * @param - 
 * @returns - Generated random number
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */
function generateRandomNumber() {
    try {
        // 100000 to 999999 is the range for 6-digit numbers
        const min = 100000;
        const max = 999999;
        const range = max - min + 1;
        const randomBytes = crypto.randomBytes(4).readUInt32BE(0);
        const randomInRange = randomBytes % range;
        return min + randomInRange;
    } catch (err) {
         errorfunction.errorHandler(err, req, res)
        return null;
    }
}


function isValidEmail(email) {
    try {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    } catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
}



  
  module.exports = { 
    getPrfileimageUrl,
    generateRandomNumber,
    getBrokerimageUrl,
    isValidEmail
};