const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// 创建订单 (需要认证)
router.post('/', auth, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.userId;

    // 验证商品库存
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.inventory < item.quantity) {
        return res.status(400).json({ message: `Insufficient inventory for ${product.name}` });
      }
    }

    // 创建订单
    const order = new Order({
      user: userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod
    });

    await order.save();

    // 更新商品库存
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { inventory: -item.quantity }
      });
    }

    // 清空购物车
    await Cart.findOneAndUpdate({
      user: userId
    }, {
      $set: { items: [] }
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取用户订单 (需要认证)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取店铺订单 (需要认证)
router.get('/shop/:shopId', auth, async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const userId = req.user.userId;

    // 验证店铺所有权
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    if (shop.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view these orders' });
    }

    // 查找该店铺的所有订单
    const orders = await Order.find({
      'items.shopId': shopId
    }).populate('user', 'username').sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新订单状态 (需要认证)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const userId = req.user.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 验证店铺所有权 (只有店铺 owner 可以更新订单状态)
    const shopIds = order.items.map(item => item.shopId.toString());
    const shops = await Shop.find({ _id: { $in: shopIds }, owner: userId });

    if (shops.length === 0) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;