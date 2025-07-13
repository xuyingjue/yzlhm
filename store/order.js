class OrderStore {
  constructor() {
    this.userOrders = [];
    this.listeners = [];
    this.loadOrders();
  }

  // 从本地存储加载订单
  loadOrders() {
    const savedOrders = localStorage.getItem('userOrders');
    if (savedOrders) {
      this.userOrders = JSON.parse(savedOrders);
    }
  }

  // 保存订单到本地存储
  saveOrders() {
    localStorage.setItem('userOrders', JSON.stringify(this.userOrders));
    this.notifyListeners();
  }

  // 添加新订单
  addOrder(order) {
    this.userOrders.unshift(order); // 添加到数组开头
    this.saveOrders();
  }

  // 更新订单状态
  updateOrderStatus(orderId, status) {
    const orderIndex = this.userOrders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
      this.userOrders[orderIndex].status = status;
      this.saveOrders();
    }
  }

  // 获取订单详情
  getOrderById(orderId) {
    return this.userOrders.find(order => order.id === orderId);
  }

  // 监听数据变化
  on(event, callback) {
    if (event === 'change') {
      this.listeners.push(callback);
    }
  }

  // 通知所有监听器
  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }
}

export const orderStore = new OrderStore();