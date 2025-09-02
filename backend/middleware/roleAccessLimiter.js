const userAccessApiRole = require('../models/userAccessApiRoleModel')
const routeApi = require('../models/routeApiModel')

const isValidApiAccessForRole = async function (req) {

    const isValidAccess = false;

    const userAccessAPI = await userAccessApiRole.find({ roleId: req.user.roleId })

    // console.log(userAccessAPI)

    if (userAccessAPI && userAccessAPI.length > 0) {
        for (const userAccessAPIData of userAccessAPI) {


            for (const element of userAccessAPIData.routeApiIds) {

                const routeApis = await routeApi.findById(element);

                for (const api of routeApis.apiList) {

                    // console.log('api url:'+ api.apiUrl)
                    //console.log('original url:'+ req.originalUrl)

                    if(req.originalUrl.includes('?'))
                    {
                        if(api.apiUrl == req.originalUrl.split('?')[0]) {
                            return true;
                        }
                    }
                    else if(api.apiUrl == req.originalUrl)
                    {
                        return true;
                    }
                }

            }

        }
    } else {
        return false;
    }
    return isValidAccess;
}


module.exports = { isValidApiAccessForRole }