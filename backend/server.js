const express = require('express')
const cors = require('cors');
const app = express()
const PORT =  process.env.PORT || 4000;
require('dotenv').config()
const connectDB = require('./config/db')
const {errorHandler} = require('./controllers/commonController')
const {multerFile,uploadProfile,getProfileImageUrl,uploadBrokerImage} = require('./azureservice/fileUploadService')
const bodyParser = require('body-parser');
const { protect } = require('./middleware/authMiddleware')
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const path = require('path');
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'config', 'utthira-1732172606054-54be0538d4f7.json');

const { google } = require('googleapis');

app.disable('x-powered-by');


async function authenticate() {
  const auth = new google.auth.GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  
  const authClient = await auth.getClient();
  console.log('Authenticated successfully');
}

authenticate().catch((err) => console.error('Authentication failed:', err));
// console.log("error")

const apiMaximumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

const apiMediumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

const apiMinimumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

// Function to create a rate limiter
const createRateLimiter = (keyGenerator) => 
  rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes
    max: 1000, // Maximum number of requests
    keyGenerator, // Custom key generator
    message: "Too many requests, please try again later.",
    standardHeaders: true, // Send rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });


const userLimiter = createRateLimiter((req) => req.user?.id || req.ip);

// IP-based rate limiter
const ipLimiter = createRateLimiter((req) => req.ip);

// Apply the limiters
// Apply IP-based limiter to all routes
//app.use(ipLimiter);
//app.use(userLimiter);

//const {protect} = require('../backend/middleware/authMiddleware')
//console.log(process.env.SECRET_KEY)
//const multerFile = multer({ storage: multer.memoryStorage() }).single("file")
console.log("server started")

connectDB();

const corsOptions = {
    origin: process.env.UI_ORIGIN  ,  // or specify the exact frontend domain
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'POST','DELETE'],
  }
  
app.use(cors(corsOptions));
app.use(express.urlencoded({extended:true}));
app.options('*',cors())
app.use(bodyParser.raw({ limit: '3mb', type: 'image/*' }));
app.use(helmet());
// Configure HSTS specifically
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true, // Apply to all subdomains
    preload: true, // Allow the site to be included in browser preload lists
  })
);
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, access-control-allow-origin");
//     next();
//     });

app.use(express.json())
app.use(express.urlencoded({extended:false}))

// app.use('/api/users',apiMinimumLimiter,require('./routes/userroutes'))
// app.use('/api/broker',apiMaximumLimiter,require('./routes/brokerRoutes'))
// app.use('/api/config',apiMaximumLimiter,require('./routes/masterDataRoutes'))
// app.use('/api/profile',apiMaximumLimiter,require('./routes/marriageProfileRoutes'))
// app.use('/api/master',apiMaximumLimiter,require('./routes/masterDataRoutes'))
// app.use('/api/dashboard',apiMaximumLimiter,require('./routes/dashboardRoutes'))
// app.use('/api/cloud',apiMinimumLimiter,require('./routes/azureRoutes'))

app.use('/api/users',require('./routes/userroutes'))
app.use('/api/config',require('./routes/masterDataRoutes'))
app.use('/api/profile',require('./routes/marriageProfileRoutes'))
app.post("/api/file/upload",apiMinimumLimiter,multerFile,uploadProfile)
app.post("/api/file/uploadBrokerImage",apiMinimumLimiter,multerFile,uploadBrokerImage)
app.get("/api/file/getProfileImage",apiMaximumLimiter,getProfileImageUrl)
//app.get("/api/file/updateImageName",updateImageName)
// app.use('/api/broker',require('./routes/brokerRoutes'))
// app.use('/api/brokerProfile',require('./routes/brokerProfileRoutes'))
// app.use('/api/master',require('./routes/masterDataRoutes'))
// app.use('/api/dashboard',require('./routes/dashboardRoutes'))
// app.use('/api/cloud',require('./routes/azureRoutes'))
// app.use('/api/userProfile', require('./routes/userProfileRoute'))
// app.use('/api/brokerUser',require('./routes/BUmarriageProfileRoutes'))

/**Azure **/
app.use('/api/cloud',require('./routes/azureRoute/azureRoutes'))

/**Admin**/
app.use('/api/plan', require('./routes/admin/planRoute'))
app.use('/api/master',require('./routes/admin/masterDataRoutes'))
app.use('/api/admin',require('./routes/admin/adminMarrProfRoutes'))
app.use('/api/PUprofile',require('./routes/admin/PUprofileRoutes'))

/**Broker Routes**/
app.use('/api/plan', require('./routes/broker/planRoute'))
app.use('/api/users',require('./routes/broker/userroutes'))
app.use('/api/broker',require('./routes/broker/brokerRoutes'))
app.use('/api/dashboard',require('./routes/broker/dashboardRoutes'))
app.use('/api/userProfile', require('./routes/broker/userProfileRoute'))
app.use('/api/brokerProfile',require('./routes/broker/brokerProfileRoutes'))

/**Broker user Route**/
app.use('/api/brokerUser',require('./routes/BrokerUser/BUmarriageProfileRoutes'))

/**Public user Route**/
app.use('/api/public',require('./routes/publicUser/PUBrokerRoute'))
app.use('/api/public',require('./routes/publicUser/profileRoute'))
app.use('/api/publicPlan', require ('./routes/publicUser/PUplanRoute'))
app.use('/api/broker',require('./routes/broker/brokerRoutes'))

//gpay code start

const Razorpay = require("razorpay");
app.use(cors());
app.use(express.json());
const crypto = require('crypto');

// ✅ Use environment variables in production
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,     // move to .env for safety
  key_secret: process.env.RAZORPAY_KEY_SECRET,  // NEVER expose in frontend
});

// 🔹 Order creation endpoint
app.post("/create-order", async (req, res) => {
  try {

const { amount } = req.body;
if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount provided" });
    }

    const options = {
      amount: parseInt(amount) * 100, // convert ₹ to paise
      currency: "INR",
      receipt: "order_rcptid_11",
    };
    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay Order:", order);
    res.json(order);
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});


app.post('/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const key_secret = razorpay.key_secret; // Keep it in .env

  const generated_signature = crypto
    .createHmac('sha256', key_secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    // Signature is valid
    res.status(200).json({ success: true, message: 'Pgenerated_signature:'+ generated_signature +' razorpay_signature:'+
       razorpay_signature +' razorpay_order_id:'+razorpay_order_id + ' razorpay_payment_id:'+ razorpay_payment_id});
  } else {
    // Invalid signature (possible tampering)
    res.status(400).json({ success: false,  message: 'Pgenerated_signature:'+ generated_signature +' razorpay_signature:'+
       razorpay_signature +' razorpay_order_id:'+razorpay_order_id + ' razorpay_payment_id:'+ razorpay_payment_id});
  }
});


//gpay code end



app.listen(PORT,()=> console.log(`Server started on port ${PORT}`))