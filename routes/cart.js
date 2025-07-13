const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');

// 添加到购物车 (需要认证)
router.post('/', auth, async (req, res) => {
  try {
    const { productId, spec, quantity, shopId, shopName } = req.body;
    const userId = req.user.userId;
    
    // 查找用户购物车
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      // 创建新购物车
      cart = new Cart({
        user: userId,
        items: [{
          productId,
          spec,
          quantity,
          shopId,
          shopName
        }]
      });
    } else {
      // 检查商品是否已在购物车
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId && item.spec === spec
      );
      
      if (existingItemIndex !== -1) {
        // 更新数量
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // 添加新商品
        cart.items.push({
          productId,
          spec,
          quantity,
          shopId,
          shopName
        });
      }
    }
    
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取购物车 (需要认证)
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId })
      .populate('items.productId', 'name price images');
      
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新购物车项 (需要认证)
router.put('/:id', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItemId = req.params.id;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === cartItemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 删除购物车项 (需要认证)
router.delete('/:id', auth, async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== cartItemId);
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;