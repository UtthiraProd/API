const nodemailer = require('nodemailer');


var SendEmailOTP = {
  SendEmailOTP: async function (email, emailotp) {

    // Create transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail', // or use another service like 'hotmail', 'yahoo'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // not your Gmail password!
      }
    });

    let mailOptions = {
      from: '"Utthira" <noreply@utthira.com>', // include email address here
      to: email,
      subject: `Utthira verification code: ${emailotp}`,
      text: `Dear User,
    
    Utthira verification code: ${emailotp}
    
    Please do not share this OTP with anyone. It is valid for the next 10 minutes.
    
    Thank you,
    Team Utthira`,

      html: `
        <p>Dear User,</p>
        <p><strong>Utthira</strong> verification code:</p>
        <h2 style="color: #2e6c80;">${emailotp}</h2>
        <p>This OTP is valid for the next <strong>10 minutes</strong>. Please do not share it with anyone.</p>
        <p>Thank you,<br>Team Utthira</p>
      `
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log('Error:', error);
      }
      console.log('Email sent:', info.response);
    });

  },

  SendEmailForgetUser: async function (email) {
    console.log(email)
    // Create transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail', // or use another service like 'hotmail', 'yahoo'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // not your Gmail password!
      }
    });

    let mailOptions = {
      from: '"Utthira" <noreply@utthira.com>', // include email address here
      to: email,
      subject: `Utthira Username Recovery`,
      text: `Dear User,
    
            We received a request to recover the username associated with this email.

            Your Utthira Username: ${email}

            Please keep this information secure and do not share it with anyone.

            If you did not request this, please ignore this message.
    
    Thank you,
    Team Utthira`,

      html: `
        <p>Dear User,</p>
        <p><strong>Utthira</strong> Username Recovery</p>
        <h2 style="color: #2e6c80;">${email}</h2>
        <p>We received a request to recover the username associated with this email.
        Your Utthira Username: <strong> ${email}</strong>. Please keep this information secure and do not share it with anyone.</p>
        <p> If you did not request this, please ignore this message.</p>
        <p>Thank you,<br>Team Utthira</p>
      `
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log('Error:', error);
      }
      console.log('Email sent:', info.response);
    });
  }

}



module.exports = SendEmailOTP