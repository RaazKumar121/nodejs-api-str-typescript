import nodemailer from "nodemailer";

// Define type for email options
interface SendMailOptions {
  email: string;
  otp: string;
  isOtp: boolean;
}

// Create transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT), // Port should be a number
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Function to send an email
const sendMail = async ({
  email,
  otp,
  isOtp,
}: SendMailOptions): Promise<boolean> => {
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            margin: 0;
            padding: 0;
        }
        .container {
            background-color: #ffffff;
            width: 80%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #333333;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>OTP Verification</h1>
        </div>
        <div class="content">
            <p>Dear ${email},</p>
            <p>Thank you for registering with us. Please use the following OTP to verify your email address:</p>
            <p class="otp">${otp}</p>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you did not request this email, please ignore it.</p>
        </div>
        <div class="footer">
            <p>Thank you,<br>admin@gmail.com</p>
        </div>
    </div>
</body>
</html>
`;

  try {
    await transporter.sendMail({
      from: '"Task App 👻" <support@hitplay99.com>', // sender address
      to: email, // recipient address
      subject: "OTP Verification", // Subject line
      text: "Dear User, your verification code is:", // plain text body
      html: isOtp ? body : undefined, // HTML body or undefined
    });
    return true;
  } catch (error: any) {
    console.error("Error sending email:", error.message);
    return false;
  }
};

export default sendMail;
