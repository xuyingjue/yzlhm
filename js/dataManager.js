/**
 * 数据管理模块 - 统一处理本地存储和状态同步
 */
const DataManager = {
  // 存储键名常量
  STORAGE_KEYS: {
    CART: 'cartItems',
    USER_INFO: 'userInfo',
    BALANCE: 'userBalance',
    PRODUCT_FAVORITES: 'productFavorites',
    SHOP_FAVORITES: 'shopFavorites',
    FOOTPRINTS: 'footprintRecords',
    ORDERS: 'userOrders'
  },

  // 事件监听器集合
  listeners: {},

  /**
   * 初始化数据管理器
   */
  init() {
    // 初始化默认数据
    this.initDefaultData();
  },

  /**
   * 初始化默认数据
   */
  initDefaultData() {
    // 如果用户信息不存在，设置默认值
    if (!this.getUserInfo()) {
      this.setUserInfo({
        avatarUrl: '/imgres/default-avatar.png',
        userName: '依狸窝用户',
        userId: 'YL' + Math.floor(Math.random() * 10000000)
      });
    }

    // 如果余额不存在，设置默认值
    if (this.getBalance() === null) {
      this.setBalance(0);
    }
  },

  /**
   * 获取购物车数据
   * @returns {Array}
   */
  getCart() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CART) || '[]');
  },

  /**
   * 设置购物车数据
   * @param {Array} cartData
   */
  setCart(cartData) {
    localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(cartData));
    this.trigger('cartChange', cartData);
  },

  /**
   * 获取用户信息
   * @returns {Object}
   */
  getUserInfo() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USER_INFO) || 'null');
  },

  /**
   * 设置用户信息
   * @param {Object} userInfo
   */
  setUserInfo(userInfo) {
    localStorage.setItem(this.STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    this.trigger('userInfoChange', userInfo);
  },

  /**
   * 获取用户余额
   * @returns {number}
   */
  getBalance() {
    const balance = localStorage.getItem(this.STORAGE_KEYS.BALANCE);
    return balance !== null ? parseFloat(balance) : null;
  },

  /**
   * 设置用户余额
   * @param {number} amount
   */
  setBalance(amount) {
    const newAmount = parseFloat(amount).toFixed(2);
    localStorage.setItem(this.STORAGE_KEYS.BALANCE, newAmount);
    this.trigger('balanceChange', parseFloat(newAmount));
  },

  /**
   * 更新余额（增减）
   * @param {number} delta - 变化量（正数增加，负数减少）
   * @returns {number} - 更新后的余额
   */
  updateBalance(delta) {
    const currentBalance = this.getBalance() || 0;
    const newBalance = Math.max(0, currentBalance + parseFloat(delta));
    this.setBalance(newBalance);
    return newBalance;
  },

  /**
   * 获取商品收藏
   * @returns {Array}
   */
  getProductFavorites() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PRODUCT_FAVORITES) || '[]');
  },

  /**
   * 设置商品收藏
   * @param {Array} favorites
   */
  setProductFavorites(favorites) {
    localStorage.setItem(this.STORAGE_KEYS.PRODUCT_FAVORITES, JSON.stringify(favorites));
    this.trigger('productFavoritesChange', favorites);
  },

  /**
   * 获取店铺收藏
   * @returns {Array}
   */
  getShopFavorites() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SHOP_FAVORITES) || '[]');
  },

  /**
   * 设置店铺收藏
   * @param {Array} favorites
   */
  setShopFavorites(favorites) {
    localStorage.setItem(this.STORAGE_KEYS.SHOP_FAVORITES, JSON.stringify(favorites));
    this.trigger('shopFavoritesChange', favorites);
  },

  /**
   * 获取浏览足迹
   * @returns {Array}
   */
  getFootprints() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.FOOTPRINTS) || '[]');
  },

  /**
   * 设置浏览足迹
   * @param {Array} footprints
   */
  setFootprints(footprints) {
    localStorage.setItem(this.STORAGE_KEYS.FOOTPRINTS, JSON.stringify(footprints));
    this.trigger('footprintChange', footprints);
  },

  /**
   * 获取订单数据
   * @returns {Array}
   */
  getOrders() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ORDERS) || '[]');
  },

  /**
   * 设置订单数据
   * @param {Array} orders
   */
  setOrders(orders) {
    localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.trigger('ordersChange', orders);
  },

  /**
   * 更新订单状态
   * @param {string} orderId
   * @param {string} newStatus
   * @returns {Array} - 更新后的订单列表
   */
  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = newStatus;
      orders[orderIndex].updatedAt = new Date().toISOString();
      this.setOrders(orders);
    }
    return orders;
  },

  /**
   * 添加事件监听器
   * @param {string} eventName
   * @param {Function} callback
   */
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  },

  /**
   * 移除事件监听器
   * @param {string} eventName
   * @param {Function} callback
   */
  off(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
    }
  },

  /**
   * 触发事件
   * @param {string} eventName
   * @param {*} data
   */
  trigger(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error triggering event ${eventName}:`, error);
        }
      });
    }
  },

  /**
   * 清除所有本地数据
   * @param {Array} excludeKeys - 要排除的键名数组
   */
  clearAll(excludeKeys = []) {
    const keysToRemove = Object.values(this.STORAGE_KEYS).filter(key => !excludeKeys.includes(key));
    keysToRemove.forEach(key => localStorage.removeItem(key));
    this.initDefaultData();
    this.trigger('dataCleared');
  }
};

// 初始化数据管理器
DataManager.init();

// 导出单例实例
window.DataManager = DataManager;