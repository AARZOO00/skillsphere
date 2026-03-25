const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6, select: false },
  role:     { type: String, enum: ['client','freelancer','admin'], default: 'client' },
  avatar:   { type: String, default: '' },
  phone:    { type: String, default: '' },
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  isEmailVerified:       { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken:    String,
  passwordResetExpire:   Date,
  twoFactorEnabled:      { type: Boolean, default: false },
  twoFactorSecret:       { type: String, select: false },
  googleId:              String,
  isActive:              { type: Boolean, default: true },
  isSuspended:           { type: Boolean, default: false },
  suspendReason:         String,
  lastSeen:              { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.index({ 'location.coordinates': '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.twoFactorSecret;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
