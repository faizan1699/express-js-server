import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/users/users-modal.js';
import sendRegisterOtp from '../hooks/nodeMailer.js';
import { getOTP } from "../hooks/hook.js";

const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/refresh-token',
    maxAge: 7 * 24 * 60 * 60 * 1000
});

const getJwtSecret = (secretName, fallback) => {
    const secret = process.env[secretName] || fallback;
    if (!secret) {
        throw new Error(`${secretName} is not configured`);
    }
    return secret;
};

const createAccessToken = (userId) => jwt.sign(
    { sub: userId, type: 'access' },
    getJwtSecret('JWT_ACCESS_SECRET', process.env.JWT_SECRET),
    { expiresIn: '15m' }
);

const createRefreshToken = (userId) => jwt.sign(
    { sub: userId, type: 'refresh' },
    getJwtSecret('JWT_REFRESH_SECRET'),
    { expiresIn: '7d' }
);

const createUser = async (req, res) => {
    try {
        const reqBody = req.body ?? {};
        const { name, email, password } = reqBody;
        const otp = getOTP();

        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(200).json({
                message: 'User already exists'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Users({
            name,
            email,
            password: hashedPassword,
            otp: otp,
        })
        await newUser.save();

        await sendRegisterOtp(email, name, otp);

        res.status(200).json({
            message: 'User created successfully and please verify your email',
            status: true
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }
}

const loginUser = async (req, res) => {

    try {

        const reqBody = req.body ?? {};
        const { email, password } = reqBody;
        
        const user = await Users.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
                status: false
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials",
                status: false
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in',
                status: false
            });
        }

        const userId = user._id.toString();
        const accessToken = createAccessToken(userId);
        const refreshToken = createRefreshToken(userId);

        res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
        return res.status(200).json({
            message: "You are logged in successfully",
            status: true,
            user: {
                id: userId,
                name: user.name,
                email: user.email
            },
            accessToken
        });

    }
    catch (error) {
        res.status(500).json({
            message: 'Error logging in user',
            error: error.message
        });
    }

}

const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({
            message: 'Refresh token is required'
        });
    }

    let refreshSecret;
    try {
        refreshSecret = getJwtSecret('JWT_REFRESH_SECRET');
    } catch (error) {
        return res.status(500).json({
            message: 'Refresh token configuration error',
            error: error.message
        });
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, refreshSecret);
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.clearCookie('refreshToken', getRefreshCookieOptions());
            return res.status(401).json({
                message: 'Invalid or expired refresh token'
            });
        }
        throw error;
    }

    if (typeof payload === 'string' || payload.type !== 'refresh' || !payload.sub) {
        res.clearCookie('refreshToken', getRefreshCookieOptions());
        return res.status(401).json({
            message: 'Invalid refresh token'
        });
    }

    try {
        const user = await Users.findById(payload.sub).select('_id');
        if (!user) {
            res.clearCookie('refreshToken', getRefreshCookieOptions());
            return res.status(401).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            accessToken: createAccessToken(user._id.toString())
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error refreshing access token',
            error: error.message
        });
    }
};

const verifyUser = async (req, res) => {
    try {

        const reqBody = req.body ?? {};
        const { email, otp } = reqBody;

        const user = await Users.findOne({ email }).select('+otp');
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        if (user.otp !== otp) {
            return res.status(400).json({
                message: 'Invalid OTP or Expired OTP'
            });
        }
        user.otp = undefined;
        user.emailVerified = true;
        await user.save();

        res.status(200).json({
            message: 'User verified successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error verifying user',
            error: error.message
        });
    }
}

const getNewOtp = async (req, res) => {
    try {
        const reqBody = req.body ?? {};
        const { email } = reqBody;
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                message: 'Login Pls'
            });
        }

        const newOtp = getOTP();
        user.otp = newOtp;
        await user.save();

        await sendRegisterOtp(email, user.name, newOtp);

        res.status(200).json({
            message: 'New OTP sent successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error generating new OTP',
            error: error.message
        });
    }
}

export {
    createUser,
    verifyUser,
    getNewOtp,
    loginUser,
    refreshAccessToken
}