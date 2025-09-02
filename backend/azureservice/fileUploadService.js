const asyncHandler = require('express-async-handler')
require("dotenv").config()
const multer = require("multer")
const sharp = require('sharp');
var blobName = ""
const azureStorage = require('azure-storage');
const blobService = azureStorage.createBlobService(process.env.AZURE_ACCOUNT_NAME, process.env.AZURE_ACCESS_KEY);
const Broker = require('../models/brokerModel')
const Config = require('../models/configModel')
const UserRole = require('../models/userRoleModel')
const User = require('../models/userModel')
const MarriageProfile = require('../models/marriageProfileModel')
const { errorfunction } = require('../controllers/commonController')
const { appFunction } = require('../reUsable/appFunction')
const userBrokerRole = "Broker"
const PublicUserProfile = require('../models/PUMarriageProfileModel')
const { PUPlanFunction } = require('../reUsable/PUPlanFuntion');
const PlanSchedule = require('../models/PUPlanScheduleModel')
const PlanSchedules =require('../models/planScheduleModel')

const multerFile = multer({ storage: multer.memoryStorage() }).single("file")
const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    newPipeline,
    ContainerClient,
} = require("@azure/storage-blob")



const { Readable } = require("stream")
const path = require("path")



const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_ACCOUNT_NAME,
    process.env.AZURE_ACCESS_KEY,
);

const uploadOptions = { bufferSize: 4 * 1024 * 1024, maxConcurrency: 20 };
const pipeline = newPipeline(sharedKeyCredential);
const blobServiceClient = new BlobServiceClient(process.env.AZURE_ENDPOINT_URL, pipeline);
containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME)
//containerClient = blobServiceClient.getContainerClient("imagefolderrashiha26dec2024")


