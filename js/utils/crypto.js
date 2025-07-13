/**
 * 加密工具模块 - 处理敏感数据加密
 * 使用AES-GCM算法进行数据加密
 */
const CryptoUtil = {
  /**
   * 生成加密密钥
   * @returns {Promise<CryptoKey>}
   */
  async generateKey() {
    try {
      // 尝试从本地存储获取密钥
      const storedKey = localStorage.getItem('encryptionKey');
      if (storedKey) {
        const keyData = Uint8Array.from(atob(storedKey), c => c.charCodeAt(0));
        return await window.crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'AES-GCM' },
          true,
          ['encrypt', 'decrypt']
        );
      }

      // 生成新密钥并存储
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      const keyData = await window.crypto.subtle.exportKey('raw', key);
      localStorage.setItem('encryptionKey', btoa(String.fromCharCode(...new Uint8Array(keyData))));
      return key;
    } catch (error) {
      console.error('密钥生成/获取失败:', error);
      throw new Error('加密初始化失败');
    }
  },

  /**
   * 加密数据
   * @param {string} data - 要加密的数据
   * @returns {Promise<string>} - 加密后的字符串 (iv:encryptedData)
   */
  async encrypt(data) {
    try {
      const key = await this.generateKey();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv, tagLength: 128 },
        key,
        encoder.encode(data)
      );

      // 组合IV和加密数据
      const encryptedData = new Uint8Array(encrypted);
      const combined = new Uint8Array(iv.length + encryptedData.length);
      combined.set(iv, 0);
      combined.set(encryptedData, iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('数据加密失败:', error);
      throw new Error('数据加密失败');
    }
  },

  /**
   * 解密数据
   * @param {string} encryptedData - 加密的数据字符串 (iv:encryptedData)
   * @returns {Promise<string>} - 解密后的原始数据
   */
  async decrypt(encryptedData) {
    try {
      const key = await this.generateKey();
      const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv, tagLength: 128 },
        key,
        data
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('数据解密失败:', error);
      throw new Error('数据解密失败');
    }
  },

  /**
   * 加密存储支付信息
   * @param {Object} paymentInfo - 支付信息对象
   * @returns {Promise<string>} - 加密后的存储ID
   */
  async storePaymentInfo(paymentInfo) {
    const id = 'payment_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const encryptedData = await this.encrypt(JSON.stringify(paymentInfo));
    localStorage.setItem(id, encryptedData);
    return id;
  },

  /**
   * 获取解密的支付信息
   * @param {string} id - 存储ID
   * @returns {Promise<Object>} - 解密后的支付信息
   */
  async getPaymentInfo(id) {
    const encryptedData = localStorage.getItem(id);
    if (!encryptedData) return null;
    const decryptedData = await this.decrypt(encryptedData);
    return JSON.parse(decryptedData);
  },

  /**
   * 安全删除支付信息
   * @param {string} id - 存储ID
   */
  deletePaymentInfo(id) {
    if (id && id.startsWith('payment_')) {
      localStorage.removeItem(id);
    }
  },

  /**
   * 生成数据哈希值
   * @param {string} data - 要哈希的数据
   * @returns {Promise<string>} - 十六进制哈希字符串
   */
  async generateHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
};

// 导出到全局
window.CryptoUtil = CryptoUtil;