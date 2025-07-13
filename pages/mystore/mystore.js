Page({
  /**
   * 页面的初始数据
   */
  data: {
    openedCount: 45, // 已开通店铺数量
    packages: [
      {
        id: 1,
        name: '基础版',
        price: 99,
        period: '月',
        desc: '适合个人小店，基础功能支持'
      },
      {
        id: 2,
        name: '进阶版',
        price: 199,
        period: '月',
        desc: '多店员管理，营销工具'
      },
      {
        id: 3,
        name: '专业版',
        price: 399,
        period: '月',
        desc: '高级数据分析，专属客服'
      },
      {
        id: 4,
        name: '企业版',
        price: 999,
        period: '月',
        desc: '定制功能，API对接'
      }
    ],
    shopName: '',
    avatarUrl: '/images/default-avatar.png',
    qrUrl: '/images/default-qr.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从后端获取店铺开通数量和店铺信息
    this.checkShopStatus();
    this.bindEvents();
  },

  /**
   * 绑定事件
   */
  bindEvents: function() {
    // 套餐选择
    document.querySelectorAll('.package-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectPackage(card.dataset.id);
      });
    });

    // 开通店铺按钮
    document.getElementById('openShopBtn').addEventListener('click', () => {
      this.openShop();
    });

    // 关闭支付弹窗
    document.getElementById('closePaymentModal').addEventListener('click', () => {
      this.closePaymentModal();
    });

    // 上传支付凭证
    document.querySelector('.upload-proof-btn').addEventListener('click', () => {
      this.uploadPaymentProof();
    });

    // 店铺名称输入
    document.querySelector('.form-input').addEventListener('input', (e) => {
      this.data.shopName = e.target.value;
    });

    // 上传头像
    document.querySelector('.avatar-upload .upload-btn').addEventListener('click', () => {
      this.uploadAvatar();
    });

    // 上传收款码
    document.querySelector('.qr-upload .upload-btn').addEventListener('click', () => {
      this.uploadQR();
    });

    // 功能入口点击事件
    document.getElementById('publishGoods')?.addEventListener('click', () => {
      window.location.href = '/pages/product/publish.html';
    });

    document.getElementById('allGoods')?.addEventListener('click', () => {
      window.location.href = '/pages/product/product-list.html';
    });

    document.getElementById('allOrders')?.addEventListener('click', () => {
      window.location.href = '/pages/order/order-list.html';
    });

    document.getElementById('goodsCategories')?.addEventListener('click', () => {
      window.location.href = '/pages/category/category-list.html';
    });
  }

  /**
   * 更新店铺状态指示灯
   */
  updateStatusIndicator: function(status) {
    const indicator = document.querySelector('.status-indicator');
    if (!indicator) return;

    // 移除所有状态类
    indicator.classList.remove('green', 'yellow', 'red');

    // 添加对应状态类
    switch(status) {
      case 'normal':
        indicator.classList.add('green');
        break;
      case 'warning':
        indicator.classList.add('yellow');
        break;
      case 'frozen':
        indicator.classList.add('red');
        break;
      default:
        indicator.classList.add('green');
    }
  },

  /**
   * 更新数据概览
   */
  updateDataOverview: function(data) {
    document.querySelector('.data-overview .data-card:nth-child(1) .data-value')?.textContent = data.todayOrders;
    document.querySelector('.data-overview .data-card:nth-child(2) .data-value')?.textContent = data.activeProducts;
    document.querySelector('.data-overview .data-card:nth-child(3) .data-value')?.textContent = data.pendingShipments;
  },

  /**
   * 检查店铺状态
   */
  checkShopStatus: function() {
    // 模拟从后端获取数据
    const shopData = {
      status: 'opened', // opened, unopened, frozen
      todayOrders: 12,
      activeProducts: 35,
      pendingShipments: 5,
      remainingSlots: 5
    };

    // 更新剩余名额显示
    document.querySelector('.benefit-text')?.textContent = `「前50名免费」剩余名额：${shopData.remainingSlots}`;

    // 根据店铺状态显示不同界面
    if (shopData.status === 'opened') {
      document.querySelector('.shop-management')?.style.display = 'block';
      document.querySelector('.shop-setup')?.style.display = 'none';

      // 更新状态指示灯
      const status = shopData.pendingShipments > 0 ? 'warning' : 'normal';
      this.updateStatusIndicator(status);

      // 更新数据概览
      this.updateDataOverview({
        todayOrders: shopData.todayOrders,
        activeProducts: shopData.activeProducts,
        pendingShipments: shopData.pendingShipments
      });

      // 更新商品数量角标
      document.querySelector('#allGoods .badge')?.textContent = shopData.activeProducts;
      document.querySelector('#allOrders .badge')?.textContent = shopData.pendingShipments;
    } else if (shopData.status === 'frozen') {
      document.querySelector('.shop-management')?.style.display = 'block';
      document.querySelector('.shop-setup')?.style.display = 'none';
      this.updateStatusIndicator('frozen');
    } else {
      document.querySelector('.shop-management')?.style.display = 'none';
      document.querySelector('.shop-setup')?.style.display = 'block';
      document.getElementById('openShopBtn').textContent = shopData.remainingSlots > 0 ? '免费开通店铺' : '选择套餐开通';
    }
  },

  /**
   * 输入店铺名称
   */
  inputShopName: function(e) {
    this.setData({
      shopName: e.detail.value
    });
  },

  /**
   * 上传店铺头像
   */
  uploadAvatar: function() {
    // TODO: 实现图片上传功能
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          avatarUrl: tempFilePaths[0]
        });
      }
    });
  },

  /**
   * 上传收款码
   */
  uploadQR: function() {
    // TODO: 实现图片上传功能
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          qrUrl: tempFilePaths[0]
        });
      }
    });
  },

  /**
   * 选择套餐
   */
  selectPackage: function(packageId) {
    // 移除其他套餐的选中状态
    document.querySelectorAll('.package-card').forEach(card => {
      card.classList.remove('selected');
    });

    // 添加当前套餐的选中状态
    const selectedCard = document.querySelector(`.package-card[data-id="${packageId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
      this.data.selectedPackageId = packageId;
      const packageName = this.data.packages.find(p => p.id == packageId).name;
      alert(`已选择${packageName}`);
    }
  },

  /**
   * 打开店铺
   */
  openShop: function() {
    const shopName = this.data.shopName || document.querySelector('.form-input').value;
    if (!shopName) {
      alert('请输入店铺名称');
      return;
    }

    // 检查是否前50名免费
    const remainingCount = parseInt(document.querySelector('.benefit-text').textContent.match(/\d+/)[0]);
    if (remainingCount > 0) {
      // 免费开通
      this.submitShopInfo(true);
    } else {
      // 需要选择套餐
      if (!this.data.selectedPackageId) {
        alert('请先选择套餐');
        return;
      }
      // 显示支付弹窗
      this.showPaymentModal();
    }
  },

  /**
   * 显示支付弹窗
   */
  showPaymentModal: function() {
    document.getElementById('paymentModal').style.display = 'flex';
  },

  /**
   * 关闭支付弹窗
   */
  closePaymentModal: function() {
    document.getElementById('paymentModal').style.display = 'none';
  },

  /**
   * 上传支付凭证
   */
  uploadPaymentProof: function() {
    // 模拟图片上传
    alert('请选择支付凭证图片');
    // 上传成功后提交店铺信息
    setTimeout(() => {
      this.closePaymentModal();
      this.submitShopInfo(false);
    }, 1000);
  },

  /**
   * 提交店铺信息
   */
  submitShopInfo: function() {
    if (!this.data.shopName) {
      wx.showToast({
        title: '请输入店铺名称',
        icon: 'none'
      });
      return;
    }

    // TODO: 实现店铺信息提交逻辑
    wx.showToast({
      title: this.data.openedCount < 50 ? '店铺开通成功' : '店铺信息保存成功',
      icon: 'success'
    });
  },

  /**
   * 前往商品管理
   */
  gotoGoodsManage: function() {
    // TODO: 实现商品管理页面跳转
    wx.showToast({
      title: '商品管理功能开发中',
      icon: 'none'
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '依狸窝 - 我的店铺',
      path: '/pages/mystore/mystore'
    }
  }
})