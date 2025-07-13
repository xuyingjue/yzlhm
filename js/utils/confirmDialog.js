/**
 * 安全确认对话框工具
 * 提供统一的敏感操作二次确认功能
 */
const ConfirmDialog = {
  /**
   * 显示确认对话框
   * @param {Object} options - 配置选项
   * @param {string} options.title - 对话框标题
   * @param {string} options.message - 确认消息内容
   * @param {string} [options.confirmText='确认'] - 确认按钮文本
   * @param {string} [options.cancelText='取消'] - 取消按钮文本
   * @param {string} [options.dangerLevel='normal'] - 危险级别 normal|high|critical
   * @returns {Promise<boolean>} - 用户确认状态
   */
  show: function(options) {
    return new Promise((resolve) => {
      // 创建对话框元素
      const dialog = document.createElement('div');
      dialog.className = `confirm-dialog danger-${options.dangerLevel || 'normal'}`;
      dialog.innerHTML = `
        <div class="confirm-overlay"></div>
        <div class="confirm-content">
          <h3 class="confirm-title">${options.title || '操作确认'}</h3>
          <div class="confirm-message">${options.message}</div>
          <div class="confirm-buttons">
            <button class="confirm-btn cancel-btn">${options.cancelText || '取消'}</button>
            <button class="confirm-btn confirm-btn">${options.confirmText || '确认'}</button>
          </div>
        </div>
      `;

      // 添加到页面
      document.body.appendChild(dialog);
      // 显示动画
      setTimeout(() => dialog.classList.add('active'), 10);

      // 绑定事件
      const cancelBtn = dialog.querySelector('.cancel-btn');
      const confirmBtn = dialog.querySelector('.confirm-btn');
      const overlay = dialog.querySelector('.confirm-overlay');

      const removeDialog = () => {
        dialog.classList.remove('active');
        setTimeout(() => document.body.removeChild(dialog), 300);
      };

      cancelBtn.addEventListener('click', () => {
        removeDialog();
        resolve(false);
      });

      confirmBtn.addEventListener('click', () => {
        removeDialog();
        resolve(true);
      });

      overlay.addEventListener('click', () => {
        removeDialog();
        resolve(false);
      });
    });
  },

  /**
   * 快捷显示危险操作确认
   * @param {string} message - 确认消息
   * @returns {Promise<boolean>}
   */
  danger: function(message) {
    return this.show({
      title: '危险操作确认',
      message,
      dangerLevel: 'critical',
      confirmText: '确认执行',
      cancelText: '取消'
    });
  },

  /**
   * 快捷显示支付确认
   * @param {number} amount - 支付金额
   * @returns {Promise<boolean>}
   */
  payment: function(amount) {
    return this.show({
      title: '支付确认',
      message: `您即将支付 <strong>¥${amount.toFixed(2)}</strong>，请确认支付信息无误。`,
      dangerLevel: 'high',
      confirmText: '确认支付',
      cancelText: '取消支付'
    });
  }
};

// 导出到全局
window.ConfirmDialog = ConfirmDialog;