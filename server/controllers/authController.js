const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken: verificationToken,
      emailVerified: false
    });

    if (user) {
      // Create verification URL
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

      // Create email message
      const message = `
        Welcome to PrintMine! Please verify your email address to complete your registration.
        \n\n
        Please click on the following link to verify your email:
        ${verificationUrl}
        \n\n
        If you did not create an account, please ignore this email.
      `;

      // Attempt to send verification email
      try {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification',
          message
        });
      } catch (error) {
        console.error('Failed to send verification email:', error);
        // Proceed even if email fails
      }

      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          token: generateToken(user._id)
        },
        message: 'Registration successful. Please check your email to verify your account.'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login timestamp
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          addresses: user.addresses
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          addresses: updatedUser.addresses,
          token: generateToken(updatedUser._id)
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user by verification token
    const user = await User.findOne({ emailVerificationToken: token });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }
    
    // Update user verification status
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });
    
    // Redirect to frontend verification success page
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-success`);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = verificationToken;
    await user.save({ validateBeforeSave: false });
    
    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
    
    // Create email message
    const message = `
      Please verify your email address to complete your registration.
      \n\n
      Please click on the following link to verify your email:
      ${verificationUrl}
      \n\n
      If you did not create an account, please ignore this email.
    `;
    
    // Attempt to send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message
      });
      
      res.status(200).json({
        success: true,
        message: 'Verification email has been sent'
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Create email message
    const message = `
      You are receiving this email because you (or someone else) has requested to reset your password.
      Please click on the following link to reset your password:
      \n\n
      ${resetUrl}
      \n\n
      This link will expire in 10 minutes.
      \n\n
      If you did not request this, please ignore this email and your password will remain unchanged.
    `;

    // Attempt to send email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      // If sending email fails, reset token fields and save
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Validate reset token
// @route   GET /api/auth/reset-password/:token
// @access  Public
exports.validateResetToken = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with valid token and non-expired token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with valid token and non-expired token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send confirmation email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Successful',
        message: 'Your password has been successfully reset. If you did not make this change, please contact our support team immediately.'
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Continue with the process even if confirmation email fails
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
