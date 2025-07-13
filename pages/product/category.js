document.addEventListener('DOMContentLoaded', function() {
    // 预设图标库
    const ICON_LIBRARY = [
        { id: 'icon1', url: '../../imgres/1.png' },
        { id: 'icon2', url: '../../imgres/2.png' },
        { id: 'icon3', url: '../../imgres/3.jpg' },
        { id: 'icon4', url: '../../imgres/d.jpg' },
        { id: 'icon5', url: '../../imgres/q.png' },
        { id: 'icon6', url: '../../imgres/s.png' },
        { id: 'icon7', url: '../../imgres/j.png' },
        { id: 'icon8', url: '../../imgres/z.png' }
    ];

    // 导入Pinia store
    import { useCategoryStore } from '../../store/category.js';
    const categoryStore = useCategoryStore();

    // 从store加载分类数据
    categoryStore.fetchCategories().then(() => {
        renderCategories();
    });

    // 监听分类数据变化自动重新渲染
    categoryStore.$subscribe((mutation, state) => {
        renderCategories();
    });

    // DOM元素
    const categoryList = document.getElementById('category-list');
    const addCategoryForm = document.getElementById('add-category-form');
    const categoryNameInput = document.getElementById('category-name');
    const charCount = document.getElementById('char-count');
    const iconSelector = document.getElementById('icon-selector');
    const editIconSelector = document.getElementById('edit-icon-selector');

    // 渲染图标选择器
    function renderIconSelectors() {
        // 渲染添加分类的图标选择器
        iconSelector.innerHTML = ICON_LIBRARY.map(icon => `
            <div class="icon-option ${selectedIcon === icon.id ? 'selected' : ''}" data-id="${icon.id}">
                <img src="${icon.url}" alt="图标">
            </div>
        `).join('');

        // 渲染编辑分类的图标选择器
        editIconSelector.innerHTML = ICON_LIBRARY.map(icon => `
            <div class="icon-option ${selectedIcon === icon.id ? 'selected' : ''}" data-id="${icon.id}">
                <img src="${icon.url}" alt="图标">
            </div>
        `).join('');

        // 重新绑定图标选择事件
        bindIconSelectionEvents();
    }

    // 绑定图标选择事件
    function bindIconSelectionEvents() {
        const iconOptions = document.querySelectorAll('.icon-option');
        iconOptions.forEach(option => {
            option.addEventListener('click', function() {
                const iconId = this.dataset.id;
                selectedIcon = iconId;
                renderIconSelectors();
            });
        });
    }
    const editModal = document.getElementById('edit-modal');
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const relatedProductsCount = document.getElementById('related-products-count');

    let selectedIcon = '1.png';
    let draggedItem = null;
    let currentEditId = null;
    let currentDeleteId = null;

    // 渲染分类列表
    function renderCategories() {
        categoryList.innerHTML = '';

        if (categoryStore.isLoading) {
            categoryList.innerHTML = '<div class="loading-tip">加载中...</div>';
            return;
        }

        if (categoryStore.error) {
            categoryList.innerHTML = `<div class="error-tip">错误: ${categoryStore.error}</div>`;
            return;
        }

        if (categoryStore.categories.length === 0) {
            categoryList.innerHTML = '<div class="empty-tip">暂无分类数据</div>';
            return;
        }

        categoryStore.categories.forEach(category => {
            const icon = ICON_LIBRARY.find(i => i.id === category.icon) || ICON_LIBRARY[0];
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.draggable = true;
            categoryItem.dataset.id = category.id;

            categoryItem.innerHTML = `
                <div class="category-icon"><img src="${icon.url}" alt="${category.name}"></div>
                <div class="category-info">
                    <h4 class="category-name">${category.name}</h4>
                <p class="related-count">关联商品: ${category.productCount}件</p>
                </div>
                <div class="category-actions">
                    <button class="action-btn edit-btn">编辑</button>
                    <button class="action-btn delete-btn">删除</button>
                </div>
            `;

            // 编辑按钮事件
            categoryItem.querySelector('.edit-btn').addEventListener('click', () => openEditModal(category.id));

            // 删除按钮事件
            categoryItem.querySelector('.delete-btn').addEventListener('click', () => openDeleteModal(category.id));

            // 拖拽事件
            categoryItem.addEventListener('dragstart', handleDragStart);
            categoryItem.addEventListener('dragover', handleDragOver);
            categoryItem.addEventListener('dragenter', handleDragEnter);
            categoryItem.addEventListener('dragleave', handleDragLeave);
            categoryItem.addEventListener('drop', handleDrop);
            categoryItem.addEventListener('dragend', handleDragEnd);

            // 点击分类项进入关联商品页
            categoryItem.addEventListener('click', function(e) {
                // 检查点击目标是否是操作按钮或其后代元素
                if (!e.target.closest('.category-actions')) {
                    window.location.href = 'category-products.html?categoryId=' + category.id;
                }
            });

            categoryList.appendChild(categoryItem);
        });
    }

    // 字符计数更新
    categoryNameInput.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/6`;
        if (length > 6) {
            charCount.style.color = '#ff4444';
            this.value = this.value.substring(0, 6);
            charCount.textContent = '6/6';
        } else {
            charCount.style.color = '#999';
        }
    });

    // 图标选择
    iconOptions.forEach(option => {
        option.addEventListener('click', function() {
            iconOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedIcon = this.dataset.icon;
        });
    });

    // 切换添加分类表单显示状态
    const addButton = document.getElementById('add-category-btn');
    addButton.addEventListener('click', function() {
        addCategoryForm.style.display = addCategoryForm.style.display === 'none' ? 'block' : 'none';
    });

    // 显示通知
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 3秒后隐藏通知
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 提交新分类
    addCategoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const categoryName = categoryNameInput.value.trim();

        if (!categoryName) return;

        const newCategory = {
            name: categoryName,
            icon: selectedIcon
        };

        fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(newCategory)
        })
        .then(response => {
            if (!response.ok) throw new Error('添加分类失败');
            return response.json();
        })
        .then(data => {
            categoryStore.addCategory(data);
            this.reset();
            charCount.textContent = '0/6';
            selectedIcon = ICON_LIBRARY[0].id;
            renderIconSelectors();
            addCategoryForm.style.display = 'none';
            showNotification('分类添加成功');
        })
        .catch(error => {
            console.error('添加分类失败:', error);
            showNotification('添加分类失败: ' + error.message, 'error');
        });
    });

    // 打开编辑模态框
    function openEditModal(id) {
        const category = categories.find(c => c.id === id);
        if (!category) return;

        currentEditId = id;
        document.getElementById('edit-category-name').value = category.name;
        document.getElementById('edit-char-count').textContent = `${category.name.length}/6`;

        selectedIcon = category.icon;
        renderIconSelectors();

        editModal.style.display = 'flex';
    }

    // 保存编辑
    document.getElementById('save-edit').addEventListener('click', function() {
        if (currentEditId === null) return;

        const newName = document.getElementById('edit-category-name').value.trim();
        if (!newName) return;

        fetch(`/api/categories/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({
                name: newName,
                icon: selectedIcon
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('更新分类失败');
            return response.json();
        })
        .then(data => {
            categoryStore.updateCategory(currentEditId, data);
            renderCategories();
            editModal.style.display = 'none';
            currentEditId = null;
            showNotification('分类更新成功');
        })
        .catch(error => {
            console.error('更新分类失败:', error);
            showNotification('更新分类失败: ' + error.message, 'error');
        });
    });

    // 打开删除模态框
    function openDeleteModal(id) {
        const category = categories.find(c => c.id === id);
        if (!category) return;

        currentDeleteId = id;
        relatedProductsCount.textContent = category.productCount;
        deleteModal.style.display = 'flex';
    }

    // 确认删除
    confirmDeleteBtn.addEventListener('click', function() {
        if (currentDeleteId === null) return;

        fetch(`/api/categories/${currentDeleteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('删除分类失败');
            return response.json();
        })
        .then(() => {
            categoryStore.deleteCategory(currentDeleteId);
            renderCategories();
            deleteModal.style.display = 'none';
            currentDeleteId = null;
            showNotification('分类删除成功');
        })
        .catch(error => {
            console.error('删除分类失败:', error);
            showNotification('删除分类失败: ' + error.message, 'error');
        });
    });

    // 取消删除
    cancelDeleteBtn.addEventListener('click', function() {
        deleteModal.style.display = 'none';
        currentDeleteId = null;
    });

    // 关闭模态框
    document.getElementById('cancel-edit').addEventListener('click', function() {
        editModal.style.display = 'none';
        currentEditId = null;
    });

    let initialX = 0;
    let initialY = 0;
    let currentX = 0;
    let currentY = 0;

    // 拖拽排序相关函数

    // 显示通知
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '1000';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.justifyContent = 'center';

        // 设置通知样式
        if (type === 'error') {
            notification.style.backgroundColor = '#ff4444';
        } else if (type === 'success') {
            notification.style.backgroundColor = '#00C851';
            // 添加成功图标和动画
            const checkmark = document.createElement('span');
            checkmark.innerHTML = '✓';
            checkmark.className = 'success-checkmark';
            checkmark.style.marginRight = '8px';
            checkmark.style.fontWeight = 'bold';
            notification.appendChild(checkmark);
        } else {
            notification.style.backgroundColor = '#333';
        }
        notification.style.color = 'white';

        const textNode = document.createTextNode(message);
        notification.appendChild(textNode);

        document.body.appendChild(notification);

        // 触发显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // 3秒后隐藏通知
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 添加第一个分类按钮事件
    document.getElementById('add-first-category')?.addEventListener('click', function() {
        addCategoryForm.style.display = 'block';
        // 滚动到表单位置
        addCategoryForm.scrollIntoView({ behavior: 'smooth' });
    })
    function handleDragStart(e) {
        draggedItem = this;
        initialX = e.clientX;
        initialY = e.clientY;
        currentX = initialX;
        currentY = initialY;
        setTimeout(() => {
            this.classList.add('dragging');
            this.style.opacity = '0.5';
            this.style.transform = 'scale(1.02)';
        }, 0);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        if (this !== draggedItem) {
            this.classList.add('drag-over');
        }
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.stopPropagation();
        if (this !== draggedItem) {
            // 获取当前排序后的ID数组
            const newOrder = Array.from(categoryList.children)
                .map(item => parseInt(item.dataset.id));

            // 更新排序并同步到服务器
        fetch('/api/categories/sort', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({ order: newOrder })
        })
        .then(response => {
            if (!response.ok) throw new Error('更新排序失败');
            return response.json();
        })
        .then(() => {
            categoryStore.sortCategories(newOrder);
        })
        .catch(error => {
            console.error('更新分类排序失败:', error);
            showNotification('排序更新失败: ' + error.message, 'error');
        });
        }
        return false;
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('drag-over');
        });
        showNotification('分类顺序已更新');
    }

    // 初始化页面
    renderCategories();
    iconOptions[0].click(); // 默认选中第一个图标

    // 编辑模态框图标选择
    document.querySelectorAll('.edit-icon-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.edit-icon-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedIcon = this.dataset.icon;
        });
    });

    // 编辑模态框字符计数
    document.getElementById('edit-category-name').addEventListener('input', function() {
        const length = this.value.length;
        document.getElementById('edit-char-count').textContent = `${length}/6`;
        if (length > 6) {
            this.value = this.value.substring(0, 6);
            document.getElementById('edit-char-count').textContent = '6/6';
        }
    });

    // 关闭模态框当点击外部区域
    window.addEventListener('click', function(e) {
        if (e.target === editModal) editModal.style.display = 'none';
        if (e.target === deleteModal) deleteModal.style.display = 'none';
    });

    // 返回按钮
    document.querySelector('.back-btn').addEventListener('click', function() {
        window.location.href = '../dashboard.html';
    });
});