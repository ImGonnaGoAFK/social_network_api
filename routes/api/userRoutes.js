const router = require('express').Router();
const userController = require('../controllers/userController');


router.put('/users/:userId/friends/:friendId', userController.addFriend);
router.delete('/users/:userId/friends/:friendId', userController.removeFriend);

module.exports = router;
