const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Shop = require('../models/Shop');

// 创建店铺 (需要认证)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, logo, address, contact } = req.body;
    const owner = req.user.userId;

    const shop = new Shop({
      name,
      description,
      owner,
      logo,
      address,
      contact
    });

    await shop.save();
    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取所有店铺
router.get('/', async (req, res) => {
  try {
    const shops = await Shop.find().populate('owner', 'username');
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取店铺详情
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner', 'username');
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新店铺信息 (需要认证)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, logo, address, contact, isActive } = req.body;
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // 验证店铺所有权
    if (shop.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this shop' });
    }

    // 更新店铺信息
    shop.name = name || shop.name;
    shop.description = description || shop.description;
    shop.logo = logo || shop.logo;
    shop.address = address || shop.address;
    shop.contact = contact || shop.contact;
    shop.isActive = isActive !== undefined ? isActive : shop.isActive;

    await shop.save();
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;