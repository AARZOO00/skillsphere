const crypto = require('crypto');
const User = require('../models/User.model');
const Freelancer = require('../models/Freelancer.model');
const { generateToken, generateRandomToken } = require('../utils/generateToken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/sendEmail');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, city, state, country } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const verToken = generateRandomToken();
    const user = await User.create({
      name, email, password, role,
      location: { city: city || '', state: state || '', country: country || '' },
      emailVerificationToken: crypto.createHash('sha256').update(verToken).digest('hex'),
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000
    });

    if (role === 'freelancer')
      await Freelancer.create({ user: user._id, title: 'Freelancer', bio: '' });

    try { await sendVerificationEmail(user, verToken); } catch(e) { console.log('Email error:', e.message); }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify.',
      token: generateToken(user._id),
      user
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user || !user.password || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isEmailVerified)
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    if (user.isSuspended)
      return res.status(403).json({ success: false, message: 'Account suspended: ' + user.suspendReason });
    if (user.twoFactorEnabled) {
      if (!twoFactorCode)
        return res.json({ success: true, twoFactorRequired: true });
      const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: twoFactorCode, window: 1 });
      if (!ok) return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
    }
    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, token: generateToken(user._id), user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.googleCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.redirect(process.env.CLIENT_URL + '/oauth-success?token=' + token);
  } catch (err) { res.redirect(process.env.CLIENT_URL + '/login?error=oauth_failed'); }
};

exports.verifyEmail = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ emailVerificationToken: hashed, emailVerificationExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Email verified!', token: generateToken(user._id), user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });
    const resetToken = generateRandomToken();
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpire = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    try { await sendPasswordResetEmail(user, resetToken); } catch(e) { console.log('Email error:', e.message); }
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successful', token: generateToken(user._id) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: 'SkillSphere (' + req.user.email + ')', length: 20 });
    await User.findByIdAndUpdate(req.user._id, { twoFactorSecret: secret.base32 });
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ success: true, secret: secret.base32, qrCode });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: req.body.code, window: 1 });
    if (!ok) return res.status(400).json({ success: false, message: 'Invalid code' });
    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: '2FA enabled' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.disable2FA = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: false, twoFactorSecret: undefined });
    res.json({ success: true, message: '2FA disabled' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMe = (req, res) => res.json({ success: true, user: req.user });

exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Email already verified' });
    const verToken = generateRandomToken();
    user.emailVerificationToken = crypto.createHash('sha256').update(verToken).digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(user, verToken);
    res.json({ success: true, message: 'Verification email resent' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