/**
 * Function Description: to upload profile
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const uploadProfile = async (req, res) => {
    try {

        let { originalname, buffer, mimetype } = req.file;
        const profileDetail = await MarriageProfile.findById(req.body["profileId"])
        //let { test } = req[1].file1;

        const fileNameWithoutExtension = path.basename(originalname, path.extname(originalname));
        let fileExtension = path.extname(originalname)
        let file_id = fileNameWithoutExtension + profileDetail.name.trim() + fileExtension;

        // let file_id = originalname + profileDetail.name.trim();
        //let fileExtension = path.extname(originalname)
        //let blobName = `${file_id}${fileExtension}`;
        let blobName1 = file_id;
        let stream = Readable.from(buffer)

        const configImageLengthDetail = await Config.findOne({ key: "PhotoImageLength" })

        if (originalname.length > parseInt(configImageLengthDetail.value)) {
            res.status(200).json({ "isSuccess": false, "message": "Image character length should not exceed" + configImageLengthDetail.value + "(including extension)" })
            return;
        }


        const brokerDetail = await Broker.findById(profileDetail.brokerId)

        let containerClientForBroker = blobServiceClient.getContainerClient(brokerDetail.container)

        let blockBlobClient = containerClientForBroker.getBlockBlobClient(blobName1);




        if (profileDetail && profileDetail.imageUrls && (profileDetail.imageUrls.length < 3)) {
            const data = await MarriageProfile.findByIdAndUpdate(req.body["profileId"], {
                $push: {
                    imageUrls: {
                        name: file_id
                    }
                }
            }
                , {
                    new: false, useFindAndModify: true
                }
            )

            res.send({ "isSuccess": true, "message": "File successfully uploaded" })
        }
        else {
            res.send({ "isSuccess": false, "message": "Photho upload exceed the limit" })
        }


        // const azureResponse = await blockBlobClient.uploadStream(stream,
        //     uploadOptions.bufferSize, uploadOptions.maxBuffers,
        //     { blobHTTPHeaders: { blobContent: mimetype } });

        // res.send({"isSuccess":true,"message":"File successfully uploaded"})
        // console.log('File successfully uploaded to azure...')
        // blobName =blobName1
        // getimage()


        // var datetime = new Date();
        // console.log(datetime);

        // return "File successfully uploaded...."
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
        res.send("error while uploading the file..")
        res.send({ "isSuccess": false, "message": "error while uploading the file.." })
    }
}

/**
 * Function Description: to update image name
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const updateImageName = async (req, res) => {
    try {
        let data = req.body;
        res.send({ "isSuccess": true, "message": "Image name updated successfully..." })
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
}



/**
 * Function Description: to Upload profile image
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

// const uploadProfileImage = async (req, res) => {

//     try {
//         console.log('image test....')
//         let { originalname, buffer, mimetype } = req.file;

//         const profileDetails = await MarriageProfile.findById(req.body["profileId"])


//         const fileNameWithoutExtension = path.basename(originalname, path.extname(originalname));
//         let fileExtension = path.extname(originalname)
//         let file_id = fileNameWithoutExtension + profileDetails.name.replace(/\s/g, '') + fileExtension;

//         //let blobName = `${file_id}${fileExtension}`;
//         let blobName = file_id;

//         const configImageLengthDetail = await Config.findOne({ key: "PhotoImageLength" })

//         if (originalname.length > parseInt(configImageLengthDetail.value)) {
//             res.status(200).json({ "isSuccess": false, "message": "Image character length should not exceed " + configImageLengthDetail.value + "(including extension)" })
//             return;
//         }

//         //let buffer1 = buffer;
//         // const image = sharp(buffer);
//         // const metadata = await image.metadata();

//         // if (metadata.width >= 250 && metadata.height >= 300) {
//         //     buffer1 =  await image
//         //       .resize({ width: 250, height: 300,
//         //       withoutEnlargement: true
//         //     })
//         //       //.extract({ width: 300, height: 300, left: 50, top: 10 })
//         //       .toBuffer();
//         // } else {

//         //     buffer1 =  await image
//         //       .resize({ width: 250, height: 300,
//         //       withoutEnlargement: true
//         //     })

//         // }

//         //     let buffer1 =  await sharp(buffer)
//         //     .resize({ width: 300, height: 500 })
//         //   .extract({ width: 300, height: 500, left: 50, top: 0 }) // Skew effect


//         //.resize(250,250)
//         // let buffer2 =  await sharp(buffer)
//         //.resize({width:200, withoutEnlargement: true })
//         let stream = Readable.from(buffer)
//         let defaultProfileImage = true;

//         const brokerDetail = await Broker.findById(profileDetails.brokerId)
//         console.log(brokerDetail)
//         let containerClientForBroker = blobServiceClient.getContainerClient(brokerDetail.container)
//         let blockBlobClient = containerClientForBroker.getBlockBlobClient(blobName);


//         const configImageSize = await Config.findOne({ key: "PhotoSizeInKB" })

//         const uploadedImageSizeInKB = parseInt(req.file.size / 1024);
//         const configImageSizeInKB = parseInt(configImageSize.value)

//         if (configImageSizeInKB < uploadedImageSizeInKB) {
//             //res.send({"isSuccess":false,"message":"Image size exceeded "+ configImageSizeInKB + " kb"})

//             res.status(200).json({ "isSuccess": false, "message": "Image size exceeded " + configImageSizeInKB + " kb" })
//             // return {"isSuccess":false,"message":"Image size exceeded "+ configImageSizeInKB + " kb"};
//             return;
//         }

//         if (profileDetails && profileDetails.imageUrls && profileDetails.imageUrls.length > 0)
//             defaultProfileImage = false

//         if (profileDetails && profileDetails.imageUrls && (profileDetails.imageUrls.length < 3)) {
//             const data = await MarriageProfile.findByIdAndUpdate(req.body["profileId"], {
//                 $push: {
//                     imageUrls: {
//                         name: file_id,
//                         isProfile: defaultProfileImage
//                     }
//                 }
//             }
//                 , {
//                     new: false, useFindAndModify: true
//                 }
//             )

//             const azureResponse = await blockBlobClient.uploadStream(stream,
//                 uploadOptions.bufferSize, uploadOptions.maxBuffers,
//                 { blobHTTPHeaders: { blobContent: mimetype } });

//             res.send({ "isSuccess": true, "message": "File successfully uploaded" })
//         }
//         else {
//             res.send({ "isSuccess": false, "message": "Photo upload exceed the limit" })
//         }

//     }
//     catch (err) {
//         errorfunction.errorHandler(err, req, res)
//         res.send("error while uploading the file..")
//     }
// }

const uploadProfileImage = async (req, res) => {
    try {
        console.log('Image upload started...');

        const { originalname, buffer, mimetype, size } = req.file;

        const profileDetails = await MarriageProfile.findById(req.body["profileId"]);
        if (!profileDetails) {
            return res.status(404).json({ isSuccess: false, message: "Profile not found" });
        }

        // Generate unique filename
        const fileNameWithoutExtension = path.basename(originalname, path.extname(originalname));
        const fileExtension = path.extname(originalname);
        const file_id = fileNameWithoutExtension + profileDetails.name.replace(/\s/g, '') + fileExtension;
        const blobName = file_id;

        // Check filename length
        const configImageLengthDetail = await Config.findOne({ key: "PhotoImageLength" });
        if (originalname.length > parseInt(configImageLengthDetail.value)) {
            return res.status(200).json({
                isSuccess: false,
                message: `Image character length should not exceed ${configImageLengthDetail.value} (including extension)`
            });
        }

        // Read max image size from DB
        const configImageSize = await Config.findOne({ key: "PhotoSizeInKB" });
        const uploadedImageSizeInKB = parseInt(req.file.size / 1024);
        const maxAllowedSizeInKB = parseInt(configImageSize.value)

        if (uploadedImageSizeInKB > maxAllowedSizeInKB) {
            return res.status(200).json({
                isSuccess: false,
                message: `Image size exceeded ${maxAllowedSizeInKB/1024} MB`
            });
        }

        // ➤ Compress only if size > 500 KB
        let finalBuffer = buffer;
        if (uploadedImageSizeInKB > 500) {
            console.log("Compressing image...");
            try {
                finalBuffer = await sharp(buffer)
                    .resize({ width: 800, withoutEnlargement: true }) // Resize max width to 800px
                    .jpeg({ quality: 70 }) // Compress JPEG
                    .toBuffer();
                console.log(`Compressed image size: ${Math.round(finalBuffer.length / 1024)} KB`);
            } catch (err) {
                console.error("Image compression failed", err);
                return res.status(500).json({ isSuccess: false, message: "Image compression failed" });
            }
        }

        // Convert final buffer to stream
        const stream = Readable.from(finalBuffer);

        // Check for default image status
        let defaultProfileImage = !(profileDetails.imageUrls && profileDetails.imageUrls.length > 0);

        if (profileDetails.imageUrls && profileDetails.imageUrls.length < 3) {
            // Save image info in DB
            await MarriageProfile.findByIdAndUpdate(req.body["profileId"], {
                $push: {
                    imageUrls: {
                        name: file_id,
                        isProfile: defaultProfileImage
                    }
                }
            }, {
                new: false,
                useFindAndModify: true
            });

            // Upload to Azure Blob Storage
            const brokerDetail = await Broker.findById(profileDetails.brokerId);
            if (!brokerDetail) {
                return res.status(404).json({ isSuccess: false, message: "Broker not found" });
            }

            const containerClientForBroker = blobServiceClient.getContainerClient(brokerDetail.container);
            const blockBlobClient = containerClientForBroker.getBlockBlobClient(blobName);

            await blockBlobClient.uploadStream(stream,
                uploadOptions.bufferSize,
                uploadOptions.maxBuffers,
                { blobHTTPHeaders: { blobContentType: mimetype } }
            );

            return res.status(200).json({ isSuccess: true, message: "File successfully uploaded" });
        } else {
            return res.status(200).json({ isSuccess: false, message: "Photo upload exceed the limit (max 3 photos allowed)" });
        }

    } catch (err) {
        console.error("Upload error:", err);
        errorfunction.errorHandler(err, req, res);
        return res.status(500).send("Error while uploading the file.");
    }
};


/**
 * Function Description: to Upload broker image
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const uploadBrokerImage = async (req, res) => {

    try {

        let { originalname, buffer, mimetype } = req.file;
        let file_id = originalname;
        let fileExtension = path.extname(originalname)
        //let blobName = `${file_id}${fileExtension}`;
        let blobName = file_id;

        let stream = Readable.from(buffer)
        let defaultProfileImage = true;

        const _broker = await Broker.findById(req.body["brokerId"])
        const containerClient = blobServiceClient.getContainerClient(_broker.container);
        let blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        const configImageSize = await Config.findOne({ key: "PhotoSizeInKB" })

        const uploadedImageSizeInKB = parseInt(req.file.size / 1024);
        const configImageSizeInKB = parseInt(configImageSize.value)

        if (configImageSizeInKB < uploadedImageSizeInKB) {
            //res.send({"isSuccess":false,"message":"Image size exceeded "+ configImageSizeInKB + " kb"})

            res.status(200).json({ "isSuccess": false, "message": "Image size exceeded " + configImageSizeInKB + " kb" })
            // return {"isSuccess":false,"message":"Image size exceeded "+ configImageSizeInKB + " kb"};
            return;
        }

        if (_broker) {
            console.log('container name:' + _broker.container)
            const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_CONNECTION_STRING);

            const containerClient = blobServiceClient.getContainerClient(_broker.container);

            const blobClient = containerClient.getBlobClient(_broker.imageName);

            if (_broker.imageName) {
                await blobClient.delete();
            }

            await Broker.updateOne(
                { _id: req.body["brokerId"] },
                {
                    $set: { "imageName": blobName },
                }
            )

            const azureResponse = await blockBlobClient.uploadStream(stream,
                uploadOptions.bufferSize, uploadOptions.maxBuffers,
                { blobHTTPHeaders: { blobContent: mimetype } });

            res.send({ "isSuccess": true, "message": "File successfully uploaded" })
        }
        else {
            res.send({ "isSuccess": false, "message": "Photho upload exceed the limit" })
        }

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
        res.send("error while uploading the file..")
    }
}


/**
 * Function Description: to get image by name
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getImageByName = async (req, res) => {

    try {


        const blobServiceClient = await BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        // Get a reference to a container
        const containerClient = await blobServiceClient.getContainerClient(containerName);
        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        return blockBlobClient.download(0);

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
}

const streamToBuffer = async (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
};

/**
 * Function Description: to get profile image URL
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const getProfileImageUrl = async (req, res) => {
    try {

        const { profileId, brokerId } = req.body

        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }

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

        let _profile = await MarriageProfile.findById({ _id: profileId });

        if (_profile && _profile.imageUrls && _profile.imageUrls.length > 0) {
            const imageUrls = [];
            let _brokerId;
            for (const img of _profile.imageUrls) {
                const firstImageName = img.name;

                if (brokerId == 'null' || !brokerId || (brokerId == null)) {
                    const _userRole = await UserRole.findById({ _id: user.roleId });

                    if (_userRole.name == userBrokerRole) {
                        let _brokerDetail = await Broker.findOne({ userId: req.user.id });
                        _brokerId = _brokerDetail._id
                    }
                }
                else {
                    _brokerId = brokerId
                }

                let _broker = await Broker.findById({ _id: _brokerId });

                const token = blobService.generateSharedAccessSignature(_broker.container, blobName, sharedAccessPolicy);
                const blobResponse = await getImageByContainerAndBlob(_broker.container, firstImageName, token);

                if (!blobResponse || !blobResponse.readableStreamBody) {
                    return { profileID: doc.profileID, imageBase64: null };
                }

                console.log(firstImageName, 'Success image...')

                let imageToShow;
                imageToShow = blobResponse.readableStreamBody.pipe(sharp())

                const imageBuffer = await streamToBuffer(imageToShow);

                const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

                imageUrls.push(base64Image)
            }

            res.send({ "isSuccess": true, "message": "success", "data": imageUrls })
        }
        else {
            res.send({ "isSuccess": false, "message": "failed", "data": [] })
        }
    }
    catch (err) {

        errorfunction.errorHandler(err, req, res)
    }
}

const getBrokerUserProfileImageUrl = async (req, res) => {
    try {
        const { profileId } = req.body

        const user = await User.findById(req.user.id)
        const _marriageProfileForPlan = await MarriageProfile.findOne({ _id: user.profileId })


        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
                     const plan = await PlanSchedules.findOne({ profileID: user.profileId })

                    if (!plan) {
                        res.status(401)
                        throw new Error('Plan not found')
                    }        

        const _profiles = await MarriageProfile.findById({ _id: user.profileId })

        const planId = _profiles.planID;

        const _plan = await PlanSchedules.findOne({
            profileID: _profiles._id,
            'planSchedule.planID': planId
        });

        if (_plan && _plan.planSchedule && _plan.planSchedule.length > 0) {
            const firstSchedule = _plan.planSchedule[0];
            const expiryDate = firstSchedule.expiryDate
            const todayDate = new Date();

            if (todayDate >= expiryDate) {
                return
            }
        }

        let result = await appFunction.isViewedPlanScheduleLimitExceeded(user.profileId, _marriageProfileForPlan.planID)

        console.log('result')
        console.log(result)

        if (result.isSuccess == false && result.message != "") {
            return res.send({
                "isSuccess": false,
                "message": result.message, "data": []
            })
        }

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

        let _profile = await MarriageProfile.findById({ _id: profileId });

        var image;
        var firstImageName

        if (_profile && _profile.imageUrls && _profile.imageUrls.length > 0) {
            image = _profile.imageUrls;
            firstImageName = image[0].name;
            let _brokerId;


            _brokerId = user.brokerId

            let _broker = await Broker.findById({ _id: _brokerId });
            const token = blobService.generateSharedAccessSignature(_broker.container, blobName, sharedAccessPolicy);
            let sasUrl = blobService.getUrl(_broker.container, firstImageName, token);

            var imageUrls = []
            if (sasUrl) {
                image.forEach(image => {
                    let newsasUrl = sasUrl.replace(firstImageName, image.name)
                    imageUrls.push(newsasUrl)
                });
            }


            appFunction.CountProfileViewDownload(user.profileId, _marriageProfileForPlan.planID, 'ViewImage', profileId)

            res.send({ "isSuccess": true, "message": result.message, "data": imageUrls })
        }
        else {
            res.send({ "isSuccess": false, "message": "failed to show image", "data": [] })
        }
    }
    catch (err) {

        errorfunction.errorHandler(err, req, res)
    }
}

const getBrokerUserProfileViewedImageUrl = async (req, res) => {
    try {

        const { profileId } = req.body

        const user = await User.findById(req.user.id)


        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
        const _profiles = await MarriageProfile.findById({ _id: user.profileId })

        const planId = _profiles.planID;

        const _plan = await PlanSchedule.findOne({
            profileID: _profiles._id,
            'planSchedule.planID': planId
        });

        if (_plan && _plan.planSchedule && _plan.planSchedule.length > 0) {
            const firstSchedule = _plan.planSchedule[0];

            const expiryDate = firstSchedule.expiryDate

            const todayDate = new Date();

            if (todayDate >= expiryDate) {
                return
            }

        }


        const _marriageProfileForPlan = await MarriageProfile.findOne({ _id: user.profileId })
        let isProfileViewedToday = await appFunction.isProfileViewedToday(user.profileId, _marriageProfileForPlan.planID, profileId)
        if (!isProfileViewedToday)
            return res.send({ "isSuccess": false, "message": "failed", "data": [] })

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

        let _profile = await MarriageProfile.findById({ _id: profileId });

        var image;
        var firstImageName

        if (_profile && _profile.imageUrls && _profile.imageUrls.length > 0) {
            image = _profile.imageUrls;
            firstImageName = image[0].name;
            let _brokerId;


            _brokerId = user.brokerId

            let _broker = await Broker.findById({ _id: _brokerId });
            const token = blobService.generateSharedAccessSignature(_broker.container, blobName, sharedAccessPolicy);
            const blobResponse = await getImageByContainerAndBlob(_broker.container, firstImageName, token);
            // let sasUrl = blobService.getUrl(_broker.container, firstImageName, token);

            if (!blobResponse || !blobResponse.readableStreamBody) {
                return { profileID: doc.profileID, imageBase64: null };
            }


            let imageToShow;
            imageToShow = blobResponse.readableStreamBody.pipe(sharp())

            const imageBuffer = await streamToBuffer(imageToShow);

            const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

            var imageUrls = []
            if (base64Image) {
                image.forEach(image => {
                    let newsasUrl = base64Image.replace(firstImageName, image.name)
                    imageUrls.push(newsasUrl)
                });
            }

            res.send({ "isSuccess": true, "message": "success", "data": imageUrls })
        }
        else {
            res.send({ "isSuccess": false, "message": "failed", "data": [] })
        }
    }
    catch (err) {

        errorfunction.errorHandler(err, req, res)
    }
}



var containerName = process.env.AZURE_CONTAINER_NAME


/**
 * Function Description: to remove profile image
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const removeProfileImage = asyncHandler(async (req, res) => {
    //const removeProfileImage = async (req, res) => {
    try {

        const { brokerId, profileId, imageName } = req.body


        let _brokerId;

        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }


        _brokerId = brokerId
        if (brokerId == 'null' || !brokerId || (brokerId == null)) {
            const _userRole = await UserRole.findById({ _id: user.roleId });

            if (_userRole.name == userBrokerRole) {
                let _brokerDetail = await Broker.findOne({ userId: req.user.id });
                _brokerId = _brokerDetail._id
            }
        }
        else {
            _brokerId = brokerId
        }
        const profileImage = await MarriageProfile.findOne({ _id: profileId })

        const imageArray = profileImage.imageUrls[imageName]

        let imagename = imageArray.name

        let _broker = await Broker.findById({ _id: _brokerId });
        // let imageName ='default_male.png'

        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(_broker.container);
        const blobClient = containerClient.getBlobClient(imagename);

        await blobClient.delete();

        await MarriageProfile.updateOne(
            { "_id": profileId },
            { "$pull": { "imageUrls": { "name": imagename } } }
        );

        res.send({ "isSuccess": true, "message": "Profile picture deleted" })

        //res.status(200).json({"isSuccess":true,"message":"Profile picture deleted"})
    }
    catch (err) {
        res.send({ "isSuccess": false, "message": "Server error while deletion!!!" })
        errorfunction.errorHandler(err, req, res)
    }
})

/**
 * Function Description: to remove all profile images
 * @param profileId - id of profile
 * @param brokerId - id of broker
 * @param userid - id of user
 * @returns - 
 * Author: Magesh M, 21 Nov 2024
 * Update History: 
 */

