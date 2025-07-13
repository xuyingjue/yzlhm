document.addEventListener('DOMContentLoaded', function() {
  // 初始化DataManager
if (!window.DataManager) {
  console.error('DataManager未加载');
}

// 加载订单数据
function loadOrderData() {
    return DataManager.getOrders() || [];
}

// 保存订单数据
function saveOrderData(orders) {
    DataManager.setOrders(orders);
}

// 更新订单状态
function updateOrderStatus(orderId, newStatus) {
    DataManager.updateOrderStatus(orderId, newStatus);
}

// 订单流程数据
const orderProcess = {
    currentStep: 0, // 当前步骤 0-3
    selectedPackage: null, // 选中的套餐
    paymentProof: null, // 支付凭证
    formData: {}, // 表单数据
    countdown: 300, // 支付倒计时（秒）
    countdownTimer: null // 倒计时定时器
  };

  // DOM元素
  const elements = {
    processSteps: document.querySelectorAll('.process-step'),
    stepPanels: document.querySelectorAll('.step-panel'),
    packageItems: document.querySelectorAll('.package-item'),
    packageNext: document.getElementById('packageNext'),
    paymentNext: document.getElementById('paymentNext'),
    uploadNext: document.getElementById('uploadNext'),
    submitOrder: document.getElementById('submitOrder'),
    uploadArea: document.getElementById('uploadArea'),
    uploadInput: document.querySelector('.upload-input'),
    previewContainer: document.getElementById('previewContainer'),
    infoForm: document.getElementById('infoForm'),
    countdownEl: document.querySelector('.countdown'),
    paymentPackageName: document.getElementById('paymentPackageName'),
    paymentAmount: document.getElementById('paymentAmount')
  };

  // 初始化
  function init() {
    // 禁用下一步按钮
    elements.packageNext.disabled = true;
    elements.uploadNext.disabled = true;

    // 绑定事件
    bindEvents();
  }

  // 绑定事件
  function bindEvents() {
    // 步骤点击事件
    elements.processSteps.forEach(step => {
      step.addEventListener('click', function() {
        const stepIndex = parseInt(this.dataset.step);
        if (stepIndex <= orderProcess.currentStep) {
          goToStep(stepIndex);
        }
      });
    });

    // 套餐选择事件 - 使用事件委托解决子元素遮挡问题
    document.querySelector('.package-list').addEventListener('click', function(e) {
      const packageItem = e.target.closest('.package-item');
      if (packageItem) {
        elements.packageItems.forEach(i => i.classList.remove('active'));
        packageItem.classList.add('active');
        orderProcess.selectedPackage = {
          id: packageItem.dataset.id,
          name: packageItem.querySelector('h3').textContent,
          price: packageItem.dataset.price
        };
        elements.packageNext.disabled = false;
      }
    });

    // 下一步按钮事件
    elements.packageNext.addEventListener('click', () => goToStep(1));
    elements.paymentNext.addEventListener('click', () => goToStep(2));
    elements.uploadNext.addEventListener('click', () => goToStep(3));

    // 提交订单按钮事件
    elements.submitOrder.addEventListener('click', submitOrder);

    // 上传区域点击事件
    elements.uploadArea.addEventListener('click', () => elements.uploadInput.click());

    // 文件选择事件
    elements.uploadInput.addEventListener('change', handleFileUpload);
  }

  // 切换到指定步骤
  function goToStep(stepIndex) {
    // 保存当前步骤数据
    saveStepData(orderProcess.currentStep);

    // 更新当前步骤
    orderProcess.currentStep = stepIndex;

    // 更新UI
    updateStepUI();

    // 加载目标步骤数据
    loadStepData(stepIndex);
  }

  // 更新步骤UI
  function updateStepUI() {
    // 更新步骤指示器
    elements.processSteps.forEach((step, index) => {
      if (index === orderProcess.currentStep) {
        step.classList.add('active');
      } else if (index < orderProcess.currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // 更新步骤内容
    elements.stepPanels.forEach((panel, index) => {
      panel.classList.toggle('active', index === orderProcess.currentStep);
    });
  }

  // 保存当前步骤数据
  function saveStepData(stepIndex) {
    switch(stepIndex) {
      case 3:
        // 保存表单数据
        const formData = new FormData(elements.infoForm);
        orderProcess.formData = Object.fromEntries(formData.entries());
        break;
    }
  }

  // 加载步骤数据
  function loadStepData(stepIndex) {
    switch(stepIndex) {
      case 1:
        // 支付步骤 - 显示选中的套餐信息
        if (orderProcess.selectedPackage) {
          elements.paymentPackageName.textContent = orderProcess.selectedPackage.name;
          elements.paymentAmount.textContent = `¥${orderProcess.selectedPackage.price}`;
        }
        // 启动倒计时
        startCountdown();
        break;
      case 3:
        // 信息填写步骤 - 填充表单数据
        if (orderProcess.formData) {
          Object.keys(orderProcess.formData).forEach(key => {
            const input = elements.infoForm.querySelector(`[name="${key}"]`);
            if (input) input.value = orderProcess.formData[key];
          });
        }
        break;
    }
  }

  // 处理文件上传
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型和大小
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('请上传jpg或png格式的图片');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB');
      return;
    }

    // 显示预览
    const reader = new FileReader();
    reader.onload = function(e) {
      elements.previewContainer.innerHTML = `
        <img src="${e.target.result}" class="preview-image" alt="支付凭证">
      `;
      orderProcess.paymentProof = e.target.result;
      elements.uploadNext.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  // 启动支付倒计时
  function startCountdown() {
    // 清除之前的定时器
    if (orderProcess.countdownTimer) {
      clearInterval(orderProcess.countdownTimer);
    }

    // 更新倒计时显示
    updateCountdownDisplay();

    // 设置定时器
    orderProcess.countdownTimer = setInterval(() => {
      orderProcess.countdown--;
      updateCountdownDisplay();

      // 倒计时结束
      if (orderProcess.countdown <= 0) {
        clearInterval(orderProcess.countdownTimer);
        alert('二维码已过期，请重新获取');
        goToStep(0);
      }
    }, 1000);
  }

  // 更新倒计时显示
  function updateCountdownDisplay() {
    const minutes = Math.floor(orderProcess.countdown / 60);
    const seconds = orderProcess.countdown % 60;
    elements.countdownEl.textContent = `${minutes}分${seconds}秒后过期`;
  }

  // 提交订单
  async function submitOrder() {
  // 表单验证
  if (!validateForm()) return;

  try {
    // 加密支付凭证数据
    const paymentId = await CryptoUtil.storePaymentInfo(orderProcess.paymentProof);
    
    // 收集订单数据
    const orderData = {
      id: Date.now(),
      orderNumber: 'YL' + Date.now() + Math.floor(Math.random() * 1000),
      package: orderProcess.selectedPackage,
      paymentId: paymentId, // 存储加密后的paymentId
      customerInfo: orderProcess.formData,
      status: 'pending',
      createTime: new Date().toLocaleString()
    };

    // 保存订单到本地存储
    saveOrderToLocalStorage(orderData);

    showToast('支付信息已安全保存');
    alert('订单提交成功！');
    window.location.href = '/pages/order/management.html';
  } catch (error) {
    showToast('支付信息保存失败: ' + error.message, 'error');
  }
}

  // 表单验证
function validateForm() {
  let isValid = true;
  const formData = orderProcess.formData;
  const errorFields = [];

  // 清除之前的错误提示
  document.querySelectorAll('.form-error').forEach(el => el.remove());

  // 验证联系人姓名
  if (!formData.contact.trim()) {
    isValid = false;
    errorFields.push({id: 'contact', message: '联系人姓名不能为空'});
  }

  // 验证手机号
  if (!formData.phone.trim()) {
    isValid = false;
    errorFields.push({id: 'phone', message: '手机号不能为空'});
  } else if (!/^1[3-9]\d{9}$/.test(formData.phone.trim())) {
    isValid = false;
    errorFields.push({id: 'phone', message: '请输入有效的手机号'});
  }

  // 验证地址
  if (!formData.address.trim()) {
    isValid = false;
    errorFields.push({id: 'address', message: '收货地址不能为空'});
  }

  // 显示错误提示
  errorFields.forEach(({id, message}) => {
    const field = document.getElementById('form-' + id);
    if (field) {
      const errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      errorEl.style.color = '#ff4444';
      errorEl.style.fontSize = '12px';
      errorEl.style.marginTop = '4px';
      errorEl.textContent = message;
      field.parentNode.appendChild(errorEl);
    }
  });

  return isValid;
}

  // 保存订单到本地存储
  function saveOrderToLocalStorage(order) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
  }

  // 初始化页面
  init();
});

    // 模拟支付成功的轮询检查
    setTimeout(() => {
      // 这里应该是轮询检查支付状态的逻辑
      // 简化处理，5秒后模拟支付成功
      if (this.data.showQR) {
        this.paymentSuccess();
      }
    }, 5000);
  },

  /**
   * 支付成功处理
   */
  paymentSuccess: function() {
    // 清除倒计时
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }

    // 隐藏支付弹窗
    this.setData({
      showQR: false
    });

    // 更新订单状态
    let orders = wx.getStorageSync('orders') || [];
    const firstPendingOrder = orders.find(order => order.status === 'pending');
    if (firstPendingOrder) {
      firstPendingOrder.status = 'processing';
      firstPendingOrder.statusText = '进行中';
      wx.setStorageSync('orders', orders);

      // 刷新订单列表
      this.loadOrders();

      // 显示支付成功提示
      wx.showToast({
        title: '支付成功',
        icon: 'success'
      });

      // 2秒后切换到进行中标签页
      setTimeout(() => {
        this.setData({
          currentTab: 1
        });
        this.loadOrders();
      }, 2000);
    }
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '依狸窝 - 我的订单',
      path: '/pages/order/order'
    }
  }
})