const jwt = require('jsonwebtoken');
const { signupSchema, loginSchema, acceptCodeSchema, acceptResetPasswordSchema } = require('../middlewares/validator');

const hash = require('../utils/hashing');
const User = require('../models/user');
const transport = require('../middlewares/sendMail');
exports.signup = async (req, res) => {
    try {
        const {  email, password, phoneNumber } = req.body;
        const {error, value} = signupSchema.validate({email, password, phoneNumber});
        if (error) {
            console.error(error);
            return res.status(400).json({ success:false, message: error.details[0].message });

        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await hash.hashPassword(password);
       const newUser = new User({
            email,
            password: hashedPassword,
            phoneNumber,
        });
        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({ success: true, message: 'User created successfully', data: result });
       
    } catch (error) {
        console.error(error);
       
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const {error, value} = loginSchema.validate({email, password});
        if (error) {
            console.error(error);
            return res.status(400).json({ success:0, message: error.details[0].message });

        }
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'User does not exists' });
        }
        const result = await hash.comparePassword(password, user.password);
        if (!result) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { userId: user._id,
                email: user.email,
                role: user.userRole,
                phoneNumber: user.phoneNumber,
                verified: user.verified,

            }, process.env.JWT_SECRET ,
            {
                expiresIn: '8h',
            }
        );
        res
          .cookie("Authorization", "Bearer " + token, {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: process.env.NODE_ENV === "production",
            secure: process.env.NODE_ENV === "production",
          })
          .json({
            success: true,
            message: "Login successful",
            data: {
              token,
            
            },
          });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

exports.logout = async (req, res) => {
    try {
        res
            .clearCookie("Authorization")
            .json({
                success: true,
                message: "Logout successful",
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


exports.sendVerificationCode = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success:false, message: 'User does not exists' });
        }
        if (user.verified) {
            return res.status(400).json({ success:false, message: 'User already verified' });
        }
        const codeValue = Math.floor(100000 + Math.random() * 100000).toString();

        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: user.email,
            subject: 'Verification Code from LIMOGO',
            text: `Your verification code is ${codeValue}`,
        });

        if (info && info.accepted && info.accepted[0] === user.email) {
            const hashedCodeValue = hash.hmacProcess(codeValue,  process.env.HMAC_VERIFICATION_CODE_SECRET);
            user.verificationCode = hashedCodeValue;
            user.verificationCodeValidation = Date.now();
            await user.save();
            return res.status(200).json({ success: true, message: 'Code sent!' });
        }
        console.error(info);
        res.status(400).json(
            {
                success: false,
                message: "Code sent failed!",
            }
        )



    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
    
}

exports.verifyVerificationCode = async (req, res) => {
    try {
        const {email, providedCode} = req.body;
        const {error, value} = acceptCodeSchema.validate({email, providedCode});
        if (error) {
            console.error(error);
            return res.status(400).json({ success:0, message: error.details[0].message });

        }
        codeValue = providedCode.toString();
        const user = await User.findOne({ email }).select('+verificationCode +verificationCodeValidation');
        if (!user) {
            return res.status(400).json({ success:false, message: 'User does not exists' });
        }
        if (user.verified) {
            return res.status(400).json({ success:false, message: 'User already verified' });
        }
        if (!user.verificationCode || !user.verificationCodeValidation) {
            return res.status(400).json({ success:false, message: 'Verification code not sent' });
        }
        if (Date.now() - user.verificationCodeValidation > 1000 * 60 * 15) {
            return res.status(400).json({ success:false, message: 'Verification code expired' });
        }

        const hashedCode = hash.hmacProcess( codeValue,  process.env.HMAC_VERIFICATION_CODE_SECRET);
        if (user.verificationCode === hashedCode) {
            user.verified = true;
            user.verificationCode = undefined;
            user.verificationCodeValidation = undefined;
            await user.save();
            return res.status(200).json({ success: true, message: 'User verified!' });
        }
        return res.status(400).json({ success:false, message: 'Invalid verification code' });

        

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


exports.sendResetPasswordCode = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success:false, message: 'User does not exists' });
        }
       
        const codeValue = Math.floor(100000 + Math.random() * 100000).toString();

        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: user.email,
            subject: 'RESET PASSWORD Code from LIMOGO',
            text: `OTP: ${codeValue}`,
        });

        if (info && info.accepted && info.accepted[0] === user.email) {
            const hashedCodeValue = hash.hmacProcess(codeValue,  process.env.HMAC_VERIFICATION_CODE_SECRET);
            user.resetPasswordCode = hashedCodeValue;
            user.resetPasswordCodeValidation = Date.now();
            await user.save();
            return res.status(200).json({ success: true, message: 'Code sent!' });
        }
        console.error(info);
        res.status(400).json(
            {
                success: false,
                message: "Code sent failed!",
            }
        )



    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }



    
}



exports.verifyResetPasswordCode = async (req, res) => {
    const {email, newpassword, providedCode} = req.body;
    try {
        const {error, value} = acceptResetPasswordSchema.validate({email, newpassword,  providedCode});
        if (error) {
            console.error(error);
            return res.status(400).json({ success: false, message: error.details[0].message });

        }
        codeValue = providedCode.toString();
        const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordCodeValidation');
        if (!user) {
            return res.status(400).json({ success:false, message: 'User does not exists' });
        }
       
        if (!user.resetPasswordCode || !user.resetPasswordCodeValidation) {
            return res.status(400).json({ success:false, message: 'Verification code not sent' });
        }
        if (Date.now() - user.resetPasswordCodeValidation> 1000 * 60 * 15) {
            return res.status(400).json({ success:false, message: 'Verification code expired' });
        }

        const hashedCode = hash.hmacProcess( codeValue,  process.env.HMAC_VERIFICATION_CODE_SECRET);
        if (user.resetPasswordCode === hashedCode) {
            user.verified = true;
            user.resetPasswordCode = undefined;
            user.resetPasswordCodeValidation = undefined;
            user.password = await hash.hashPassword(newpassword);
            await user.save();
            return res.status(200).json({ success: true, message: 'User password changed successfully' });
        }
        return res.status(400).json({ success:false, message: 'Invalid Code!' });

        

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