const removeAllProfileImageByID = async function (profileId, brokerId, userid) {
    try {

        let _brokerId;
        const user = await User.findById(userid)
        if (brokerId == 'null' || !brokerId || (brokerId == null)) {
            const _userRole = await UserRole.findById({ _id: user.roleId });

            if (_userRole.name == userBrokerRole) {
                let _brokerDetail = await Broker.findOne({ userId: userid });
                _brokerId = _brokerDetail._id

            }
        }

        let _broker = await Broker.findById({ _id: _brokerId });
        let marriageProfile = await MarriageProfile.findById({ _id: profileId })

        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(_broker.container);
        for (const item of marriageProfile.imageUrls) {

            const blobClient = containerClient.getBlobClient(item.name);
            await blobClient.delete();
            await MarriageProfile.updateOne(
                { "_id": profileId },
                { "$pull": { "imageUrls": { "name": item.name } } }
            );

        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }

}

const getBrokImageUrl = async (req, res) => {
    try {

        const { brokerId } = req.body

        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }
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
        let _broker = await Broker.findById({ _id: brokerId });
        const token = blobService.generateSharedAccessSignature(_broker.container, blobName, sharedAccessPolicy);
        let sasUrl = blobService.getUrl(_broker.container, _broker.imageName, token);
        res.send({ "isSuccess": true, "message": "success", "data": sasUrl })

        res.send({ "isSuccess": false, "message": "failed", "data": [] })
    }
    catch (err) {

        errorfunction.errorHandler(err, req, res)
    }
}


