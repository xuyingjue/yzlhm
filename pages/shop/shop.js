// 解析URL参数获取shopId
const urlParams = new URLSearchParams(window.location.search);
const shopId = parseInt(urlParams.get('shopId')) || 1;

// 店铺数据
const shops = [
  {
    id: 1,
    name: '泉漾',
    announcement: '欢迎光临泉漾，全场满30元包邮！',
    hasNewAnnouncement: true,
    contact: '13800138000',
    businessHours: '9:00-22:00',
    deliveryRange: '3公里内',
    goods: [
      {
        id: 1,
        name: '简约主题',
        desc: '简约风格主题，清新自然',
        price: 19.90,
        sales: 128,
        image: '/imgres/1.png',
        categoryId: 1,
        specs: [
          { id: 1, name: '标准版' },
        { id: 2, name: '高级版' }
      ]
    },
    {
      id: 5,
      name: '猫咪陶瓷碗',
      desc: '可爱猫咪造型陶瓷碗，适合猫粮和水',
      price: 25.00,
      sales: 0,
      image: '/imgres/cat_bowl.jpg',
      categoryId: 3,
      specs: [
        { id: 1, name: '红色' },
        { id: 2, name: '蓝色' },
        { id: 3, name: '黄色' }
      ]
    },
      {
        id: 2,
        name: '商务主题',
        desc: '专业商务风格，适合办公使用',
        price: 25.90,
        sales: 89,
        image: '/imgres/2.png',
        categoryId: 1,
        specs: [
          { id: 1, name: '标准版' },
          { id: 2, name: '高级版' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: '小依美化铺',
    announcement: '小依美化铺新品上市，全场8折！',
    hasNewAnnouncement: true,
    contact: '13900139000',
    businessHours: '10:00-21:00',
    deliveryRange: '5公里内',
    goods: [
      {
        id: 3,
        name: '暗黑主题',
        desc: '深色模式主题，保护眼睛',
        price: 29.90,
        sales: 96,
        image: '/imgres/2.png',
        categoryId: 1,
        specs: [
          { id: 1, name: '标准版' },
          { id: 2, name: '高级版' }
        ]
      },
      {
        id: 4,
        name: '可爱主题',
        desc: '萌系可爱风格，少女心满满',
        price: 22.90,
        sales: 156,
        image: '/imgres/3.jpg',
        categoryId: 1,
        specs: [
          { id: 1, name: '标准版' },
          { id: 2, name: '高级版' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: '待入驻',
    announcement: '店铺筹备中，敬请期待！',
    hasNewAnnouncement: false,
    goods: []
  }
];

// 获取当前店铺数据
const currentShop = shops.find(shop => shop.id === shopId) || shops[0];

// 暴露页面数据给前端渲染
window.pageData = {
  // 页面的初始数据
    // 当前店铺
    currentShop: currentShop,
    // 商家公告
    announcement: currentShop.announcement,
    hasNewAnnouncement: currentShop.hasNewAnnouncement,
    // 商品分类
    categories: [
      { id: 1, name: '全部商品' },
      { id: 2, name: '热销推荐' },
      { id: 3, name: '主食' },
      { id: 4, name: '小食' },
      { id: 5, name: '饮品' },
      { id: 6, name: '甜品' }
    ],
    currentCategory: 1,
    // 当前分类商品数据
    currentGoods: {
      categoryName: '全部商品',
      goods: currentShop.goods || [
        {
          id: 1,
          name: '拿铁咖啡',
          desc: '精选阿拉比卡咖啡豆，搭配新鲜牛奶',
          price: 28.00,
          sales: 126,
          image: '/imgres/1.png',
          categoryId: 5,
          specs: [
            { id: 1, name: '中杯' },
            { id: 2, name: '大杯' },
            { id: 3, name: '超大杯' }
          ]
        },
        {
          id: 2,
          name: '蓝莓芝士蛋糕',
          desc: '浓郁芝士搭配新鲜蓝莓酱',
          price: 32.00,
          sales: 89,
          image: '/imgres/2.png',
          categoryId: 6,
          specs: [
            { id: 1, name: '小份' },
            { id: 2, name: '大份' }
          ]
        },
        {
          id: 3,
          name: '经典汉堡套餐',
          desc: '牛肉汉堡+薯条+可乐',
          price: 45.00,
          sales: 215,
          image: '/imgres/3.jpg',
          categoryId: 3,
          specs: [
            { id: 1, name: '单人份' },
            { id: 2, name: '双人份' }
          ]
        },
        {
          id: 4,
          name: '水果沙拉',
          desc: '多种新鲜水果混合，健康轻食',
          price: 26.00,
          sales: 76,
          image: '/imgres/qy.jpg',
          categoryId: 4,
          specs: [
            { id: 1, name: '小份' },
            { id: 2, name: '大份' }
          ]
        },
        {
          id: 5,
          name: '巧克力奶茶',
          desc: '浓郁巧克力风味奶茶，可选甜度',
          price: 18.00,
          sales: 156,
          image: '/imgres/d.jpg',
          categoryId: 5,
          specs: [
            { id: 1, name: '正常糖' },
            { id: 2, name: '少糖' },
            { id: 3, name: '无糖' }
          ]
        }
      ]
    },

    // 分类与商品映射关系
    categoryGoodsMap: {},
    // 购物车数量
    cartCount: 0
  },

// 页面初始化函数
function initPage() {
    // 初始化商品弹窗事件
    initGoodsModal();

    // 从本地存储获取购物车数量
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount(cart.length);

    // 渲染店铺信息
    renderShopInfo();

    // 更新购物车数量显示
function updateCartCount(count) {
    window.pageData.cartCount = count;
    // 如果有购物车图标数量显示，可以在这里更新
}

// 初始化收藏状态
    const isFavorite = localStorage.getItem(`favorite_${currentShop.id}`) === 'true';
    updateFavoriteIcon(isFavorite);

    // 构建分类与商品的映射关系
    buildCategoryGoodsMap();

    // 初始化渲染商品列表
    renderGoodsList(window.pageData.currentGoods.goods);

    // 绑定分类点击事件
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', switchCategory);
    });

    // 绑定收藏按钮点击事件
    document.getElementById('favoriteBtn')?.addEventListener('click', function() {
        const shopId = window.pageData.currentShop.id;
        const isFavorite = localStorage.getItem(`favorite_${shopId}`) === 'true';
        const newState = !isFavorite;
        localStorage.setItem(`favorite_${shopId}`, newState);
        updateFavoriteIcon(newState);
    });
  }

// 更新收藏图标
function updateFavoriteIcon(isFavorite) {
    const icon = document.querySelector('.favorite-icon');
    if (icon) {
        icon.src = isFavorite ? '/imgres/heart-filled.png' : '/imgres/heart-empty.png';
        icon.alt = isFavorite ? '已收藏' : '收藏';
    }
}

// 初始化商品弹窗
function initGoodsModal() {
    const modal = document.getElementById('goodsModal');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    let selectedSpec = null;

    // 打开弹窗
    document.querySelectorAll('.goods-item').forEach(item => {
        item.addEventListener('click', function() {
            const goodsId = parseInt(this.dataset.id);
            openGoodsModal(goodsId);
        });
    });

    // 规格选择
    document.getElementById('specList').addEventListener('click', function(e) {
        if (e.target.classList.contains('spec-option')) {
            document.querySelectorAll('.spec-option').forEach(option => {
                option.classList.remove('active');
            });
            e.target.classList.add('active');
            selectedSpec = e.target.dataset.specId;
        }
    });

    // 数量控制
    minusBtn.addEventListener('click', function() {
        if (quantityInput.value > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
        }
    });

    plusBtn.addEventListener('click', function() {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    });

    // 加入购物车
    addToCartBtn.addEventListener('click', function() {
        if (!selectedSpec) {
            alert('请选择商品规格');
            return;
        }

        // 生成规格哈希
        const specHash = `${currentGoodsItem.id}-${selectedSpec}`;
        const quantity = parseInt(quantityInput.value);
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item.specHash === specHash);

        if (existingItemIndex >= 0) {
            // 相同商品相同规格，数量叠加
            cart[existingItemIndex].quantity += quantity;
        } else {
            // 新增商品条目
            cart.push({
                specHash: specHash,
                goodsId: currentGoodsItem.id,
                name: currentGoodsItem.name,
                price: currentGoodsItem.price,
                image: currentGoodsItem.image,
                quantity: quantity,
                specName: document.querySelector(`.spec-option.active`).textContent,
                shopId: currentShop.id,
                shopName: currentShop.name
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(cart.length);
        showAddedPrompt();
        modal.style.display = 'none';
        // 重置选择状态
        selectedSpec = null;
        quantityInput.value = 1;
        document.querySelectorAll('.spec-option').forEach(option => {
            option.classList.remove('active');
        });
    });

        // 获取当前商品信息
        const goodsId = parseInt(modal.dataset.goodsId);
        const quantity = parseInt(quantityInput.value);
        const goods = currentShop.goods.find(g => g.id === goodsId);
        const spec = goods.specs.find(s => s.id === parseInt(selectedSpec));

        // 生成规格哈希
        const specHash = `${goodsId}-${selectedSpec}`;

        // 构建购物车项
        const cartItem = {
            specHash,
            goodsId,
            specId: parseInt(selectedSpec),
            specName: spec.name,
            name: goods.name,
            price: goods.price,
            image: goods.image,
            quantity,
            shopId: currentShop.id,
            shopName: currentShop.name
        };

        // 保存到本地存储
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item.specHash === specHash);

        if (existingItemIndex >= 0) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(cart.length);

        // 显示添加成功提示
        showAddSuccessPrompt();

        // 关闭弹窗
        modal.style.display = 'none';
        selectedSpec = null;
        quantityInput.value = 1;
    });

    // 点击遮罩关闭弹窗
    document.querySelector('.modal-overlay').addEventListener('click', function() {
        modal.style.display = 'none';
        selectedSpec = null;
        quantityInput.value = 1;
    });
}

// 打开商品弹窗
function openGoodsModal(goodsId) {
    const modal = document.getElementById('goodsModal');
    const goods = currentShop.goods.find(g => g.id === goodsId);

    if (!goods) return;

    // 设置弹窗数据
    modal.dataset.goodsId = goodsId;
    document.getElementById('modalImage').src = goods.image;
    document.getElementById('modalName').textContent = goods.name;
    document.getElementById('modalDesc').textContent = goods.desc;
    document.getElementById('modalPrice').textContent = `¥${goods.price.toFixed(2)}`;

    // 渲染规格选项
    const specList = document.getElementById('specList');
    specList.innerHTML = '';
    goods.specs.forEach(spec => {
        const specOption = document.createElement('div');
        specOption.className = 'spec-option';
        specOption.dataset.specId = spec.id;
        specOption.textContent = spec.name;
        specList.appendChild(specOption);
    });

    // 显示弹窗
    modal.style.display = 'block';
}

// 显示添加成功提示
function showAddSuccessPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'add-success-prompt';
    prompt.textContent = '已添加到购物车';
    document.body.appendChild(prompt);

    // 3秒后移除提示
    setTimeout(() => {
        prompt.remove();
    }, 3000);
}

// 渲染店铺信息
function renderShopInfo() {
    const shop = window.pageData.currentShop;
    if (!shop) return;

    // 更新店铺名称
    document.getElementById('shopName')?.textContent = shop.name;

    // 更新公告
    const announcementEl = document.getElementById('shopAnnouncement');
    const dotEl = document.getElementById('announcementDot');
    if (announcementEl && dotEl) {
        announcementEl.textContent = shop.announcement || '暂无公告';
        dotEl.style.display = shop.hasNewAnnouncement ? 'block' : 'none';
    }

    // 更新商家信息
    document.getElementById('shopContact')?.textContent = shop.contact || '暂无联系方式';
    document.getElementById('shopHours')?.textContent = shop.businessHours || '暂无营业时间';
    document.getElementById('shopDelivery')?.textContent = shop.deliveryRange || '暂无配送信息';
}

// 构建分类与商品的映射关系
function buildCategoryGoodsMap() {
    const map = {};
    window.pageData.categories.forEach(category => {
        map[category.id] = window.pageData.currentGoods.goods.filter(goods => 
            goods.categoryId === category.id
        );
    });
    window.pageData.categoryGoodsMap = map;
  },

// 切换店铺
function bindShopChange(e) {
    window.pageData.shopIndex = parseInt(e.target.value);
      shopIndex: e.detail.value
    });
    // 这里可以根据选择的店铺加载对应商品数据
    console.log('选择的店铺：', window.pageData.shopList[window.pageData.shopIndex]);
    // TODO: 加载选中店铺的商品数据
  },

// 切换商品分类
function switchCategory(e) {
    const categoryId = parseInt(e.currentTarget.dataset.id);
    window.pageData.currentCategory = categoryId;

    // 更新分类选中状态
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    e.currentTarget.classList.add('active');

    // 根据分类ID筛选商品
    const filteredGoods = window.pageData.currentGoods.goods.filter(goods => {
        return goods.categoryId === categoryId || categoryId === 1; // 1表示全部商品
    });

    // 重新渲染商品列表
    renderGoodsList(filteredGoods);
  }

// 渲染商品列表
function renderGoodsList(goodsList) {
    const goodsListEl = document.querySelector('.goods-list');
    if (!goodsListEl) return;

    // 更新分类标题
    const categoryTitle = document.querySelector('.category-title');
    if (categoryTitle) {
        categoryTitle.textContent = window.pageData.categories.find(cat => cat.id === window.pageData.currentCategory)?.name || '全部商品';
    }

    // 清空现有商品
    goodsListEl.innerHTML = '';

    // 添加新商品
    goodsList.forEach(goods => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${goods.image}" class="goods-image">
            <div class="goods-info">
                <span class="goods-name">${goods.name}</span>
                <span class="goods-desc">${goods.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${goods.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${goods.sales}</span>
                    <div class="add-to-cart" data-id="${goods.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon">
                    </div>
                </div>
            </div>
        `;

        // 添加商品点击事件（打开详情弹窗）
goodsItem.addEventListener('click', (e) => {
    // 避免点击"加入购物车"按钮时触发商品详情
    if (!e.target.closest('.add-to-cart')) {
        openGoodsModal(goods);
    }
});

// 添加到购物车按钮点击事件
goodsItem.querySelector('.add-to-cart').addEventListener('click', (e) => {
    e.stopPropagation();
    const addBtn = e.currentTarget;
    addBtn.classList.add('active');
    setTimeout(() => addBtn.classList.remove('active'), 300);
    this.addToCart(goods.id);
});

        goodsListEl.appendChild(goodsItem);
    });

    // 重新绑定加入购物车事件
    bindAddToCartEvents();
  }

// 绑定加入购物车事件
function bindAddToCartEvents() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            const goodsId = parseInt(this.dataset.id);
            const goods = window.pageData.currentGoods.goods.find(item => item.id === goodsId);
            if (goods) {
                openGoodsModal(goods); // 打开详情弹窗
            }
        });
    });
  },

// 添加商品到购物车
import { useCartStore } from '../../store/cart';

function addToCart() {
  const cartStore = useCartStore();
  const selectedSpec = document.querySelector('.spec-item.active')?.dataset.spec || '';
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const currentGoods = window.currentGoods;

  if (!currentGoods) return;

  // 构建商品数据
  const cartItem = {
    productId: currentGoods.id,
    name: currentGoods.name,
    price: currentGoods.price,
    image: currentGoods.image,
    spec: selectedSpec,
    quantity: quantity,
    shopId: currentGoods.shopId,
    shopName: currentGoods.shopName
  };

  // 使用Pinia添加商品
  cartStore.addItem(cartItem);

  // 显示添加成功提示
  showToast('已添加');

  // 更新购物车数量显示
  updateCartCount(cartStore.items.length);

  // 关闭商品详情弹窗
  closeModal();
}

// 查看商家信息
function showMerchantInfo() {
    showModal({
      title: '商家信息',
      content: '店名：' + this.data.shopList[this.data.shopIndex] + '\n地址：依狸窝商业中心A座101\n营业时间：09:00-22:00',
      showCancel: false
    });
  },

// 联系客服
function contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：09:00-21:00',
      showCancel: false
    });
  },

// 前往购物车
function gotoCart() {
    window.location.href = '/pages/cart/cart.html';
}
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  },

// 商品详情弹窗相关函数
function initGoodsModal() {
  // 获取DOM元素
  const modal = document.getElementById('goodsModal');
  const modalImage = document.getElementById('modalImage');
  const modalName = document.getElementById('modalName');
  const modalDesc = document.getElementById('modalDesc');
  const modalPrice = document.getElementById('modalPrice');
  const specList = document.getElementById('specList');
  const quantityInput = document.getElementById('quantityInput');
  const minusBtn = document.getElementById('minusBtn');
  const plusBtn = document.getElementById('plusBtn');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const modalOverlay = document.querySelector('.modal-overlay');

  // 当前选中的商品和规格
  let currentGoods = null;
  let selectedSpec = null;

  // 打开弹窗
  window.openGoodsModal = function(goods) {
    currentGoods = goods;
    selectedSpec = goods.specs && goods.specs.length > 0 ? goods.specs[0].id : null;

    // 填充商品数据
    modalImage.src = goods.image;
    modalName.textContent = goods.name;
    modalDesc.textContent = goods.desc;
    modalPrice.textContent = '¥' + goods.price.toFixed(2);

    // 生成规格选项
    renderSpecOptions(goods.specs || []);

    // 重置数量
    quantityInput.value = 1;

    // 显示弹窗
    modal.style.display = 'block';
  };

  // 关闭弹窗
  function closeModal() {
    modal.style.display = 'none';
    currentGoods = null;
    selectedSpec = null;
  }

  // 渲染规格选项
  function renderSpecOptions(specs) {
    specList.innerHTML = '';
    if (specs.length === 0) return;

    specs.forEach(spec => {
      const specItem = document.createElement('div');
      specItem.className = `spec-item ${selectedSpec === spec.id ? 'active' : ''}`;
      specItem.textContent = spec.name;
      specItem.dataset.id = spec.id;
      specItem.addEventListener('click', () => {
        selectedSpec = spec.id;
        document.querySelectorAll('.spec-item').forEach(item => {
          item.classList.remove('active');
        });
        specItem.classList.add('active');
      });
      specList.appendChild(specItem);
    });
  }

  // 数量控制
  minusBtn.addEventListener('click', () => {
    if (quantityInput.value > 1) {
      quantityInput.value = parseInt(quantityInput.value) - 1;
    }
  });

  plusBtn.addEventListener('click', () => {
    quantityInput.value = parseInt(quantityInput.value) + 1;
  });

  // 加入购物车按钮点击
  addToCartBtn.addEventListener('click', () => {
    if (!currentGoods) return;

    // 创建购物车商品对象
    const cartItem = {
      ...currentGoods,
      quantity: parseInt(quantityInput.value),
      specId: selectedSpec,
      specName: currentGoods.specs?.find(s => s.id === selectedSpec)?.name || '',
      shopId: window.pageData.shopIndex,
      shopName: window.pageData.shopList[window.pageData.shopIndex]
    };

    // 添加到购物车
    addToCart(cartItem);
    closeModal();
  });

  // 点击遮罩层关闭弹窗
  modalOverlay.addEventListener('click', closeModal);
}

// 辅助函数 - 更新购物车数量显示
function updateCartCount(count) {
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? 'block' : 'none';
  }
}

// 辅助函数 - 显示提示
function showToast(title) {
  // 这里可以实现一个简单的toast提示
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = title;
  toast.style.position = 'fixed';
  toast.style.bottom = '50px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'rgba(0,0,0,0.7)';
  toast.style.color = 'white';
  toast.style.padding = '8px 16px';
  toast.style.borderRadius = '4px';
  toast.style.zIndex = '9999';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 1500);
}

// 辅助函数 - 显示模态框
function showModal(options) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.padding = '20px';
  modalContent.style.width = '80%';
  modalContent.style.maxWidth = '300px';

  const title = document.createElement('h3');
  title.textContent = options.title;
  title.style.marginTop = '0';
  title.style.marginBottom = '16px';

  const content = document.createElement('p');
  content.textContent = options.content;
  content.style.marginBottom = '20px';

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = '确定';
  confirmBtn.style.width = '100%';
  confirmBtn.style.padding = '8px';
  confirmBtn.style.border = 'none';
  confirmBtn.style.borderRadius = '4px';
  confirmBtn.style.backgroundColor = 'var(--secondary-color)';
  confirmBtn.style.color = 'white';
  confirmBtn.addEventListener('click', () => {
    modal.remove();
  });

  modalContent.appendChild(title);
  modalContent.appendChild(content);
  modalContent.appendChild(confirmBtn);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

// 页面加载完成后执行初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initPage();
    initGoodsModal();
    // 绑定分类点击事件
    document.querySelectorAll('.category-item').forEach(item => {
      item.addEventListener('click', switchCategory);
    });
    // 绑定店铺选择事件
    document.getElementById('shopSelect').addEventListener('change', bindShopChange);
    // 绑定加入购物车按钮事件
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', function() {
        const goodsId = parseInt(this.dataset.id);
        const goods = window.pageData.currentGoods.goods.find(item => item.id === goodsId);
        if (goods) {
          window.openGoodsModal(goods);
        }
      });
    });
  });
} else {
  initPage();
  initGoodsModal();
}

// 分类点击事件处理
function handleCategoryClick(categoryId) {
    // 1. 高亮当前选中分类
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.toggle('active', parseInt(item.dataset.id) === categoryId);
    });
    
    // 2. 过滤右侧商品列表
    const filteredGoods = currentShop.goods.filter(good => good.categoryId === categoryId);
    renderGoodsList(filteredGoods);
}

// 商品图片点击事件 - 打开详情弹窗
function openProductDetail(productId) {
    const product = currentShop.goods.find(good => good.id === productId);
    if (!product) return;
    
    // 设置当前商品
    window.currentProduct = product;
    window.selectedSpec = product.specs[0];
    window.currentQuantity = 1;
    
    // 更新弹窗内容
    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalName').textContent = product.name;
    document.getElementById('modalDesc').textContent = product.desc;
    document.getElementById('modalPrice').textContent = `¥${product.price.toFixed(2)}`;
    
    // 渲染规格选项
    const specList = document.getElementById('specList');
    specList.innerHTML = product.specs.map(spec => `
        <div class="spec-item ${spec.id === window.selectedSpec.id ? 'active' : ''}" onclick="selectSpec(${spec.id})">
            ${spec.name}
        </div>
    `).join('');
    
    // 重置数量
    document.getElementById('quantityInput').value = 1;
    
    // 显示弹窗
    document.getElementById('goodsModal').style.display = 'block';
}

// 加入购物车事件处理（列表快捷添加）
function handleAddToCart(productId, quantity) {
    const product = currentShop.goods.find(good => good.id === productId);
    if (!product) return;
    
    const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        spec: product.specs[0].name,
        quantity: quantity,
        shopId: currentShop.id,
        shopName: currentShop.name
    };
    
    // 调用购物车存储
    if (window.cartStore) {
        window.cartStore.addItem(cartItem);
        showToast("已添加到购物车");
    }
}

// 规格选择
function selectSpec(specId) {
    const spec = window.currentProduct.specs.find(s => s.id === specId);
    if (spec) {
        window.selectedSpec = spec;
        document.querySelectorAll('.spec-item').forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.id) === specId);
        });
    }
}

// 弹窗加入购物车
function addToCart() {
    if (!window.currentProduct || !window.selectedSpec) return;
    
    const cartItem = {
        productId: window.currentProduct.id,
        name: window.currentProduct.name,
        price: window.currentProduct.price,
        image: window.currentProduct.images ? window.currentProduct.images[0] : window.currentProduct.image,
        spec: window.selectedSpec.name,
        quantity: parseInt(document.getElementById('quantityInput').value),
        shopId: currentShop.id,
        shopName: currentShop.name
    };
    
    // 调用购物车存储
    if (window.cartStore) {
        window.cartStore.addItem(cartItem);
        showToast("已添加到购物车");
        closeModal();
    }
}

// 关闭弹窗
function closeModal() {
    document.getElementById('goodsModal').style.display = 'none';
    window.currentProduct = null;
    window.selectedSpec = null;
}

// 显示提示
function showToast(message) {
    // 可复用之前实现的toast功能
    alert(message);
}





// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div class="add-to-cart" data-id="${good.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon" onclick="handleAddToCart(${good.id}, 1)">
                    </div>
                </div>
            </div>
        `;
        goodsGrid.appendChild(goodsItem);
    });
}

// 初始化数量选择器事件
function initQuantitySelector() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            if (current > 1) {
                quantityInput.value = current - 1;
                window.currentQuantity = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = current + 1;
            window.currentQuantity = current + 1;
        });
        
        quantityInput.addEventListener('change', () => {
            let current = parseInt(quantityInput.value) || 1;
            if (current < 1) current = 1;
            quantityInput.value = current;
            window.currentQuantity = current;
        });
    }
}

