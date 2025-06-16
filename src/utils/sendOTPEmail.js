const nodemailer = require('nodemailer');

const getEmailTemplate = (type, otp) => {
    const templates = {
        verification: {
            subject: 'Your Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Email Verification</h2>
                    <p style="font-size: 16px; color: #666;">Your verification code is:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #007bff; margin: 0; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p style="font-size: 14px; color: #888;">This code will expire in 10 minutes.</p>
                    <p style="font-size: 14px; color: #888;">If you didn't request this code, please ignore this email.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message, please do not reply.</p>
                </div>
            `
        },
        passwordReset: {
            subject: 'Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p style="font-size: 16px; color: #666;">You have requested to reset your password. Your OTP code is:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #007bff; margin: 0; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p style="font-size: 14px; color: #888;">This code will expire in 10 minutes.</p>
                    <p style="font-size: 14px; color: #888;">If you didn't request this code, please ignore this email and ensure your account is secure.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message, please do not reply.</p>
                </div>
            `
        }
    };

    return templates[type] || templates.verification;
};

const sendOTPEmail = async (recipientEmail, otp, type = 'verification') => {
    try {
        // Debug logs
        console.log(`Sending ${type} OTP to recipient:`, recipientEmail);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'hassanain.imsciences@gmail.com',
                pass: process.env.EMAIL_PASS || 'ckar pbrw jleu wcoh'
            },
        });

        // Verify transporter configuration
        await transporter.verify();
        console.log('SMTP connection verified successfully');

        const template = getEmailTemplate(type, otp);

        const mailOptions = {
            from: `"DGdorm Auth" <${process.env.EMAIL_USER || 'hassanain.imsciences@gmail.com'}>`,
            to: recipientEmail,
            subject: template.subject,
            html: template.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`${type} OTP sent successfully to ${recipientEmail}`, info.messageId);
        return info;
    } catch (error) {
        console.error('Detailed email error:', error);
        throw new Error('Email sending failed: ' + error.message);
    }
};

module.exports = { sendOTPEmail }; 