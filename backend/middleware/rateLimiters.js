const rateLimit = require('express-rate-limit');

const levelOneRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 min
  max: 20, // Allow 20 requests
  keyGenerator: ((req) => req.user?.id) || ((req) => req.ip),
  message: "Too many requests to sensitive data. Try again in 1 hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for general APIs
const levelTwoRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Allow 100 requests
  keyGenerator: ((req) => req.user?.id) || ((req) => req.ip),
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const levelThreeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow 100 requests
  keyGenerator: ((req) => req.user?.id) || ((req) => req.ip),
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const levelFourRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Allow 100 requests
  keyGenerator: ((req) => req.user?.id) || ((req) => req.ip),
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const levelFiveRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Allow 100 requests
  keyGenerator: ((req) => req.user?.id) || ((req) => req.ip),
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {levelOneRateLimit, levelTwoRateLimit, levelThreeRateLimit, levelFourRateLimit, levelFiveRateLimit };
   


