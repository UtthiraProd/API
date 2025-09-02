const Razorpay = require("razorpay");
const { errorfunction } = require('../controllers/commonController')
const express = require("express");
const app = express();
app.disable('x-powered-by');
app.use(express.json());

var razorPayment = {
  sendPayment: async function (amount) {

    const razorpay = new Razorpay({
      key_id: "rzp_live_5SdI4z6m1IzPbU",       // move to .env for safety
      key_secret: "Bq8wjPTaY9zsjyBdMzajBxdi",  // NEVER expose in frontend
    });

    app.post("/create-order", async (req, res) => {
      try {
        const options = {
          amount: amount * 100, // ₹100 in paise
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

  }
}


async function sendRazorPayment(amount, req, res) {
  try {

    const razorpay = new Razorpay({
      key_id: "rzp_live_5SdI4z6m1IzPbU",       // move to .env for safety
      key_secret: "Bq8wjPTaY9zsjyBdMzajBxdi",  // NEVER expose in frontend
    });

    try {
      const options = {
        amount: amount * 100, // ₹100 in paise
        currency: "INR",
        receipt: "order_rcptid_11",
      };
      const order = await razorpay.orders.create(options);
      return order;
      // console.log("✅ Razorpay Order:", order);
      // res.json(order);
    } catch (err) {
      console.error("❌ Order creation error:", err);
      res.status(500).json({ error: "Failed to create Razorpay order" });
    }

  } catch (err) {
    errorfunction.errorHandler(err, req, res)
    console.error('Failed to create audit log:', err);
  }
}


async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const key_secret = "Bq8wjPTaY9zsjyBdMzajBxdi";
  const generated_signature = crypto
    .createHmac('sha256', key_secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    // Signature is valid
    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } else {
    // Invalid signature (possible tampering)
    res.status(400).json({ success: false, message: 'Payment verification failed' });
  }
}





module.exports = { sendRazorPayment, verifyPayment };