// 初始化弹窗事件
function initModalEvents() {
    const modal = document.getElementById('goodsModal');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuantitySelector();
    initModalEvents();
});

// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div class="add-to-cart" data-id="${good.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon" onclick="handleAddToCart(${good.id}, 1)">
                    </div>
                </div>
            </div>
        `;
        goodsGrid.appendChild(goodsItem);
    });
}

// 初始化数量选择器事件
function initQuantitySelector() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            if (current > 1) {
                quantityInput.value = current - 1;
                window.currentQuantity = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = current + 1;
            window.currentQuantity = current + 1;
        });
        
        quantityInput.addEventListener('change', () => {
            let current = parseInt(quantityInput.value) || 1;
            if (current < 1) current = 1;
            quantityInput.value = current;
            window.currentQuantity = current;
        });
    }
}

// 初始化弹窗事件
function initModalEvents() {
    const modal = document.getElementById('goodsModal');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuantitySelector();
    initModalEvents();
});

// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div class="add-to-cart" data-id="${good.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon" onclick="handleAddToCart(${good.id}, 1)">
                    </div>
                </div>
            </div>
        `;
        goodsGrid.appendChild(goodsItem);
    });
}

// 初始化数量选择器事件
function initQuantitySelector() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            if (current > 1) {
                quantityInput.value = current - 1;
                window.currentQuantity = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = current + 1;
            window.currentQuantity = current + 1;
        });
        
        quantityInput.addEventListener('change', () => {
            let current = parseInt(quantityInput.value) || 1;
            if (current < 1) current = 1;
            quantityInput.value = current;
            window.currentQuantity = current;
        });
    }
}

