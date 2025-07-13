import { defineStore } from 'pinia';

// 生成唯一ID
function generateUniqueId(item) {
  return `${item.productId}-${item.spec}`;
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    // 按店铺分组商品
    groupedByShop(state) {
      const groups = {};
      state.items.forEach(item => {
        if (!groups[item.shopId]) {
          groups[item.shopId] = {
            shopId: item.shopId,
            shopName: item.shopName,
            checked: true,
            goodsList: []
          };
        }
        groups[item.shopId].goodsList.push(item);
      });
      return Object.values(groups);
    },
    // 计算选中商品总数
    selectedCount(state) {
      return state.items.filter(item => item.checked).reduce((total, item) => total + item.quantity, 0);
    },
    // 计算选中商品总价
    selectedPrice(state) {
      return state.items.filter(item => item.checked).reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    // 判断是否全选
    isAllChecked(state) {
      return state.items.length > 0 && state.items.every(item => item.checked);
    }
  },
  actions: {
    // 从localStorage加载购物车数据
    loadFromLocalStorage() {
      const savedItems = localStorage.getItem('cartItems');
      if (savedItems) {
        this.items = JSON.parse(savedItems);
      }
    },
    // 添加商品到购物车
    addItem(item) {
      const existItem = this.items.find(i => 
        i.productId === item.productId && i.spec === item.spec
      );
      
      if (existItem) {
        existItem.quantity += item.quantity;
      } else {
        this.items.push({
          ...item,
          id: generateUniqueId(item),
          checked: true
        });
      }
      this.saveToLocalStorage();
    },
    // 从购物车移除商品
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id);
      this.saveToLocalStorage();
    },
    // 更新商品数量
    updateQuantity(id, quantity) {
      const item = this.items.find(i => i.id === id);
      if (item) {
        item.quantity = quantity;
        this.saveToLocalStorage();
      }
    },
    // 切换商品选中状态
    toggleItemCheck(id) {
      const item = this.items.find(i => i.id === id);
      if (item) {
        item.checked = !item.checked;
      }
    },
    // 切换店铺所有商品选中状态
    toggleShopCheck(shopId) {
      const shopItems = this.items.filter(item => item.shopId === shopId);
      const allChecked = shopItems.every(item => item.checked);
      shopItems.forEach(item => item.checked = !allChecked);
    },
    // 切换全选状态
    toggleAllCheck() {
      const allChecked = this.isAllChecked;
      this.items.forEach(item => item.checked = !allChecked);
    }
  },
  persist: {
    name: 'cart',
    storage: localStorage,
  }
});