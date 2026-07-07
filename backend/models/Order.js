const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    String,
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    address:  { type: String, required: true },
    city:     { type: String, required: true },
    state:    String,
    zipCode:  String,
    country:  { type: String, default: 'Tunisia' },
    phone:    String
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'paypal'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  subtotal:     { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  tax:          { type: Number, default: 0 },
  totalAmount:  { type: Number, required: true },
  notes:        String,
  deliveredAt:  Date
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `SN-${Date.now().toString().slice(-8)}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);