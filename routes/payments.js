const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const User = require('../models/User');

// 创建支付 (需要认证)
router.post('/', auth, async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.userId;

    // 查找订单
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 验证订单归属
    if (order.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    // 创建Stripe支付意向
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Stripe需要以分为单位
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId
      }
    });

    // 更新订单支付ID
    order.paymentId = paymentIntent.id;
    order.status = 'paid';
    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 检查支付状态 (需要认证)
router.get('/:id/status', auth, async (req, res) => {
  try {
    const paymentId = req.params.id;

    // 获取支付状态
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100 // 转换回美元
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 余额充值 (需要认证)
router.post('/wallet/recharge', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // 创建Stripe支付意向
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // 以分为单位
      currency: 'usd',
      metadata: {
        userId,
        type: 'recharge'
      }
    });

    // 如果支付成功，这里应该有一个webhook来更新用户余额
    // 简化版：假设支付成功，直接更新余额
    // 实际应用中应该通过Stripe webhook来处理
    const user = await User.findById(userId);
    user.balance += amount;
    await user.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;