// 初始化弹窗事件
function initModalEvents() {
    const modal = document.getElementById('goodsModal');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuantitySelector();
    initModalEvents();
});

// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div class="add-to-cart" data-id="${good.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon" onclick="handleAddToCart(${good.id}, 1)">
                    </div>
                </div>
            </div>
        `;
        goodsGrid.appendChild(goodsItem);
    });
}

// 初始化数量选择器事件
function initQuantitySelector() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            if (current > 1) {
                quantityInput.value = current - 1;
                window.currentQuantity = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = current + 1;
            window.currentQuantity = current + 1;
        });
        
        quantityInput.addEventListener('change', () => {
            let current = parseInt(quantityInput.value) || 1;
            if (current < 1) current = 1;
            quantityInput.value = current;
            window.currentQuantity = current;
        });
    }
}

// 初始化弹窗事件
function initModalEvents() {
    const modal = document.getElementById('goodsModal');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuantitySelector();
    initModalEvents();
});

// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div class="add-to-cart" data-id="${good.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon" onclick="handleAddToCart(${good.id}, 1)">
                    </div>
                </div>
            </div>
        `;
        goodsGrid.appendChild(goodsItem);
    });
}

// 初始化数量选择器事件
function initQuantitySelector() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            if (current > 1) {
                quantityInput.value = current - 1;
                window.currentQuantity = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = current + 1;
            window.currentQuantity = current + 1;
        });
        
        quantityInput.addEventListener('change', () => {
            let current = parseInt(quantityInput.value) || 1;
            if (current < 1) current = 1;
            quantityInput.value = current;
            window.currentQuantity = current;
        });
    }
}

