/**
 * 数据备份工具模块
 * 提供用户数据的加密备份和恢复功能
 */
const BackupUtil = {
  /**
   * 导出所有用户数据并生成备份文件
   * @param {string} [fileNamePrefix='yizhilihuam_backup'] - 备份文件名前缀
   */
  async exportAllData(fileNamePrefix = 'yizhilihuam_backup') {
    try {
      // 收集所有需要备份的数据
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          cart: DataManager.getCart(),
          userInfo: DataManager.getUserInfo(),
          balance: DataManager.getBalance(),
          productFavorites: DataManager.getProductFavorites(),
          shopFavorites: DataManager.getShopFavorites(),
          footprints: DataManager.getFootprints(),
          orders: DataManager.getOrders()
        }
      };

      // 加密备份数据
      const encryptedData = await CryptoUtil.encrypt(JSON.stringify(backupData));

      // 创建备份文件并下载
      const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `${fileNamePrefix}_${timestamp}.backup`;
      a.href = url;
      a.click();

      // 清理
      setTimeout(() => URL.revokeObjectURL(url), 100);
      showToast('数据备份成功');
      return true;
    } catch (error) {
      console.error('数据备份失败:', error);
      showToast('数据备份失败: ' + error.message, 'error');
      return false;
    }
  },

  /**
   * 从备份文件导入数据
   * @param {File} file - 备份文件
   * @returns {Promise<boolean>} - 导入是否成功
   */
  async importFromFile(file) {
    return new Promise((resolve) => {
      if (!file) {
        showToast('请选择备份文件', 'error');
        return resolve(false);
      }

      if (!file.name.endsWith('.backup')) {
        showToast('请选择有效的备份文件', 'error');
        return resolve(false);
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // 解密备份数据
          const decryptedData = await CryptoUtil.decrypt(e.target.result);
          const backupData = JSON.parse(decryptedData);

          // 验证备份数据
          if (!backupData.data || !backupData.timestamp) {
            throw new Error('无效的备份文件格式');
          }

          // 二次确认
          const confirmed = await ConfirmDialog.danger(
            `确定要从备份恢复数据吗？\n备份时间: ${new Date(backupData.timestamp).toLocaleString()}\n此操作将覆盖当前数据！`
          );

          if (!confirmed) {
            showToast('已取消恢复操作');
            return resolve(false);
          }

          // 恢复数据
          const { cart, userInfo, balance, productFavorites, shopFavorites, footprints, orders } = backupData.data;

          if (cart) DataManager.setCart(cart);
          if (userInfo) DataManager.setUserInfo(userInfo);
          if (balance !== undefined) DataManager.setBalance(balance);
          if (productFavorites) DataManager.setProductFavorites(productFavorites);
          if (shopFavorites) DataManager.setShopFavorites(shopFavorites);
          if (footprints) DataManager.setFootprints(footprints);
          if (orders) DataManager.setOrders(orders);

          showToast('数据恢复成功，页面将刷新');
          setTimeout(() => window.location.reload(), 1500);
          resolve(true);
        } catch (error) {
          console.error('数据恢复失败:', error);
          showToast('数据恢复失败: ' + error.message, 'error');
          resolve(false);
        }
      };

      reader.onerror = () => {
        showToast('文件读取失败', 'error');
        resolve(false);
      };

      reader.readAsText(file);
    });
  },

  /**
   * 初始化备份恢复按钮事件
   * @param {string} exportBtnSelector - 导出按钮选择器
   * @param {string} importBtnSelector - 导入按钮选择器
   */
  initBackupButtons(exportBtnSelector, importBtnSelector) {
    // 导出按钮
    const exportBtn = document.querySelector(exportBtnSelector);
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportAllData());
    }

    // 导入按钮和文件输入
    const importBtn = document.querySelector(importBtnSelector);
    if (importBtn) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.backup';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);

      importBtn.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.importFromFile(e.target.files[0]);
        }
      });
    }
  }
};

// 导出到全局
window.BackupUtil = BackupUtil;