/**
 * Function Description: to Upload broker image
 * @param {object} req - The request object containing the HTTP request details.
 * @param {object} res - The response object used to send the response.
 * @returns - 
 * Author: Deepika A, 22 June 2025,
 * Update History: 
 */

// const uploadPUProfileImage = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id)

//         if (!user) {
//             return res.status(401).json({ isSuccess: false, message: 'User not found' })
//         }

//         let { originalname, buffer, mimetype } = req.file;

//         const profileDetails = await PublicUserProfile.findById(req.body["profileId"]);

//         if (!profileDetails) {
//             res.status(401);
//             throw new Error('Profile not found');
//         }

//         if (user._id.toString() !== profileDetails.userId.toString()) {
//             res.status(401);
//             throw new Error('Unauthorized Access..');
//         }

//         const fileNameWithoutExtension = path.basename(originalname, path.extname(originalname));

//         const fileExtension = path.extname(originalname);

//         let file_id = fileNameWithoutExtension + profileDetails.name.replace(/\s/g, '')+ fileExtension;

//         let blobname = file_id

//         const configImageLengthDetail = await Config.findOne({ key: "PhotoImageLength" })

//         if (originalname.length > parseInt(configImageLengthDetail.value)) {
//             res.status(200).json({ "isSuccess": false, "message": "Image character length should not exceed " + configImageLengthDetail.value + "(including extension)" })
//             return;
//         }

