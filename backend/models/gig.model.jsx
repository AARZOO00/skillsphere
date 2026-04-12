// backend/models/Gig.model.js
// Bridge file — re-exports gig.model.js
// Fixes: require('../models/Gig.model') case-sensitivity on Linux

module.exports = require('./Gig.model');