// 初始化弹窗事件
function initModalEvents() {
    const modal = document.getElementById('goodsModal');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuantitySelector();
    initModalEvents();
});

// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div class="add-to-cart" data-id="${good.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon" onclick="handleAddToCart(${good.id}, 1)">
                    </div>
                </div>
            </div>
        `;
        goodsGrid.appendChild(goodsItem);
    });
}

// 初始化数量选择器事件
function initQuantitySelector() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            if (current > 1) {
                quantityInput.value = current - 1;
                window.currentQuantity = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = current + 1;
            window.currentQuantity = current + 1;
        });
        
        quantityInput.addEventListener('change', () => {
            let current = parseInt(quantityInput.value) || 1;
            if (current < 1) current = 1;
            quantityInput.value = current;
            window.currentQuantity = current;
        });
    }
}

// 初始化弹窗事件
function initModalEvents() {
    const modal = document.getElementById('goodsModal');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuantitySelector();
    initModalEvents();
});

// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div class="add-to-cart" data-id="${good.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon" onclick="handleAddToCart(${good.id}, 1)">
                    </div>
                </div>
            </div>
        `;
        goodsGrid.appendChild(goodsItem);
    });
}

// 初始化数量选择器事件
function initQuantitySelector() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            if (current > 1) {
                quantityInput.value = current - 1;
                window.currentQuantity = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = current + 1;
            window.currentQuantity = current + 1;
        });
        
        quantityInput.addEventListener('change', () => {
            let current = parseInt(quantityInput.value) || 1;
            if (current < 1) current = 1;
            quantityInput.value = current;
            window.currentQuantity = current;
        });
    }
}