//         let stream = Readable.from(buffer)
//         let defaultProfileImage = true;

//         let containerClientForUser = blobServiceClient.getContainerClient(profileDetails.container.toLowerCase())

//         const blockBlobClient = containerClientForUser.getBlockBlobClient(blobname);

//         const configImageSize = await Config.findOne({ key: "PhotoSizeInKB" })

//         const uploadedImageSizeInKB = parseInt(req.file.size / 1024);

//         const configImageSizeInKB = parseInt(configImageSize.value)

//         if (configImageSizeInKB < uploadedImageSizeInKB) {
//             res.status(200).json({ "isSuccess": false, "message": "Image size exceeded " + configImageSizeInKB + " kb" })
//             return;
//         }

//         if (profileDetails && profileDetails.imageUrls && profileDetails.imageUrls.length > 0)
//             defaultProfileImage = false

//         if (profileDetails && profileDetails.imageUrls && (profileDetails.imageUrls.length < 3)) {
//             const data = await PublicUserProfile.findByIdAndUpdate(req.body["profileId"], {
//                 $push: {
//                     imageUrls: {
//                         name: file_id,
//                         isProfile: defaultProfileImage
//                     }
//                 }
//             }
//                 , {
//                     new: false, useFindAndModify: true
//                 }
//             )

//             //      if (profileDetails) {
//             //      const data2 = await MarriageProfile.updateMany(
//             //         { publicProfId: req.body["profileId"] },
//             //         {
//             //             $push: {
//             //                 imageUrls: {
//             //                     name: file_id,
//             //                     isProfile: defaultProfileImage
//             //                 }
//             //             }
//             //         },
//             //         {
//             //             new: false,
//             //             useFindAndModify: true
//             //         }
//             //     );
//             // }

//             const azureResponse = await blockBlobClient.uploadStream(stream,
//                 uploadOptions.bufferSize, uploadOptions.maxBuffers,
//                 { blobHTTPHeaders: { blobContentType: mimetype } });

//             res.send({ "isSuccess": true, "message": "File successfully uploaded" })
//         }
//         else {
//             res.send({ "isSuccess": false, "message": "Photo upload exceed the limit" })
//         }
//     }
//     catch (err) {
//         errorfunction.errorHandler(err, req, res)
//         res.send("error while uploading the file..")
//     }
// }

const uploadPUProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ isSuccess: false, message: 'User not found' });
        }

        let { originalname, buffer, mimetype } = req.file;

        const profileDetails = await PublicUserProfile.findById(req.body["profileId"]);
        if (!profileDetails) {
            return res.status(401).json({ isSuccess: false, message: 'Profile not found' });
        }

        if (user._id.toString() !== profileDetails.userId.toString()) {
            return res.status(401).json({ isSuccess: false, message: 'Unauthorized Access' });
        }

        const fileNameWithoutExtension = path.basename(originalname, path.extname(originalname));
        const fileExtension = path.extname(originalname);
        const file_id = fileNameWithoutExtension + profileDetails.name.replace(/\s/g, '') + fileExtension;
        const blobname = file_id;

        const configImageLengthDetail = await Config.findOne({ key: "PhotoImageLength" });
        if (originalname.length > parseInt(configImageLengthDetail.value)) {
            return res.status(200).json({
                isSuccess: false,
                message: `Image character length should not exceed ${configImageLengthDetail.value} (including extension)`
            });
        }

        const uploadedImageSizeInKB = parseInt(req.file.size / 1024);
        const configImageSize = await Config.findOne({ key: "PhotoSizeInKB" });
        const configImageSizeInKB = parseInt(configImageSize.value);

        if (uploadedImageSizeInKB > configImageSizeInKB) {
            return res.status(200).json({
                isSuccess: false,
                message: `Image size exceeded ${configImageSizeInKB / 1024} MB`
            });
        }

        // ➤ Compress image only if > 500KB
        let finalBuffer = buffer;
        if (uploadedImageSizeInKB > 500) {
            console.log("Compressing image...");
            try {
                finalBuffer = await sharp(buffer)
                    .resize({ width: 800, withoutEnlargement: true }) // resize to max width
                    .jpeg({ quality: 70 }) // compress quality
                    .toBuffer();

                console.log(`Compressed image size: ${Math.round(finalBuffer.length / 1024)} KB`);
            } catch (err) {
                console.error("Image compression failed", err);
                return res.status(500).json({ isSuccess: false, message: "Image compression failed" });
            }
        }

        // Convert buffer to stream
        const stream = Readable.from(finalBuffer);

        let defaultProfileImage = !(profileDetails.imageUrls && profileDetails.imageUrls.length > 0);
        if (profileDetails.imageUrls && profileDetails.imageUrls.length < 3) {
            await PublicUserProfile.findByIdAndUpdate(req.body["profileId"], {
                $push: {
                    imageUrls: {
                        name: file_id,
                        isProfile: defaultProfileImage
                    }
                }
            }, {
                new: false,
                useFindAndModify: true
            });

            const containerClientForUser = blobServiceClient.getContainerClient(profileDetails.container.toLowerCase());
            const blockBlobClient = containerClientForUser.getBlockBlobClient(blobname);

            await blockBlobClient.uploadStream(
                stream,
                uploadOptions.bufferSize,
                uploadOptions.maxBuffers,
                { blobHTTPHeaders: { blobContentType: mimetype } }
            );

            return res.status(200).json({ isSuccess: true, message: "File successfully uploaded" });
        } else {
            return res.status(200).json({ isSuccess: false, message: "Photo upload exceed the limit (max 3 photos allowed)" });
        }

    } catch (err) {
        console.error("Upload error:", err);
        errorfunction.errorHandler(err, req, res);
        res.status(500).send("Error while uploading the file.");
    }
};


const getPUImageUrl = async (req, res) => {
    try {
        const { profileId } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }

        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMinutes(startDate.getMinutes() + 100);
        startDate.setMinutes(startDate.getMinutes() - 5); // safe skew

        const sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.READ,
                Start: startDate,
                Expiry: expiryDate,
            },
        };

        const _profile = await PublicUserProfile.findById({ _id: profileId });

         if(_profile.status == "Deleted"){
            res.status(404)
            throw new Error('profile detail not found')
        }

        if (_profile && _profile.imageUrls && _profile.imageUrls.length > 0) {
            const imageUrls = [];

            for (const img of _profile.imageUrls) {
                const blobName = img.name;

                const token = blobService.generateSharedAccessSignature(_profile.container.toLowerCase(), blobName, sharedAccessPolicy);

                const blobResponse = await getImageByContainerAndBlob(_profile.container.toLowerCase(), blobName, token);

                if (!blobResponse || !blobResponse.readableStreamBody) {
                    return { profileID: doc.profileID, imageBase64: null };
                }

                let imageToShow;
                imageToShow = blobResponse.readableStreamBody.pipe(sharp())

                const imageBuffer = await streamToBuffer(imageToShow);

                const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

                imageUrls.push(base64Image);

            }
            return res.send({ isSuccess: true, message: 'success', data: imageUrls });
        } 
        // else {
        //     console.log("error")
        //     return res.send({ isSuccess: false, message: 'No images found', data: [] });
        // }
    } catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
};

