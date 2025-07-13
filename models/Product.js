const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  images: [{ type: String }],
  category: { type: String, required: true },
  shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  inventory: { type: Number, default: 0 },
  specs: [{ name: String, options: [String] }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);