// 初始化弹窗事件
function initModalEvents() {
    const modal = document.getElementById('goodsModal');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuantitySelector();
    initModalEvents();
});

// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div class="add-to-cart" data-id="${good.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon" onclick="handleAddToCart(${good.id}, 1)">
                    </div>
                </div>
            </div>
        `;
        goodsGrid.appendChild(goodsItem);
    });
}

// 初始化数量选择器事件
function initQuantitySelector() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            if (current > 1) {
                quantityInput.value = current - 1;
                window.currentQuantity = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = current + 1;
            window.currentQuantity = current + 1;
        });
        
        quantityInput.addEventListener('change', () => {
            let current = parseInt(quantityInput.value) || 1;
            if (current < 1) current = 1;
            quantityInput.value = current;
            window.currentQuantity = current;
        });
    }
}

// 初始化弹窗事件
function initModalEvents() {
    const modal = document.getElementById('goodsModal');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuantitySelector();
    initModalEvents();
});

// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div class="add-to-cart" data-id="${good.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon" onclick="handleAddToCart(${good.id}, 1)">
                    </div>
                </div>
            </div>
        `;
        goodsGrid.appendChild(goodsItem);
    });
}

// 初始化数量选择器事件
function initQuantitySelector() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            if (current > 1) {
                quantityInput.value = current - 1;
                window.currentQuantity = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = current + 1;
            window.currentQuantity = current + 1;
        });
        
        quantityInput.addEventListener('change', () => {
            let current = parseInt(quantityInput.value) || 1;
            if (current < 1) current = 1;
            quantityInput.value = current;
            window.currentQuantity = current;
        });
    }
}

