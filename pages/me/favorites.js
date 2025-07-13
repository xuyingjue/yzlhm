document.addEventListener('DOMContentLoaded', function() {
    // 标签页切换功能
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const productFavoritesList = document.getElementById('productFavorites');
    const shopFavoritesList = document.getElementById('shopFavorites');
    const productEmptyState = document.getElementById('productEmptyState');
    const shopEmptyState = document.getElementById('shopEmptyState');

    // 初始化标签页
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            // 更新按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 更新内容区域
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 获取认证Token
    function getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }

    // 从API加载收藏数据
    function loadFavorites() {
        // 加载商品收藏
        fetch('/api/user/favorites/products', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => response.json())
        .then(data => {
            renderFavorites(data, productFavoritesList, productEmptyState, 'product');
        })
        .catch(error => {
            console.error('加载商品收藏失败:', error);
            showError('加载收藏失败，请重试');
        });

        // 加载店铺收藏
        fetch('/api/user/favorites/shops', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => response.json())
        .then(data => {
            renderFavorites(data, shopFavoritesList, shopEmptyState, 'shop');
        })
        .catch(error => {
            console.error('加载店铺收藏失败:', error);
            showError('加载收藏失败，请重试');
        });
    }

    // 渲染收藏列表
    function renderFavorites(favorites, listElement, emptyElement, type) {
        if (favorites.length === 0) {
            listElement.style.display = 'none';
            emptyElement.style.display = 'block';
            return;
        }

        listElement.style.display = 'grid';
        emptyElement.style.display = 'none';
        listElement.innerHTML = '';

        favorites.forEach(item => {
            const card = document.createElement('div');
            card.className = 'favorite-card list-item-fade-in';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="favorite-img">
                <div class="favorite-info">
                    <div class="favorite-name">${item.name}</div>
                    <div class="favorite-meta">${type === 'product' ? '¥' + item.price : item.rating + '分'}</div>
                </div>
                <button class="remove-btn" data-id="${item.id}">&times;</button>
            `;
            listElement.appendChild(card);
        });

        // 绑定取消收藏事件
        bindRemoveEvents(type);
    }

    // 绑定取消收藏按钮事件
    function bindRemoveEvents(type) {
        const removeBtns = document.querySelectorAll(`.favorite-card .remove-btn`);
        removeBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const itemId = this.getAttribute('data-id');
                removeFavorite(type, itemId, e);
            });
        });
    }

    // 显示错误提示
    function showError(message) {
        const errorFeedback = document.querySelector('.error-feedback');
        errorFeedback.textContent = message;
        errorFeedback.style.display = 'flex';
        setTimeout(() => {
            errorFeedback.style.display = 'none';
        }, 3000);
    }

    // 显示成功提示
    function showSuccess(message) {
        const successFeedback = document.querySelector('.success-feedback');
        successFeedback.textContent = message;
        successFeedback.style.display = 'flex';
        setTimeout(() => {
            successFeedback.style.display = 'none';
        }, 2000);
    }

    // 取消收藏
    function removeFavorite(type, itemId, e) {
        e.stopPropagation();
        const card = e.currentTarget.closest('.favorite-card');
        card.classList.add('slide-out');

        fetch(`/api/user/favorites/${type}/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('取消收藏失败');
            return response.json();
        })
        .then(data => {
            setTimeout(() => {
                // 重新加载收藏列表
                loadFavorites();
                showSuccess('取消收藏成功');
            }, 300);
        })
        .catch(error => {
            console.error('取消收藏失败:', error);
            showError('取消收藏失败，请重试');
            card.classList.remove('slide-out');
        });
    }
        const storageKey = type === 'product' ? 'productFavorites' : 'shopFavorites';
        let favorites = JSON.parse(localStorage.getItem(storageKey)) || [];

        favorites = favorites.filter(item => item.id !== itemId);
        localStorage.setItem(storageKey, JSON.stringify(favorites));

        // 重新加载收藏列表
        loadFavorites();
    }

    // 初始化页面
    loadFavorites();

    // 监听收藏数据变化
    DataManager.on('productFavoritesChange', loadFavorites);
    DataManager.on('shopFavoritesChange', loadFavorites);
});