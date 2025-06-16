const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail } = require('../utils/sendOTPEmail');
const { connectDB } = require('../db/db.js');

// Generate JWT Token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'dgdorm_secure_jwt_secret_key_2024';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '30d'
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register a new user
// exports.register = async (req, res) => {
//     try {
//         const { email, password, name, phone } = req.body;

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'User already exists'
//             });
//         }

//         // Generate OTP
//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//         // Create new user with OTP
//         const user = await User.create({
//             email,
//             password,
//             name,
//             phone,
//             otp: {
//                 code: otp,
//                 expires: otpExpiry,
//                 attempts: 0,
//                 lastSent: new Date()
//             }
//         });

//         // Send OTP email
//         await sendOTPEmail(email, otp);

//         res.status(201).json({
//             success: true,
//             message: 'Registration successful. Please verify your email with the OTP sent.',
//             data: {
//                 email: user.email,
//                 name: user.name
//             }
//         });
//     } catch (error) {
//         console.error('Registration error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Registration failed',
//             error: error.message
//         });
//     }
// };
// ...existing code...
exports.register = async (req, res) => {
    try {
        await connectDB();
        const { email, password, name, phone, location, devicePreferences } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create new user with OTP, location, and devicePreferences
        const user = await User.create({
            email,
            password,
            name,
            phone,
            location,
            devicePreferences,
            otp: {
                code: otp,
                expires: otpExpiry,
                attempts: 0,
                lastSent: new Date()
            }
        });

        // Send OTP email
        await sendOTPEmail(email, otp);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email with the OTP sent.',
            data: {
                email: user.email,
                name: user.name,
                location: user.location,
                devicePreferences: user.devicePreferences
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};
// ...existing code...

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        await connectDB();
        const email = req.query.email || req.body.email;
        const otp = req.query.otp || req.body.otp;

        console.log('OTP Verification attempt:', { email, otp });

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.otp || !user.otp.code) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found. Please request a new OTP'
            });
        }

        console.log('Stored OTP:', {
            code: user.otp.code,
            expires: user.otp.expires,
            attempts: user.otp.attempts
        });

        if (user.otp.expires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP'
            });
        }

        if (user.otp.attempts >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Maximum OTP attempts reached. Please request a new OTP'
            });
        }

        if (user.otp.code !== otp) {
            user.otp.attempts += 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
                attemptsLeft: 3 - user.otp.attempts
            });
        }

        user.isVerified = true;
        user.otp = {
            code: null,
            expires: null,
            attempts: 0,
            lastSent: null
        };
        await user.save();

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'dgdorm_secure_jwt_secret_key_2024',
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed',
            error: error.message
        });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        await connectDB();
        const email = req.query.email || req.body.email;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user's OTP
        user.otp = {
            code: otp,
            expires: otpExpiry,
            attempts: 0,
            lastSent: new Date()
        };
        await user.save();

        // Send new OTP email
        await sendOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            message: 'New OTP sent successfully',
            data: {
                email: user.email,
                expiresIn: '10 minutes'
            }
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend OTP',
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        await connectDB();
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email first'
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'dgdorm_secure_jwt_secret_key_2024',
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        await connectDB();
        const email = req.query.email || req.body.email;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user's OTP
        user.otp = {
            code: otp,
            expires: otpExpiry,
            attempts: 0,
            lastSent: new Date()
        };
        await user.save();

        // Send password reset OTP email
        await sendOTPEmail(email, otp, 'passwordReset');

        res.status(200).json({
            success: true,
            message: 'Password reset OTP sent successfully',
            data: {
                email: user.email,
                expiresIn: '10 minutes'
            }
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send password reset OTP',
            error: error.message
        });
    }
};

// Verify OTP for password reset
exports.verifyResetOTP = async (req, res) => {
    try {
        await connectDB();
        const email = req.query.email || req.body.email;
        const otp = req.query.otp || req.body.otp;

        console.log('Password reset OTP verification attempt:', { email, otp });

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.otp || !user.otp.code) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found. Please request a new OTP'
            });
        }

        if (user.otp.expires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP'
            });
        }

        if (user.otp.attempts >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Maximum OTP attempts reached. Please request a new OTP'
            });
        }

        if (user.otp.code !== otp) {
            user.otp.attempts += 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
                attemptsLeft: 3 - user.otp.attempts
            });
        }

        // OTP is valid, generate a temporary token for password reset
        const resetToken = jwt.sign(
            { id: user._id, purpose: 'password_reset' },
            process.env.JWT_SECRET || 'dgdorm_secure_jwt_secret_key_2024',
            { expiresIn: '15m' }
        );

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            resetToken
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed',
            error: error.message
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        await connectDB();
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Reset token and new password are required'
            });
        }

        // Verify the reset token
        const decoded = jwt.verify(
            resetToken,
            process.env.JWT_SECRET || 'dgdorm_secure_jwt_secret_key_2024'
        );

        if (decoded.purpose !== 'password_reset') {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset token'
            });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password and clear OTP
        user.password = newPassword;
        user.otp = {
            code: null,
            expires: null,
            attempts: 0,
            lastSent: null
        };
        await user.save();

        // Generate new JWT token for login
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'dgdorm_secure_jwt_secret_key_2024',
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset failed',
            error: error.message
        });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        await connectDB();
        // Since we're using JWT, we don't need to do anything server-side
        // The client should remove the token
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
}; 