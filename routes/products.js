const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

// 创建商品 (需要认证)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, images, category, shopId, inventory, specs } = req.body;
    const userId = req.user.userId;

    // 验证店铺所有权
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    if (shop.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to add products to this shop' });
    }

    const product = new Product({
      name,
      description,
      price,
      images,
      category,
      shop: shopId,
      inventory,
      specs
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取所有商品
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('shop', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop', 'name owner');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取店铺商品
router.get('/shop/:shopId', async (req, res) => {
  try {
    const products = await Product.find({ shop: req.params.shopId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新商品 (需要认证)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, price, images, category, inventory, specs, isActive } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 验证店铺所有权
    const shop = await Shop.findById(product.shop);
    if (shop.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // 更新商品信息
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.images = images || product.images;
    product.category = category || product.category;
    product.inventory = inventory !== undefined ? inventory : product.inventory;
    product.specs = specs || product.specs;
    product.isActive = isActive !== undefined ? isActive : product.isActive;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;