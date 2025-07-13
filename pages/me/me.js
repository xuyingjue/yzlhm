Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    avatarUrl: '/images/default-avatar.png',
    userName: '依狸窝用户',
    userId: 'YL' + Math.floor(Math.random() * 10000000),
    // 数据统计
    todayOrders: 0,
    totalSales: '0.00',
    balance: '0.00',
    visitorCount: 0,
  // 客服模态框
  modalVisible: false,
  isWorkingHours: false
},{

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    this.getUserInfo();
    // 加载数据统计
    this.loadStatsData();
    // 加载用户余额
    this.loadUserBalance();
    // 初始化余额监听
    this.initBalanceListener();
  }

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 重新加载数据统计
    this.loadStatsData();
    // 重新加载用户余额
    this.loadUserBalance();
  }

  /**
   * 获取用户信息
   */
  getUserInfo: function() {
    // TODO: 从微信接口获取用户信息
    wx.getUserInfo({
      success: (res) => {
        this.setData({
          avatarUrl: res.userInfo.avatarUrl,
          userName: res.userInfo.nickName
        });
      },
      fail: () => {
        console.log('获取用户信息失败');
      }
    });
  },

  /**
   * 加载数据统计
   */
  loadStatsData: function() {
    // TODO: 从后端获取数据统计
    // 模拟数据
    this.setData({
      todayOrders: Math.floor(Math.random() * 10),
      totalSales: (Math.random() * 1000).toFixed(2),
      visitorCount: Math.floor(Math.random() * 100)
    });
  },

  /**
   * 加载用户余额
   */
  loadUserBalance: function() {
    // 从DataManager获取用户余额
    const currentBalance = DataManager.getBalance() || 0;
    this.setData({
      balance: currentBalance.toFixed(2)
    });
  },

  /**
   * 初始化余额变化监听
   */
  initBalanceListener: function() {
    // 监听余额变化事件
    DataManager.on('balanceChange', (newBalance) => {
      this.setData({
        balance: newBalance.toFixed(2)
      });
    });
  ,

  /**
   * 编辑用户信息
   */
  editUserInfo: function() {
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  },

  /**
   * 前往余额页面
   */
  gotoBalance: function() {
    wx.showToast({
      title: '余额功能开发中',
      icon: 'none'
    });
  },

  /**
   * 前往订单页面
   */
  gotoOrders: function() {
    wx.navigateTo({
      url: '/pages/order/order'
    });
  },

  /**
   * 前往收藏页面
   */
  gotoFavorites: function() {
    wx.showToast({
      title: '收藏功能开发中',
      icon: 'none'
    });
  },

  /**
   * 前往足迹页面
   */
  gotoFootprint: function() {
    wx.showToast({
      title: '足迹功能开发中',
      icon: 'none'
    });
  },

document.addEventListener('DOMContentLoaded', function() {
    loadUserBalance();

    // 客服模态框逻辑
    const modal = document.getElementById('serviceModal');
    const contactBtn = document.getElementById('contactService');
    const closeBtn = document.querySelector('.close-btn');
    const chatWindow = document.getElementById('chatWindow');
    const contactCard = document.getElementById('contactCard');
    const chatInput = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.send-btn');
    const chatMessages = document.querySelector('.chat-messages');

    // 打开模态框
    contactBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
        checkWorkingHours();
    });

    // 关闭模态框
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 检查工作时间并显示相应内容
    function checkWorkingHours() {
        const now = new Date();
        const currentHour = now.getHours();
        const isWorkingHours = currentHour >= 9 && currentHour < 18;

        chatWindow.style.display = isWorkingHours ? 'flex' : 'none';
        contactCard.style.display = isWorkingHours ? 'none' : 'block';
    }

    // 发送聊天消息
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message user-message';
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // 模拟客服回复
            setTimeout(() => {
                const replyElement = document.createElement('div');
                replyElement.className = 'message bot-message';
                replyElement.textContent = '感谢您的咨询，我们会尽快回复您！';
                chatMessages.appendChild(replyElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

  /**
   * 前往我的店铺
   */
  gotoMyStore: function() {
    wx.navigateTo({
      url: '/pages/mystore/mystore'
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '依狸窝 - 个人中心',
      path: '/pages/me/me'
    }
  }
})