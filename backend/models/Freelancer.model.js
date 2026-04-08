const mongoose = require('mongoose');

const freelancerSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  title: { type: String, default: 'Freelancer' },
  bio:   { type: String, maxlength: 1000, default: '' },
  skills: [{
    name:  { type: String, required: true },
    level: { type: String, enum: ['beginner','intermediate','expert'], default: 'intermediate' }
  }],
  portfolio: [{
    title: String, description: String, image: String, link: String, tech: [String]
  }],
  experience: [{
    company: String, role: String, startDate: Date, endDate: Date,
    description: String, current: { type: Boolean, default: false }
  }],
  certifications: [{
    name: String, issuer: String, date: Date, credentialUrl: String
  }],
  resume:    { type: String, default: '' },
  hourlyRate: { type: Number, default: 0 },
  availability: {
    status: { type: String, enum: ['available','busy','unavailable'], default: 'available' },
    slots: [{ day: String, startTime: String, endTime: String }]
  },
  isVerified:       { type: Boolean, default: false },
  verificationBadge:{ type: String, enum: ['none','basic','pro','expert'], default: 'none' },
  reputationScore:  { type: Number, default: 0 },
  totalEarnings:    { type: Number, default: 0 },
  completedProjects:{ type: Number, default: 0 },
  successRate:      { type: Number, default: 0 },
  profileViews:     { type: Number, default: 0 },
  languages: [{ name: String, proficiency: String }]
}, { timestamps: true });

module.exports = mongoose.models.Freelancer || mongoose.model('Freelancer', freelancerSchema);
