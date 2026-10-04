
import nodemailer from "nodemailer";

const transporter = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });
    await transporter.sendMail(options);
};


const sendRegisterOtp = async (email, name, otp, isForgotPassword = false) => {

    if (!isForgotPassword) {
        if (!email) {
            throw new Error('Email is required to send OTP');
        }

        if (!otp) {
            throw new Error('OTP is required to send OTP');
        }
    }

    try {
        await transporter({
            from: `"express app" <${process.env.SMTP_USER}>`,
            to: email,
            subject: isForgotPassword ? "Forgot Password OTP" : "Email Verification OTP",
            html: `
        <h2>Hello ${name}</h2>

        <p>Your ${isForgotPassword ? "forgot password" : "email verification"} OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP will expire in 10 minutes.</p>

        <p>Do not share this OTP with anyone.</p>
      `,
        });

    }
    catch (error) {
        console.error('Error sending OTP email:', error);
    }

}


export default sendRegisterOtp