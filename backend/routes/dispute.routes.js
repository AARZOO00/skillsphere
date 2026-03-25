const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const Dispute = require('../models/Dispute.model');
const { upload } = require('../config/cloudinary');

router.post('/', protect, upload.array('evidence', 5), async (req, res) => {
  try {
    const evidence = req.files ? req.files.map(f => ({ name: f.originalname, url: f.path })) : [];
    const dispute = await Dispute.create({ ...req.body, raisedBy: req.user._id, evidence });
    res.status(201).json({ success: true, dispute });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/my-disputes', protect, async (req, res) => {
  try {
    const disputes = await Dispute.find({ $or: [{ raisedBy: req.user._id }, { against: req.user._id }] })
      .populate('gig', 'title').populate('raisedBy', 'name avatar').populate('against', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, disputes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('gig', 'title').populate('raisedBy', 'name avatar').populate('against', 'name avatar');
    if (!dispute) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, dispute });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
