const Proposal = require('../models/Proposal.model');
const { Gig } = require('../models/index');         // ← GSig → Gig
const Notification = require('../models/Notification.model');

exports.submitProposal = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.status !== 'open') return res.status(400).json({ success: false, message: 'Gig not open' });
    if (String(gig.client) === String(req.user._id)) return res.status(400).json({ success: false, message: 'Cannot apply to your own gig' });
    const existing = await Proposal.findOne({ gig: req.params.gigId, freelancer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already submitted a proposal' });

    const data = { ...req.body, gig: req.params.gigId, freelancer: req.user._id };
    if (typeof data.milestones === 'string') data.milestones = JSON.parse(data.milestones);
    if (req.files) data.attachments = req.files.map(f => ({ name: f.originalname, url: f.path }));

    const proposal = await Proposal.create(data);
    gig.proposals.push(proposal._id);
    gig.proposalCount++;
    await gig.save({ validateBeforeSave: false });

    await Notification.create({ user: gig.client, type: 'new_proposal', title: 'New Proposal!', message: 'You received a proposal for "' + gig.title + '"', link: '/my-gigs' });
    req.app.get('io').to('user_' + gig.client).emit('notification', { type: 'new_proposal', gigId: gig._id });

    res.status(201).json({ success: true, proposal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getProposals = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (String(gig.client) !== String(req.user._id) && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const proposals = await Proposal.find({ gig: req.params.gigId })
      .populate('freelancer', 'name avatar location')
      .sort({ createdAt: -1 });
    res.json({ success: true, proposals });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findById(req.params.id).populate('gig');
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (String(proposal.gig.client) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not authorized' });

    proposal.status = status;
    await proposal.save();

    if (status === 'accepted') {
      proposal.gig.status = 'in_progress';
      proposal.gig.assignedFreelancer = proposal.freelancer;
      await proposal.gig.save();
      await Proposal.updateMany({ gig: proposal.gig._id, _id: { $ne: proposal._id }, status: 'pending' }, { status: 'rejected' });
    }

    const notifType  = status === 'accepted' ? 'proposal_accepted' : 'proposal_rejected';
    const notifTitle = status === 'accepted' ? 'Proposal Accepted!' : 'Proposal Update';
    const notifMsg   = status === 'accepted' ? 'Your proposal was accepted for "' + proposal.gig.title + '"' : 'Your proposal was not selected for "' + proposal.gig.title + '"';
    await Notification.create({ user: proposal.freelancer, type: notifType, title: notifTitle, message: notifMsg });
    req.app.get('io').to('user_' + proposal.freelancer).emit('notification', { type: notifType });

    res.json({ success: true, proposal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.negotiate = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Not found' });
    proposal.negotiationHistory.push({ proposedBy: req.user._id, amount: req.body.amount, message: req.body.message });
    proposal.status = 'negotiating';
    await proposal.save();
    res.json({ success: true, proposal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate('gig', 'title budget status client category')
      .sort({ createdAt: -1 });
    res.json({ success: true, proposals });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.withdrawProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(proposal.freelancer) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (proposal.status !== 'pending') return res.status(400).json({ success: false, message: 'Cannot withdraw this proposal' });
    proposal.status = 'withdrawn';
    await proposal.save();
    await Gig.findByIdAndUpdate(proposal.gig, { $inc: { proposalCount: -1 }, $pull: { proposals: proposal._id } });
    res.json({ success: true, message: 'Proposal withdrawn' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};