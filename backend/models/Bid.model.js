const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  gig: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Gig', 
    required: true 
  },
  freelancer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  deliveryDays: { 
    type: Number, 
    required: true 
  },
  proposal: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'], 
    default: 'pending' 
  },
  attachments: [{ 
    name: String, 
    url: String 
  }]
}, { timestamps: true });

// Ek freelancer ek gig pe sirf ek bid kar sakta hai
bidSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.models.Bid || mongoose.model('Bid', bidSchema);