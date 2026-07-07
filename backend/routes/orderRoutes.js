const router = require('express').Router();
const ctrl   = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.post('/',              ctrl.createOrder);
router.get('/my-orders',      ctrl.getMyOrders);
router.get('/:id',            ctrl.getOrder);
router.get('/',               adminOnly, ctrl.getAllOrders);
router.put('/:id/status',     adminOnly, ctrl.updateOrderStatus);

module.exports = router;