// 初始化弹窗事件
function initModalEvents() {
    const modal = document.getElementById('goodsModal');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuantitySelector();
    initModalEvents();
});

// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div class="add-to-cart" data-id="${good.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon" onclick="handleAddToCart(${good.id}, 1)">
                    </div>
                </div>
            </div>
        `;
        goodsGrid.appendChild(goodsItem);
    });
}

// 初始化数量选择器事件
function initQuantitySelector() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            if (current > 1) {
                quantityInput.value = current - 1;
                window.currentQuantity = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = current + 1;
            window.currentQuantity = current + 1;
        });
        
        quantityInput.addEventListener('change', () => {
            let current = parseInt(quantityInput.value) || 1;
            if (current < 1) current = 1;
            quantityInput.value = current;
            window.currentQuantity = current;
        });
    }
}

// 初始化弹窗事件
function initModalEvents() {
    const modal = document.getElementById('goodsModal');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuantitySelector();
    initModalEvents();
});

// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div class="add-to-cart" data-id="${good.id}">
                        <img src="/imgres/add-cart.png" class="cart-icon" onclick="handleAddToCart(${good.id}, 1)">
                    </div>
                </div>
            </div>
        `;
        goodsGrid.appendChild(goodsItem);
    });
}

// 初始化数量选择器事件
function initQuantitySelector() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            if (current > 1) {
                quantityInput.value = current - 1;
                window.currentQuantity = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = current + 1;
            window.currentQuantity = current + 1;
        });
        
        quantityInput.addEventListener('change', () => {
            let current = parseInt(quantityInput.value) || 1;
            if (current < 1) current = 1;
            quantityInput.value = current;
            window.currentQuantity = current;
        });
    }
}

// 初始化弹窗事件
function initModalEvents() {
    const modal = document.getElementById('goodsModal');
    const overlay = modal.querySelector('.modal-overlay');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuantitySelector();
    initModalEvents();
});

// 渲染商品列表
function renderGoodsList(goods) {
    const goodsGrid = document.querySelector('.goods-grid');
    if (!goodsGrid) return;
    
    // 清空现有商品
    goodsGrid.innerHTML = '';
    
    // 添加新商品
    goods.forEach(good => {
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item card';
        goodsItem.innerHTML = `
            <img src="${good.image}" class="goods-image" onclick="openProductDetail(${good.id})">
            <div class="goods-info">
                <span class="goods-name">${good.name}</span>
                <span class="goods-desc">${good.desc}</span>
                <div class="goods-footer">
                    <span class="goods-price">¥${good.price.toFixed(2)}</span>
                    <span class="sales-volume">月销${good.sales}</span>
                    <div