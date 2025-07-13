import { orderStore } from '../../store/order.js';

// 购物车数据管理器
class CartManager {
  constructor() {
    this.cartGroups = [];
    this.cartEmpty = true;
    this.allChecked = false;
    this.totalPrice = 0;
    this.selectedCount = 0;
    this.init();
  }

  // 初始化
  init() {
    this.loadFromDataManager();
    // 监听购物车数据变化
    DataManager.on('cartChange', () => this.loadFromDataManager());
  }

  // 从DataManager加载数据
  loadFromDataManager() {
    const cartItems = DataManager.getCart() || [];
    this.cartGroups = this.groupByShop(cartItems);
    this.cartEmpty = cartItems.length === 0;
    this.calculateTotals();
  

  // 按店铺分组商品
  groupByShop(items) {
    const groups = {};
    items.forEach(item => {
      if (!groups[item.shopId]) {
        groups[item.shopId] = {
          shopId: item.shopId,
          shopName: item.shopName,
          checked: false,
          goodsList: []
        };
      }
      groups[item.shopId].goodsList.push({
        id: item.goodsId,
        name: item.name,
        spec: item.specName,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        checked: false,
        specHash: item.specHash
      });
    });
    return Object.values(groups);
  }

  // 计算总价和选中数量
  calculateTotals() {
    this.totalPrice = 0;
    this.selectedCount = 0;
    this.cartGroups.forEach(group => {
      group.goodsList.forEach(goods => {
        if (goods.checked) {
          this.totalPrice += goods.price * goods.quantity;
          this.selectedCount += goods.quantity;
        }
      });
    });
    this.allChecked = this.isAllChecked();
  }

  // 检查是否全选
  isAllChecked() {
    const allItems = this.cartGroups.flatMap(group => group.goodsList);
    return allItems.length > 0 && allItems.every(item => item.checked);
  }

  // 切换全选状态
  toggleAllCheck(checked) {
    this.cartGroups.forEach(group => {
      group.checked = checked;
      group.goodsList.forEach(goods => goods.checked = checked);
    });
    this.calculateTotals();
  }

  // 切换店铺选中状态
  toggleShopCheck(shopId, checked) {
    const group = this.cartGroups.find(g => g.shopId == shopId);
    if (group) {
      group.checked = checked;
      group.goodsList.forEach(goods => goods.checked = checked);
      this.calculateTotals();
    }
  }

  // 切换商品选中状态
  toggleGoodsCheck(shopId, goodsId, checked) {
    const group = this.cartGroups.find(g => g.shopId == shopId);
    if (group) {
      const goods = group.goodsList.find(g => g.id == goodsId);
      if (goods) {
        goods.checked = checked;
        group.checked = group.goodsList.every(g => g.checked);
        this.calculateTotals();
      }
    }
  }

  // 更新商品数量
  updateQuantity(specHash, quantity) {
    this.cartGroups.forEach(group => {
      const goods = group.goodsList.find(g => g.specHash === specHash);
      if (goods) {
        goods.quantity = Math.max(1, parseInt(quantity) || 1);
        this.calculateTotals();
        this.saveToLocalStorage();
      }
    });
  }

  // 删除商品
  deleteGoods(specHash) {
    this.cartGroups.forEach(group => {
      group.goodsList = group.goodsList.filter(goods => goods.specHash !== specHash);
    });
    this.cartGroups = this.cartGroups.filter(group => group.goodsList.length > 0);
    this.cartEmpty = this.cartGroups.length === 0;
    this.calculateTotals();
    this.saveToLocalStorage();
  }

  // 保存到DataManager
  saveToDataManager() {
    const cartItems = this.cartGroups.flatMap(group => 
      group.goodsList.map(goods => ({
        specHash: goods.specHash,
        goodsId: goods.id,
        name: goods.name,
        price: goods.price,
        image: goods.image,
        quantity: goods.quantity,
        specName: goods.spec,
        shopId: group.shopId,
        shopName: group.shopName
      }))
    );
    DataManager.setCart(cartItems);
  
}

  getSelectedItems() {
    return this.cartGroups.flatMap(group => 
      group.goodsList.filter(goods => goods.checked)
    );
  }

  createOrder(selectedItems) {
    const orderId = Date.now().toString();
    const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return {
      id: orderId,
      items: selectedItems,
      totalPrice: totalPrice,
      time: new Date().toISOString(),
      status: 'pending'
    };
  }

// 购物车渲染器
class CartRenderer {
  constructor(cartManager) {
    this.cartManager = cartManager;
    this.cartListEl = document.querySelector('.cart-list');
    this.totalPriceEl = document.querySelector('.total-price .price');
    this.checkoutBtn = document.querySelector('.checkout-btn');
    this.allCheckbox = document.querySelector('.all-checkbox');
    this.init();
  }

  // 初始化
  init() {
    this.bindEvents();
    this.render();
  }

  // 渲染购物车
  render() {
    if (this.cartManager.cartEmpty) {
      this.renderEmptyState();
      return;
    }
    this.cartListEl.innerHTML = '';
    this.renderShopGroups();
    this.updateCheckoutBar();
  }

  // 渲染空状态
  renderEmptyState() {
    this.cartListEl.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon"></div>
        <div class="empty-text">购物车是空的</div>
        <a href="/index.html" class="goto-shop">去逛逛</a>
      </div>
    `;
  }

  // 渲染店铺分组
  renderShopGroups() {
    this.cartManager.cartGroups.forEach(group => {
      const shopGroupEl = document.createElement('div');
      shopGroupEl.className = 'shop-group';
      shopGroupEl.innerHTML = `
        <div class="shop-header">
          <input type="checkbox" class="shop-checkbox" ${group.checked ? 'checked' : ''} data-shopid="${group.shopId}">
          <span class="shop-name">${group.shopName}</span>
        </div>
        <div class="goods-list"></div>
      `;

      const goodsListEl = shopGroupEl.querySelector('.goods-list');
      group.goodsList.forEach(goods => {
        const goodsItemEl = document.createElement('div');
        goodsItemEl.className = 'goods-swipe';
        goodsItemEl.innerHTML = `
          <div class="goods-swipe-content">
            <input type="checkbox" class="goods-checkbox" ${goods.checked ? 'checked' : ''} data-shopid="${group.shopId}" data-goodsid="${goods.id}" data-spechash="${goods.specHash}">
            <img src="${goods.image}" alt="${goods.name}" class="goods-image">
            <div class="goods-info">
              <div class="goods-name">${goods.name}</div>
              ${goods.spec ? `<div class="goods-spec">规格: ${goods.spec}</div>` : ''}
              <div class="goods-price">¥${goods.price.toFixed(2)}</div>
            </div>
            <div class="quantity-control">
              <button class="quantity-btn minus" data-spechash="${goods.specHash}">-</button>
              <input type="number" class="quantity-input" value="${goods.quantity}" min="1" data-spechash="${goods.specHash}">
              <button class="quantity-btn plus" data-spechash="${goods.specHash}">+</button>
            </div>
          </div>
          <div class="goods-swipe-delete" data-spechash="${goods.specHash}">删除</div>
        `;
        goodsListEl.appendChild(goodsItemEl);
        this.initSwipeDelete(goodsItemEl);
      });
      this.cartListEl.appendChild(shopGroupEl);
    });
  }

  // 更新结算栏
  updateCheckoutBar() {
    this.totalPriceEl.textContent = `¥${this.cartManager.totalPrice.toFixed(2)}`;
    this.checkoutBtn.textContent = `结算(${this.cartManager.selectedCount})`;
    this.checkoutBtn.disabled = this.cartManager.selectedCount === 0;
    this.allCheckbox.checked = this.cartManager.allChecked;
  }

  // 初始化左滑删除
  initSwipeDelete(el) {
    const contentEl = el.querySelector('.goods-swipe-content');
    const deleteEl = el.querySelector('.goods-swipe-delete');
    let startX, moveX, distanceX;
    let isMoving = false;
    const deleteWidth = deleteEl.offsetWidth;

    el.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isMoving = true;
      contentEl.style.transition = 'none';
    });

    el.addEventListener('touchmove', (e) => {
      if (!isMoving) return;
      moveX = e.touches[0].clientX;
      distanceX = startX - moveX;
      if (distanceX > 0 && distanceX < deleteWidth) {
        contentEl.style.transform = `translateX(-${distanceX}px)`;
      }
    });

    el.addEventListener('touchend', () => {
      isMoving = false;
      contentEl.style.transition = 'transform 0.3s';
      contentEl.style.transform = distanceX > deleteWidth/2 ? `translateX(-${deleteWidth}px)` : 'translateX(0)';
    });

    deleteEl.addEventListener('click', () => {
      const specHash = deleteEl.dataset.spechash;
      // 添加滑出动画
      contentEl.style.transition = 'transform 0.3s ease-out';
      contentEl.style.transform = `translateX(-${contentEl.offsetWidth}px)`;
      // 动画结束后删除商品
      setTimeout(() => {
        this.cartManager.deleteGoods(specHash);
        this.render();
      }, 300);
    });

    contentEl.addEventListener('click', () => {
      contentEl.style.transform = 'translateX(0)';
    });
  // 绑定事件
  bindEvents() {
    // 全选按钮事件
    this.allCheckbox.addEventListener('change', (e) => {
      this.cartManager.toggleAllCheck(e.target.checked);
      this.render();
    });

    // 结算按钮事件
    this.checkoutBtn.addEventListener('click', () => this.handleCheckout());
  }

  // 处理结算
  handleCheckout() {
    const selectedItems = this.cartManager.getSelectedItems();
    if (selectedItems.length === 0) return;
    
    // 1. 生成订单
    const order = this.cartManager.createOrder(selectedItems);
    
    // 2. 保存订单并跳转支付流程
      orderStore.addOrder(order);
      router.push(`/payment/${order.id}`);
  } // 店铺/商品复选框
    this.cartListEl.addEventListener('change', (e) => {
      if (e.target.classList.contains('shop-checkbox')) {
        this.cartManager.toggleShopCheck(e.target.dataset.shopid, e.target.checked);
        this.render();
      } else if (e.target.classList.contains('goods-checkbox')) {
        this.cartManager.toggleGoodsCheck(e.target.dataset.shopid, e.target.dataset.goodsid, e.target.checked);
        this.render();
      }
    });

    // 数量控制
    this.cartListEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('quantity-btn')) {
        const specHash = e.target.dataset.spechash;
        const input = e.target.parentElement.querySelector('.quantity-input');
        input.value = e.target.classList.contains('plus') ? +input.value + 1 : Math.max(1, +input.value - 1);
        this.cartManager.updateQuantity(specHash, input.value);
        // 即时更新当前商品行而不重新渲染整个列表
        const priceEl = e.target.closest('.goods-swipe-content').querySelector('.goods-price');
        const goods = this.cartManager.cartGroups.flatMap(g => g.goodsList).find(g => g.specHash === specHash);
        priceEl.textContent = `¥${(goods.price * goods.quantity).toFixed(2)}`;
        this.updateCheckoutBar();
      }
    });

    // 数量输入框
    this.cartListEl.addEventListener('input', (e) => {
      if (e.target.classList.contains('quantity-input')) {
        this.cartManager.updateQuantity(e.target.dataset.spechash, e.target.value);
        this.render();
      }
    });
  }
}

// 初始化购物车
document.addEventListener('DOMContentLoaded', () => {
  const cartManager = new CartManager();
  new CartRenderer(cartManager);
});

// 旧代码兼容处理 (可移除)
document.addEventListener('DOMContentLoaded', function() {
  // 页面状态数据
  let cartData = {
    cartGroups: [], // 按店铺分组的购物车数据
    cartEmpty: true, // 购物车是否为空
    allChecked: false, // 是否全选
    totalPrice: 0, // 总价
    hasSelected: false // 是否有选中商品
  };

    // 旧版更新DOM方法 (已废弃)
    updateCartDOM: function() {
      console.warn('updateCartDOM is deprecated, use CartRenderer instead');
      return;
    // 清空列表
    cartListEl.innerHTML = '';

    if (cartData.cartEmpty) {
emptyCartEl.style.display = 'block';
emptyCartEl.innerHTML = `
  <div class="empty-icon"></div>
  <div class="empty-text">购物车为空</div>
  <a href="/index.html" class="goto-shop">去逛逛</a>
`;
return;
}

      emptyCartEl.style.display = 'none';

      // 渲染店铺分组
      cartData.cartGroups.forEach(group => {
        const shopGroupEl = document.createElement('div');
        shopGroupEl.className = 'shop-group';
        shopGroupEl.innerHTML = `
          <div class="shop-header">
            <input type="checkbox" class="shop-checkbox" ${group.checked ? 'checked' : ''} data-shopid="${group.shopId}">
            <span class="shop-name">${group.shopName}</span>
          </div>
          <div class="goods-list"></div>
        `;

        const goodsListEl = shopGroupEl.querySelector('.goods-list');

        // 渲染商品列表
        group.goodsList.forEach(goods => {
          const goodsItemEl = document.createElement('div');
          goodsItemEl.className = 'goods-swipe';
          goodsItemEl.innerHTML = `
            <div class="goods-swipe-content">
              <input type="checkbox" class="goods-checkbox" ${goods.checked ? 'checked' : ''} data-shopid="${group.shopId}" data-goodsid="${goods.id}">
              <img src="${goods.image}" alt="${goods.name}" class="goods-image">
              <div class="goods-info">
                <div class="goods-name">${goods.name}</div>
                ${goods.spec ? `<div class="goods-spec">规格: ${goods.spec}</div>` : ''}
                <div class="goods-price">¥${goods.price.toFixed(2)}</div>
              </div>
              <div class="quantity-control">
                <button class="quantity-btn minus" data-goodsid="${goods.id}">-</button>
                <input type="number" class="quantity-input" value="${goods.quantity}" min="1" data-goodsid="${goods.id}">
                <button class="quantity-btn plus" data-goodsid="${goods.id}">+</button>
              </div>
            </div>
            <div class="goods-swipe-delete" data-goodsid="${goods.id}">删除</div>
          `;

          goodsListEl.appendChild(goodsItemEl);

          // 左滑删除功能
          this.initSwipeDelete(goodsItemEl);
        });

        cartListEl.appendChild(shopGroupEl);
      });

      // 更新总价和结算按钮
      totalPriceEl.textContent = `¥${cartData.totalPrice.toFixed(2)}`;
      checkoutBtn.textContent = `结算(${cartData.selectedCount})`;
      checkoutBtn.disabled = cartData.selectedCount === 0;

      // 更新全选复选框
      document.querySelector('.all-checkbox').checked = cartData.allChecked;

      // 绑定事件
      this.bindEvents();
    },

    // 初始化左滑删除
    initSwipeDelete: function(el) {
      const contentEl = el.querySelector('.goods-swipe-content');
      const deleteEl = el.querySelector('.goods-swipe-delete');
      let startX, moveX, distanceX;
      let isMoving = false;

      // 删除按钮宽度
      const deleteWidth = deleteEl.offsetWidth;

      el.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isMoving = true;
        contentEl.style.transition = 'none';
      });

      el.addEventListener('touchmove', (e) => {
        if (!isMoving) return;
        moveX = e.touches[0].clientX;
        distanceX = startX - moveX;

        if (distanceX > 0 && distanceX < deleteWidth) {
          contentEl.style.transform = `translateX(-${distanceX}px)`;
        }
      });

      el.addEventListener('touchend', () => {
        isMoving = false;
        contentEl.style.transition = 'transform 0.3s';

        if (distanceX > deleteWidth / 2) {
          // 显示删除按钮
          contentEl.style.transform = `translateX(-${deleteWidth}px)`;
        } else {
          // 恢复原位
          contentEl.style.transform = 'translateX(0)';
        }
      });

      // 点击删除
      deleteEl.addEventListener('click', () => {
  const goodsId = deleteEl.dataset.goodsid;
  const contentEl = el.querySelector('.goods-swipe-content');
  contentEl.classList.add('deleting');
  setTimeout(() => {
    this.deleteGoods(goodsId);
  }, 300);
});

      // 点击内容区域恢复原位
      contentEl.addEventListener('click', () => {
        contentEl.style.transform = 'translateX(0)';
      });
    }

  /**
   * 页面的初始数据
   */
  data: {
    cartGroups: [], // 按店铺分组的购物车数据
    cartEmpty: true, // 购物车是否为空
    allChecked: false, // 是否全选
    totalPrice: 0, // 总价
    hasSelected: false // 是否有选中商品
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadCartData();
  },

  /**
   * 加载购物车数据
   */
  loadCartData: function() {
      // 使用Pinia store获取购物车数据
      cartData.cartGroups = cartStore.groupedByShop;
      cartData.cartEmpty = cartStore.items.length === 0;
      cartData.allChecked = cartStore.isAllChecked;
      cartData.totalPrice = cartStore.selectedPrice;
      cartData.selectedCount = cartStore.selectedCount;
      cartData.hasSelected = cartStore.selectedCount > 0;
      
      // 更新DOM
      this.updateCartDOM();
    },

  /**
   * 切换店铺选中状态
   */
  toggleShopCheck: function(e) {
    const shopId = e.currentTarget.dataset.shopid;
    const checked = e.detail.value;
    
    const cartGroups = [...cartData.cartGroups];
    const groupIndex = cartGroups.findIndex(group => group.shopId == shopId);
    
    if (groupIndex >= 0) {
      cartGroups[groupIndex].allChecked = checked;
      // 更新该店铺下所有商品的选中状态
      cartGroups[groupIndex].goods.forEach(goods => {
        goods.checked = checked;
      });
      
      cartData.cartGroups = cartGroups;
      updateCartDOM({ cartGroups: cartGroups });

      // 更新全选状态
      this.updateAllCheckStatus();
      // 更新结算信息
      this.updateCheckoutInfo();
    }
  },

  /**
   * 切换商品选中状态
   */
  toggleGoodsCheck: function(e) {
    const shopId = e.currentTarget.dataset.shopid;
    const goodsId = e.currentTarget.dataset.goodsid;
    const checked = e.detail.value;
    
    const cartGroups = [...cartData.cartGroups];
    const groupIndex = cartGroups.findIndex(group => group.shopId == shopId);
    
    if (groupIndex >= 0) {
      const goodsIndex = cartGroups[groupIndex].goods.findIndex(goods => goods.id == goodsId);
      if (goodsIndex >= 0) {
        cartGroups[groupIndex].goods[goodsIndex].checked = checked;
        
        // 更新店铺全选状态
        const allGoodsChecked = cartGroups[groupIndex].goods.every(goods => goods.checked);
        cartGroups[groupIndex].allChecked = allGoodsChecked;
        
        cartData.cartGroups = cartGroups;
        updateCartDOM({ cartGroups: cartGroups });

        // 更新全选状态
        this.updateAllCheckStatus();
        // 更新结算信息
        this.updateCheckoutInfo();
      }
    }
  },

  /**
   * 更新全选状态
   */
  updateAllCheckStatus: function() {
    let allChecked = true;
    cartData.cartGroups.forEach(group => {
      if (!group.checked) {
        allChecked = false;
      }
    });
    cartData.allChecked = allChecked;
  },

  /**
   * 更新结算信息
   */
  updateCheckoutInfo: function() {
    let totalPrice = 0;
    let selectedCount = 0;

    cartData.cartGroups.forEach(group => {
      group.goodsList.forEach(goods => {
        if (goods.checked) {
          totalPrice += goods.price * goods.quantity;
          selectedCount += goods.quantity;
        }
      });
    });

    cartData.totalPrice = totalPrice;
    cartData.selectedCount = selectedCount;
  },

  /**
   * 绑定事件
   */
  bindEvents: function() {
    // 全选复选框
    document.querySelector('.all-checkbox').addEventListener('change', (e) => {
      this.toggleAllCheck(e.target.checked);
    });

    // 店铺复选框
    document.querySelectorAll('.shop-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const shopId = e.target.dataset.shopid;
        this.toggleShopCheck(shopId, e.target.checked);
      });
    });

    // 商品复选框
    document.querySelectorAll('.goods-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const goodsId = e.target.dataset.goodsid;
        const shopId = e.target.dataset.shopid;
        this.toggleGoodsCheck(shopId, goodsId, e.target.checked);
      });
    });

    // 数量减按钮
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const goodsId = e.target.dataset.goodsid;
        this.decreaseQuantity(goodsId);
      });
    });

    // 数量加按钮
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const goodsId = e.target.dataset.goodsid;
        this.increaseQuantity(goodsId);
      });
    });

    // 数量输入框
    document.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const goodsId = e.target.dataset.goodsid;
        const quantity = parseInt(e.target.value) || 1;
        this.updateQuantity(goodsId, quantity);
      });
    });

    // 结算按钮点击事件
    document.querySelector('.checkout-btn').addEventListener('click', () => {
      if (cartData.selectedCount > 0) {
        document.getElementById('paymentModal').style.display = 'block';
      }
    });

    // 关闭支付弹窗
    document.getElementById('closePaymentModal').addEventListener('click', () => {
      document.getElementById('paymentModal').style.display = 'none';
    });

    // 支付方式切换
    document.querySelectorAll('.payment-method').forEach(btn => {
      btn.addEventListener('click', () => {
        // 更新选中状态
        document.querySelectorAll('.payment-method').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 显示对应支付内容
        const method = btn.dataset.method;
        document.querySelector('.qr-code-container').style.display = method === 'qr' ? 'block' : 'none';
        document.querySelector('.balance-container').style.display = method === 'balance' ? 'block' : 'none';

        // 填充余额支付金额
        if (method === 'balance') {
          document.querySelector('.balance-input').value = cartData.totalPrice.toFixed(2);
        }
      });
    });

    // 加载用户余额
    const loadUserBalance = () => {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const balance = userData.balance || 0;
      document.getElementById('userBalance').textContent = balance.toFixed(2);
      return balance;
    };

    // 确认支付按钮事件
    document.querySelector('.confirm-payment-btn').addEventListener('click', () => {
      const selectedMethod = document.querySelector('.payment-method.active').dataset.method;
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const totalPrice = cartData.totalPrice;

      // 二维码支付直接成功
      if (selectedMethod === 'qr') {
        completePayment(userData);
      } 
      // 余额支付
      else {
        const inputAmount = parseFloat(document.querySelector('.balance-input').value);
        const balance = loadUserBalance();

        if (isNaN(inputAmount) || inputAmount <= 0) {
          showNotification('请输入有效的支付金额', 'error');
          return;
        }

        if (inputAmount !== totalPrice) {
          showNotification('支付金额必须与订单总价一致', 'error');
          return;
        }

        if (balance < totalPrice) {
          showNotification('余额不足，请选择其他支付方式', 'error');
          return;
        }

        // 扣减余额
        userData.balance = balance - totalPrice;
        localStorage.setItem('userData', JSON.stringify(userData));
        completePayment(userData);
      }
    });

    // 完成支付通用逻辑
    const completePayment = (userData) => {
      // 激活店铺权限
      userData.storeActivated = true;
      localStorage.setItem('userData', JSON.stringify(userData));

      // 清空购物车选中商品
      cartStore.clearSelectedItems();
      this.loadCartData();

      // 关闭弹窗并显示成功消息
      document.getElementById('paymentModal').style.display = 'none';
      showNotification('支付成功，店铺已激活！', 'success');

      // 跳转到店铺页面
      setTimeout(() => {
        window.location.href = '/pages/mystore/mystore.html';
      }, 1500);
    };

    // 初始加载用户余额
    loadUserBalance();
  },

  /**
   * 全选/取消全选
   */
  toggleAllCheck: function() {
      cartStore.toggleAllCheck();
      this.loadCartData();
    },

  /**
   * 店铺全选/取消
   */
  toggleShopCheck: function(shopId, checked) {
    const group = cartData.cartGroups.find(g => g.shopId === shopId);
    if (group) {
      group.checked = checked;
      group.goodsList.forEach(goods => {
        goods.checked = checked;
      });

      this.updateAllCheckStatus();
      this.updateCheckoutInfo();
      this.updateCartDOM();
      this.saveCartData();
    }
  },

  /**
   * 商品选中/取消
   */
  toggleGoodsCheck: function(shopId, goodsId, checked) {
      cartStore.toggleItemCheck(goodsId);
      this.loadCartData();
    },

  /**
   * 减少数量
   */
  decreaseQuantity: function(goodsId) {
      const item = cartStore.items.find(i => i.id === goodsId);
      if (item && item.quantity > 1) {
        cartStore.updateQuantity(goodsId, item.quantity - 1);
        this.loadCartData();
      }
    },

  /**
   * 增加数量
   */
  increaseQuantity: function(goodsId) {
    cartData.cartGroups.forEach(group => {
      const goods = group.goodsList.find(item => item.id === goodsId);
      if (goods) {
        goods.quantity++;
        this.updateCheckoutInfo();
        this.updateCartDOM();
        this.saveCartData();
      }
    });
  },

  /**
   * 更新数量
   */
  updateQuantity: function(goodsId, quantity) {
    if (quantity < 1) quantity = 1;

    cartData.cartGroups.forEach(group => {
      const goods = group.goodsList.find(item => item.id === goodsId);
      if (goods) {
        goods.quantity = quantity;
        this.updateCheckoutInfo();
        this.updateCartDOM();
        this.saveCartData();
      }
    });
  },

  /**
   * 删除商品
   */
  deleteGoods: function(goodsId) {
      // 已通过Pinia store实现删除逻辑
      cartStore.removeItem(goodsId);
      this.loadCartData();
    },

  /**
   * 保存购物车数据到localStorage
   */
  // 已通过Pinia store实现数据持久化
    saveCartData: function() {}
    // 保留空函数以避免引用错误

  /**
   * 全选/取消全选
   */
  toggleAllCheck: function(e) {
    const checked = e.detail.value;
    
    const cartGroups = [...this.data.cartGroups];
    cartGroups.forEach(group => {
      group.allChecked = checked;
      group.goods.forEach(goods => {
        goods.checked = checked;
      });
    });
    
    cartData.cartGroups = cartGroups;
      cartData.allChecked = checked;
      updateCartDOM({ cartGroups: cartGroups, allChecked: checked });

    // 更新结算信息
    this.updateCheckoutInfo();
  },

  /**
   * 减少商品数量
   */
  decreaseQuantity: function(e) {
    const shopId = e.currentTarget.dataset.shopid;
    const goodsId = e.currentTarget.dataset.goodsid;
    
    const cartGroups = [...this.data.cartGroups];
    const groupIndex = cartGroups.findIndex(group => group.shopId == shopId);
    
    if (groupIndex >= 0) {
      const goodsIndex = cartGroups[groupIndex].goods.findIndex(goods => goods.id == goodsId);
      if (goodsIndex >= 0) {
        if (cartGroups[groupIndex].goods[goodsIndex].quantity > 1) {
          cartGroups[groupIndex].goods[goodsIndex].quantity--;
        } else {
          // 数量为1时减少则删除该商品
          cartGroups[groupIndex].goods.splice(goodsIndex, 1);
          // 如果店铺下没有商品了，删除该店铺分组
          if (cartGroups[groupIndex].goods.length === 0) {
            cartGroups.splice(groupIndex, 1);
          }
        }
        
        cartData.cartGroups = cartGroups;
        cartData.cartEmpty = cartGroups.length === 0;
        updateCartDOM({ cartGroups: cartGroups, cartEmpty: cartData.cartEmpty });

        // 更新本地存储
        this.updateCartStorage();
        // 更新结算信息
        this.updateCheckoutInfo();
      }
    }
  },

  /**
   * 增加商品数量
   */
  increaseQuantity: function(e) {
    const shopId = e.currentTarget.dataset.shopid;
    const goodsId = e.currentTarget.dataset.goodsid;
    
    const cartGroups = [...this.data.cartGroups];
    const groupIndex = cartGroups.findIndex(group => group.shopId == shopId);
    
    if (groupIndex >= 0) {
      const goodsIndex = cartGroups[groupIndex].goods.findIndex(goods => goods.id == goodsId);
      if (goodsIndex >= 0) {
        cartGroups[groupIndex].goods[goodsIndex].quantity++;
        
        cartData.cartGroups = cartGroups;
        updateCartDOM({ cartGroups: cartGroups });

        // 更新本地存储
        this.updateCartStorage();
        // 更新结算信息
        this.updateCheckoutInfo();
      }
    }
  },

  /**
   * 删除商品
   */
  deleteGoods: function(e) {
    const shopId = e.currentTarget.dataset.shopid;
    const goodsId = e.currentTarget.dataset.goodsid;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          const cartGroups = [...this.data.cartGroups];
          const groupIndex = cartGroups.findIndex(group => group.shopId == shopId);
          
          if (groupIndex >= 0) {
            const goodsIndex = cartGroups[groupIndex].goods.findIndex(goods => goods.id == goodsId);
            if (goodsIndex >= 0) {
              // 删除商品
              cartGroups[groupIndex].goods.splice(goodsIndex, 1);
              // 如果店铺下没有商品了，删除该店铺分组
              if (cartGroups[groupIndex].goods.length === 0) {
                cartGroups.splice(groupIndex, 1);
              }
              
              cartData.cartGroups = cartGroups;
              cartData.cartEmpty = cartGroups.length === 0;
              updateCartDOM({ cartGroups: cartGroups, cartEmpty: cartData.cartEmpty });

              // 更新本地存储
              this.updateCartStorage();
              // 更新结算信息
              this.updateCheckoutInfo();
            }
          }
        }
      }
    });
  },

  /**
   * 更新购物车本地存储
   */
  updateCartStorage: function() {
    // 扁平化购物车数据
    let cartItems = [];
    this.data.cartGroups.forEach(group => {
      group.goods.forEach(goods => {
        // 根据数量添加对应次数的商品
        for (let i = 0; i < goods.quantity; i++) {
          // 移除checked和quantity属性，只保留商品基本信息
          const { checked, quantity, ...basicGoodsInfo } = goods;
          cartItems.push(basicGoodsInfo);
        }
      });
    });
    
    // 保存到本地存储
    localStorage.setItem('cart', JSON.stringify(cartItems));
  },

  /**
   * 更新结算信息
   */
  updateCheckoutInfo: function() {
    let totalPrice = 0;
    let hasSelected = false;

    cartData.cartGroups.forEach(group => {
      group.goods.forEach(goods => {
        if (goods.checked) {
          hasSelected = true;
          totalPrice += goods.price * goods.quantity;
        }
      });
    });
    
    // 添加配送费（假设满30元免配送费，否则6元）
    const deliveryFee = totalPrice >= 30 ? 0 : 6;
    totalPrice += deliveryFee;
    
    cartData.totalPrice = totalPrice;
    cartData.hasSelected = hasSelected;
    updateCartDOM({ totalPrice: totalPrice, hasSelected: hasSelected });
  },

  /**
   * 前往店铺页面
   */
  gotoShop: function() {
    wx.navigateTo({
      url: '/pages/shop/shop'
    });
  },

  /**
   * 前往支付页面
   */
  gotoPayment: function() {
    // 获取选中的商品
    const selectedGoods = [];
    this.data.cartGroups.forEach(group => {
      group.goods.forEach(goods => {
        if (goods.checked) {
          selectedGoods.push(goods);
        }
      });
    });
    
    // 保存选中的商品到本地存储，供支付页面使用
    wx.setStorageSync('selectedGoods', selectedGoods);
    wx.setStorageSync('totalPrice', this.data.totalPrice);
    
    // 跳转到订单确认/支付页面
    wx.navigateTo({
      url: '/pages/order/order'
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '依狸窝 - 我的购物车',
      path: '/pages/cart/cart'
    }
  }
})