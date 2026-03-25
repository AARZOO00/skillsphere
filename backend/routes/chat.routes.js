const router = require('express').Router();
const ctrl = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.post('/conversation',             protect, ctrl.getOrCreateConversation);
router.get('/conversations',             protect, ctrl.getConversations);
router.get('/messages/:conversationId',  protect, ctrl.getMessages);
router.post('/messages',                 protect, upload.array('attachments', 5), ctrl.sendMessage);
router.delete('/messages/:id',           protect, ctrl.deleteMessage);

module.exports = router;
