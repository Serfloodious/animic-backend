const Anime = require('../models/Anime');
const Comic = require('../models/Comic');
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            role
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({
            success: false, 
            error: 'Cannot register user'
        });
        console.log(err.stack);
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false, 
                message: 'Please provide both email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(401).json({
            success: false,
            message: 'Password or email cannot be converted to string'
        });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user
    });
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
};

// @desc    Update user details (Username, Email)
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
    try {
        // Filter out unwanted fields that are not allowed to be updated e.g. role, password
        const fieldsToUpdate = {
            username: req.body.username,
            email: req.body.email
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true // Check for unique email/username and other validators defined in the User model
        });

         if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.log(err);
        let errorMessage = 'Cannot update user details';

        if (err.code === 11000) {
            if (err.keyValue.email) {
                errorMessage = 'Email already exists';
            } else if (err.keyValue.username) {
                errorMessage = 'Username already exists';
            }
        }
        res.status(400).json({ 
            success: false, 
            message: errorMessage
        });
    }
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        // Find user by ID and select password field explicitly
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        // Set new password
        user.password = req.body.newPassword;

        await user.save(); // Save the user to hash the new password and update it in the database

        // Generate new token with updated password
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ 
            success: false, 
            message: 'Cannot update password'
        });
    }
};

// @desc    Logout user / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};

// @desc    Delete Account
// @route   DELETE /api/v1/auth/deleteaccount
// @access  Private
exports.deleteAccount = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await Anime.deleteMany({user: req.user.id});
        await Comic.deleteMany({user: req.user.id});
        await User.deleteOne({_id: req.user.id});

        res.status(200)
            .cookie('token', 'none', {
                expires: new Date(Date.now() + 10 * 1000),
                httpOnly: true
            })
            .json({
                success: true,
                data: {}
            });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: 'Cannot delete account'
        });
    }
};