const getPUProfileImageURL = async (req, res) => {

    try {
        const { profileId } = req.body

        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(402)
            throw new error('User not found')
        }

        const _userProfilePlan = await PublicUserProfile.findOne({ userId: user.id })

          const plan = await PlanSchedule.findOne({profileID:_userProfilePlan._id})
        
            if(!plan){
                res.status(404)
                throw new error("Plan not found")
             }

        const emptyNameImages = _userProfilePlan.imageUrls

          if(_userProfilePlan.imageUrls.length === 0){
                return res.status(200).json({isSuccess:false,message:"Please update your image first" })
            }

        else if(emptyNameImages){
            const _image = emptyNameImages[0].name
            if(_image == ""){
            return res.status(200).json({isSuccess:false,message:"Please update your image first" })
            }
        }
        const profile = await MarriageProfile.findById({ _id: profileId })
        
                if( profile.isPublicImage === false){
                    res.status(404)
                    throw new error("Image viwe not allowed")
                }

        //    const planId = _userProfilePlan.planID;

        //               const _plan = await PlanSchedule.findOne({
        //                 profileID: _userProfilePlan._id,
        //                 'planSchedule.planID': planId
        //               })

        //               if (_plan && _plan.planSchedule && _plan.planSchedule.length > 0) {
        //                 const firstSchedule = _plan.planSchedule[0];
        //                 const expiryDate = new Date(firstSchedule.expiryDate);
        //                 const todayDate = new Date();

        //                 if(todayDate >= expiryDate) {
        //                   return
        //                 }
        //             }

        let result = await PUPlanFunction.isViewedPlanScheduleLimitExceeded(_userProfilePlan.id, _userProfilePlan.planID, profileId)
        console.log(result)

        if (result.isSuccess == false && result.message != "") {
            return res.send({
                "isSuccess": false,
                "message": result.message, "data": []
            })
        }
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

        let _profile = await MarriageProfile.findById({ _id: profileId })

        var image;
        var firstImageName

        if (_profile && _profile.imageUrls && _profile.imageUrls.length > 0) {
            image = _profile.imageUrls;
            firstImageName = image[0].name;
            let _brokerId

            _brokerId = _profile.brokerId

            let _broker = await Broker.findById({ _id: _brokerId });

            const token = blobService.generateSharedAccessSignature(_broker.container, blobName, sharedAccessPolicy);
            let sasUrl = blobService.getUrl(_broker.container, firstImageName, token);

            var imageUrls = []
            if (sasUrl) {
                image.forEach(image => {
                    let newsasUrl = sasUrl.replace(firstImageName, image.name)
                    imageUrls.push(newsasUrl)
                });
            }

            const data = await PUPlanFunction.CountProfileViewDownload(_userProfilePlan.id, _userProfilePlan.planID, 'ViewImage', profileId)

            res.send({ "isSuccess": true, "message": result.message, "data": imageUrls })
        }
        else {
            console.log("error")
            res.send({ "isSuccess": false, "message": "failed to show image", "data": [] })
        }

    }
    catch (err) {
        errorfunction.errorHandler(err, req, res)
    }
}

const getPUProfileViewedImageURL = async (req, res) => {
    try {

        const { profileId } = req.body

        const user = await User.findById(req.user.id)
        const _userProfilePlan = await PublicUserProfile.findOne({ userId: user.id })

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }

          const plan = await PlanSchedule.findOne({profileID:_userProfilePlan._id})
        
            if(!plan){
                res.status(404)
                throw new error("Plan not found")
             }

        const planId = _userProfilePlan.planID;

        const _plan = await PlanSchedule.findOne({
            profileID: _userProfilePlan._id,
            'planSchedule.planID': planId
        })

        if (_plan && _plan.planSchedule && _plan.planSchedule.length > 0) {
            const firstSchedule = _plan.planSchedule[0];
            const expiryDate = new Date(firstSchedule.expiryDate);
            const todayDate = new Date();

            if (todayDate >= expiryDate) {
                return
            }
        }

          const profile = await MarriageProfile.findById({ _id: profileId })
        
                if( profile.isPublicImage === false){
                    res.status(404)
                    throw new error("Image viwe not allowed")
                }

        let isProfileViewedToday = await PUPlanFunction.isProfileViewedToday(_userProfilePlan.id, _userProfilePlan.planID, profileId)

        if (!isProfileViewedToday) {
            return res.send({ "isSuccess": false, "message": "failed", "data": [] })
        }

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

        let _profile = await MarriageProfile.findById({ _id: profileId });

        var image;
        var firstImageName

        if (_profile && _profile.imageUrls && _profile.imageUrls.length > 0) {
            image = _profile.imageUrls;
            firstImageName = image[0].name;
            let _brokerId;

            _brokerId = _profile.brokerId

            let _broker = await Broker.findById({ _id: _brokerId });

            const token = blobService.generateSharedAccessSignature(_broker.container, blobName, sharedAccessPolicy);

            const blobResponse = await getImageByContainerAndBlob(_broker.container, firstImageName, token);

            if (!blobResponse || !blobResponse.readableStreamBody) {
                return { profileID: doc.profileID, imageBase64: null };
            }

            let imageToShow;
            imageToShow = blobResponse.readableStreamBody.pipe(sharp())

            const imageBuffer = await streamToBuffer(imageToShow);

            const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;


            var imageUrls = []
            if (base64Image) {
                image.forEach(image => {
                    let newsasUrl = base64Image.replace(firstImageName, image.name)
                    imageUrls.push(newsasUrl)
                });
            }

            res.send({ "isSuccess": true, "message": "success", "data": imageUrls })
        }
        else {
            res.send({ "isSuccess": false, "message": "failed", "data": [] })
        }
    }
    catch (err) {

        errorfunction.errorHandler(err, req, res)
    }
}
var containerName = process.env.AZURE_CONTAINER_NAME

const getImageByContainerAndBlob = async (containerName, imageName) => {
    try {
        const containerClient = (name) => blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient(containerName).getBlobClient(imageName);
        const downloadBlockBlobResponse = await blobClient.download();
        return downloadBlockBlobResponse;

    }
    catch (err) {
        return null;
    }
}

