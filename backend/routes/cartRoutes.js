const router = require('express').Router();
const ctrl   = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/',                    ctrl.getCart);
router.post('/add',                ctrl.addToCart);
router.put('/update',              ctrl.updateCartItem);
router.delete('/clear',            ctrl.clearCart);
router.delete('/remove/:productId',ctrl.removeFromCart);

module.exports = router;