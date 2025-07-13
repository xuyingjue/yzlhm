const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    spec: { type: String, required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    shopName: { type: String, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: { type: String, required: true },
  paymentId: { type: String },
  paymentMethod: { type: String, default: 'online' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);