const PURemoveProfileImage = asyncHandler(async (req, res) => {
    
    try {

        const { profileId, imageName } = req.body

        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }

        const _userProfile= await PublicUserProfile.findOne({ _id: profileId })

        const image = _userProfile.imageUrls[imageName]
       
        let _imagename = image?.name
 
        const profileImage = await MarriageProfile.find({ publicProfId: profileId })

        const allImageUrls = profileImage .map(profile => profile.imageUrls) .flat();
 
        const _image = allImageUrls[imageName]

        let imagename = _image?.name
        

        const blobNameToDelete = _imagename || imagename;

        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(_userProfile.container.toLowerCase());
        const blobClient = containerClient.getBlobClient(blobNameToDelete);
       
        await blobClient.delete();

        await MarriageProfile.updateMany(
            { "publicProfId": profileId },
            { "$pull": { "imageUrls": { "name": imagename } } }
        );

         await PublicUserProfile.updateOne(
            { "_id": profileId },
            { "$pull": { "imageUrls": { "name": _imagename } } }
        );

        res.send({ "isSuccess": true, "message": "Profile picture deleted" })

       
    }
    catch (err) {
        res.send({ "isSuccess": false, "message": "Server error while deletion!!!" })
        errorfunction.errorHandler(err, req, res)
    }
})

const PUProfileImageUrl = async ( req,res )=>{
    try{

        const user = await User.findById(req.user.id)

         if (!user) {
            res.status(401);
            throw new Error('User not found');
        }

        // console.log("iiiiiii")
        const { profileID } = req.body;
        // console.log("1",req.body)

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

   
       
        const profile = await PublicUserProfile.findById({ _id: profileID })
        // console.log( "3", profile)

        if( profile && profile.imageUrls && profile.imageUrls.length > 0){
            // console.log("hii")
        const imageUrls = []

        var image;

            for (const img of profile.imageUrls) {
                const firstImageName = img.name;
                image = profile.imageUrls;
    
            // console.log(firstImageName)
                const token = blobService.generateSharedAccessSignature(profile.container.toLowerCase(), blobName, sharedAccessPolicy);
                // console.log("4",token)

                const blobResponse = await getImageByContainerAndBlob(profile.container.toLowerCase(), firstImageName, token);
                // console.log(blobResponse)

                if (!blobResponse || !blobResponse.readableStreamBody) {
                    // return { profileID: doc.profileID, imageBase64: null };
                    imageUrls.push(null);
                    continue;
                }

                // let imageToShow;
                const imageToShow = blobResponse.readableStreamBody.pipe(sharp())
                // console.log(imageToShow)

                const imageBuffer = await streamToBuffer(imageToShow);
                // console.log(imageBuffer,"imageBuffer")

                const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
                // console.log(base64Image)
                
                if (base64Image) {
                image.forEach(image => {
                    let newsasUrl = base64Image.replace(firstImageName, image.name)
                    imageUrls.push(newsasUrl)
                });
            }
                
            }
            
            return res.send({ isSuccess: true, message: 'success', data: imageUrls });
        }
    }
    catch (err) {
        errorfunction.errorHandler(err, req, res);
    }
}

const getBrokerProfileImageUrl = async (req, res) => {
    try {

        const { profileId, brokerId } = req.body

        const user = await User.findById(req.user.id)

        if (!user) {
            res.status(401)
            throw new Error('User not found')
        }

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

        let _profile = await MarriageProfile.findById({ _id: profileId });

        if (_profile && _profile.imageUrls && _profile.imageUrls.length > 0) {
            const imageUrls = [];
            let _brokerId;
            for (const img of _profile.imageUrls) {
                const firstImageName = img.name;

                if (brokerId == 'null' || !brokerId || (brokerId == null)) {
                    const _userRole = await UserRole.findById({ _id: user.roleId });

                    if (_userRole.name == userBrokerRole) {
                        let _brokerDetail = await Broker.findOne({ userId: req.user.id });
                        _brokerId = _brokerDetail._id
                    }
                }
                else {
                    _brokerId = brokerId
                }

                let _broker = await Broker.findById({ _id: _brokerId });

                const token = blobService.generateSharedAccessSignature(_broker.container, blobName, sharedAccessPolicy);
                const blobResponse = await getImageByContainerAndBlob(_broker.container, firstImageName, token);

                if (!blobResponse || !blobResponse.readableStreamBody) {
                    return { profileID: doc.profileID, imageBase64: null };
                }

                console.log(firstImageName, 'Success image...')

                let imageToShow;
                imageToShow = blobResponse.readableStreamBody.pipe(sharp())

                const imageBuffer = await streamToBuffer(imageToShow);

                const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

                imageUrls.push(base64Image)
            }

            res.send({ "isSuccess": true, "message": "success", "data": imageUrls })
        }
        else {
            res.send({ "isSuccess": false, "message": "failed", "data": [] })
        }
    }
    catch (err) {

        errorfunction.errorHandler(err, req, res)
    }
}


module.exports = {
    multerFile,
    uploadProfile,
    getImageByName,
    getProfileImageUrl,
    updateImageName,
    uploadProfileImage,
    removeProfileImage,
    uploadBrokerImage,
    removeAllProfileImageByID,
    getBrokerUserProfileImageUrl,
    getBrokerUserProfileViewedImageUrl,
    getBrokImageUrl,
    uploadPUProfileImage,
    getPUImageUrl,
    getImageByContainerAndBlob,
    getPUProfileImageURL,
    getPUProfileViewedImageURL,
    PURemoveProfileImage,
    PUProfileImageUrl,
    getBrokerProfileImageUrl
}