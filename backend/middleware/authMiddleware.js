const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const rateLimit = require('express-rate-limit');
const JWT_SECRETE = 'Ganapathy@123'
const { sensitiveDataLimiter, generalApiLimiter } = require('./rateLimiters');
const { isValidApiAccessForRole } = require('./roleAccessLimiter');
const User = require('../models/userModel')

// Custom rate limiter creation function
// const createRateLimiter = (keyGenerator, options = {}) => {
//   return rateLimit({
//     windowMs: options.windowMs || 15 * 60 * 1000, // Default: 15 minutes
//     max: options.max || 500, // Default: 500 requests per window
//     keyGenerator: keyGenerator || ((req) => req.ip), // Default key: IP address
//     message: options.message || "Too many requests, please try again later.",
//     standardHeaders: options.standardHeaders !== undefined ? options.standardHeaders : true, // Default: true
//     legacyHeaders: options.legacyHeaders !== undefined ? options.legacyHeaders : false, // Default: false
//   });
// };

const protect = asyncHandler(async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {

      token = req.headers.authorization.split(' ')[1]
      const decode = jwt.verify(token, JWT_SECRETE)
      req.user = await User.findById(decode.id).select('-password')

       await User.updateOne({ _id: decode.id }, { $set: { lastLogginedTime: new Date(), } })

      const isValidAccess = await isValidApiAccessForRole(req)

      // if (req.path === '/searchProfile') {
      //   generalApiLimiter(req, res, next);
      // } else {
      //   generalApiLimiter(req, res, next);
      // }

      if (isValidAccess) {
        // console.log('Valid Access..')
      }

      if (!isValidAccess) {
        res.status(401)
        console.log('Unauthorized Access..'+ req.originalUrl)
        throw new Error('Unauthorized access!!')
      }
next()
//
    }
    catch (error) {
      console.log(error)
      res.status(401)
      throw new Error('Not authorized!!')

    }
  }
  else {
    next()
  }
})

module.exports = { protect }