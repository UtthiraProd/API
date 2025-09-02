
const axios = require('axios');

 var sendMobileOTP = {
    sendMobileOTP:async function(phoneNumber, otp) {

      try {
          const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
              route: 'dlt', // or 'otp', 'transactional', depending on use
              sender_id: 'UTTIRA',
              message: '190603',
              variables_values:otp+'|',
             // language: 'english',
              flash: 0,
              numbers: phoneNumber, // comma-separated list
            },
            {
              headers: {
                "authorization": 'L5Wb7EY3yVKShvGXcgfm2a6pzJTP9UMi1O0nNARD8BItZHwe4qlQtFBbUeCzpWyRIJcA3MZk8aD24Kq9',
                "Content-Type":"application/json"
              },
            }
          );
      
          console.log('SMS Response:', response.data);
        } catch (error) {
          console.log('Error sending SMS:', error.response?.data || error.message);
        }

  }




  




 }



module.exports = sendMobileOTP



// For production use, consider:

// Database storage: Instead of in-memory storage, you should store OTPs and expiration times in a database (e.g., MongoDB, Redis).

// Rate Limiting: Add rate limiting to prevent abuse (e.g., too many OTP requests).

// Secure OTP: Consider adding extra security measures (e.g., hash OTPs before storing them).

// Encryption: Use encryption for sensitive data like phone numbers.

// Validation: Add more validation on phone numbers (e.g., ensuring they are valid).

