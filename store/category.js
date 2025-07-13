import { defineStore } from 'pinia';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [
      { id: 1, name: '宠物食品', icon: 'icon1', productCount: 12 },
      { id: 2, name: '宠物玩具', icon: 'icon2', productCount: 8 },
      { id: 3, name: '宠物用品', icon: 'icon3', productCount: 23 }
    ],
    isLoading: false,
    error: null
  }),
  getters: {
    sortedCategories(state) {
      return [...state.categories].sort((a, b) => a.id - b.id);
    },
    categoryCount(state) {
      return state.categories.length;
    }
  },
  actions: {
    // 添加分类
    addCategory(category) {
      this.categories.unshift({
        ...category,
        id: Date.now()
      });
    },
    // 更新分类
    updateCategory(id, updates) {
      const index = this.categories.findIndex(cat => cat.id === id);
      if (index !== -1) {
        this.categories[index] = { ...this.categories[index], ...updates };
      }
    },
    // 删除分类
    deleteCategory(id) {
      this.categories = this.categories.filter(cat => cat.id !== id);
    },
    // 排序分类
    sortCategories(newOrder) {
      // newOrder 是分类ID的有序数组
      this.categories = newOrder.map(id => {
        return this.categories.find(cat => cat.id === id);
      }).filter(Boolean);
    },
    // 模拟从API加载分类
    async fetchCategories() {
      this.isLoading = true;
      try {
        // 实际项目中这里会是API调用
        // const response = await api.get('/categories');
        // this.categories = response.data;
        this.error = null;
      } catch (err) {
        this.error = err.message || 'Failed to fetch categories';
        console.error(this.error);
      } finally {
        this.isLoading = false;
      }
    }
  }
});