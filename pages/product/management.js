(function() {
    // 从API获取商品数据
    let products = [];
    let selectedProductIds = new Set();

    // 初始化时获取商品列表
    fetch('/api/store/products', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        products = data;
        renderProducts();
    })
    .catch(error => {
        console.error('获取商品列表失败:', error);
        showNotification('获取商品失败', 'error');
    });

    // 商品数据
        {
            id: 1,
            title: "高级宠物粮食 - 天然无谷配方",
            image: "../../imgres/1.png",
            price: 129.00,
            stock: 45,
            status: "selling"
        },
        {
            id: 2,
            title: "宠物自动喂食器 - 智能定时",
            image: "../../imgres/2.png",
            price: 299.00,
            stock: 18,
            status: "selling"
        },
        {
            id: 3,
            title: "宠物专用旅行背包 - 透气舒适",
            image: "../../imgres/3.jpg",
            price: 159.00,
            stock: 0,
            status: "offline"
        },
        {
            id: 4,
            title: "猫咪逗猫棒 - 羽毛铃铛玩具",
            image: "../../imgres/d.jpg",
            price: 29.90,
            stock: 120,
            status: "selling"
        },
        {
            id: 5,
            title: "宠物指甲剪 - 安全防剪伤",
            image: "../../imgres/q.png",
            price: 39.90,
            stock: 36,
            status: "offline"
        }
    ];

    let currentStatus = "selling";
    let selectedProducts = new Set();

    // DOM元素
    const productContainer = document.getElementById('product-container');
    const tabs = document.querySelectorAll('.tab');
    const selectAllCheckbox = document.getElementById('select-all');
    const batchPutOnBtn = document.getElementById('batch-put-on');
    const batchPutOffBtn = document.getElementById('batch-put-off');
    const confirmModal = document.getElementById('confirm-modal');
    const cancelOfflineBtn = document.getElementById('cancel-offline');
    const confirmOfflineBtn = document.getElementById('confirm-offline');

    // 当前操作的商品ID
    let currentProductId = null;

    // 初始化
    function init() {
        renderProducts();
        bindEvents();
    }

    // 渲染商品列表
    function renderProducts() {
        const filteredProducts = products.filter(product => product.status === currentStatus);
        productContainer.innerHTML = '';

        if (filteredProducts.length === 0) {
            productContainer.innerHTML = '<div class="empty-tip">暂无商品数据</div>';
            return;
        }

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <label class="checkbox-label">
                    <input type="checkbox" class="product-checkbox" data-id="${product.id}">
                    <span class="checkbox-custom"></span>
                </label>
                <img src="${product.image}" alt="${product.title}" class="product-image">
                <div class="product-info">
                    <div class="product-title">${product.title}</div>
                    <div class="product-price">¥${product.price.toFixed(2)}</div>
                    <div class="product-stock">库存: ${product.stock}件</div>
                </div>
                <div class="product-actions">
                    <button class="action-btn status-btn ${product.status === 'selling' ? 'online' : ''}" data-id="${product.id}">
                        ${product.status === 'selling' ? '下架' : '上架'}
                    </button>
                    <button class="action-btn edit-btn" data-id="${product.id}">
                        <i class="icon-pencil">✏️</i> 编辑
                    </button>
                </div>
            `;
            productContainer.appendChild(productCard);
        });

        // 更新选中状态
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            checkbox.checked = selectedProducts.has(parseInt(checkbox.dataset.id));
        });
    }

    // 绑定事件
    function bindEvents() {
        // 标签切换
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentStatus = tab.dataset.status;
                renderProducts();
            });
        });

        // 全选
        selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const filteredProducts = products.filter(product => product.status === currentStatus);

            if (isChecked) {
                filteredProducts.forEach(product => selectedProducts.add(product.id));
            } else {
                filteredProducts.forEach(product => selectedProducts.delete(product.id));
            }
            renderProducts();
        });

        // 商品选择
        productContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('product-checkbox')) {
                const productId = parseInt(e.target.dataset.id);
                if (e.target.checked) {
                    selectedProducts.add(productId);
                } else {
                    selectedProducts.delete(productId);
                    selectAllCheckbox.checked = false;
                }
            }
        });

        // 单个商品状态切换
        productContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('status-btn') || e.target.parentElement.classList.contains('status-btn')) {
                const btn = e.target.classList.contains('status-btn') ? e.target : e.target.parentElement;
                const productId = parseInt(btn.dataset.id);
                const product = products.find(p => p.id === productId);

                if (product.status === 'selling') {
                    // 下架操作-显示确认弹窗
                    currentProductId = productId;
                    confirmModal.style.display = 'flex';
                } else {
                    // 上架操作
                    product.status = 'selling';
                    renderProducts();
                }
            }

            // 编辑商品
            if (e.target.classList.contains('edit-btn') || e.target.parentElement.classList.contains('edit-btn')) {
                const btn = e.target.classList.contains('edit-btn') ? e.target : e.target.parentElement;
                const productId = parseInt(btn.dataset.id);
                // 跳转到发布页面并传递商品ID
                window.location.href = `publish.html?id=${productId}`;
            }
        });

        // 取消下架
        cancelOfflineBtn.addEventListener('click', () => {
            confirmModal.style.display = 'none';
            currentProductId = null;
        });

        // 确认下架
        confirmOfflineBtn.addEventListener('click', () => {
            if (currentProductId) {
                const product = products.find(p => p.id === currentProductId);
                if (product) {
                    product.status = 'offline';
                    renderProducts();
                }
                confirmModal.style.display = 'none';
                currentProductId = null;
            }
        });

        // 批量上架
        batchPutOnBtn.addEventListener('click', () => {
            if (selectedProducts.size === 0) {
                alert('请选择要上架的商品');
                return;
            }

            products.forEach(product => {
                if (selectedProducts.has(product.id)) {
                    product.status = 'selling';
                }
            });

            selectedProducts.clear();
            selectAllCheckbox.checked = false;
            renderProducts();
        });

        // 批量下架
        batchPutOffBtn.addEventListener('click', () => {
            if (selectedProducts.size === 0) {
                alert('请选择要下架的商品');
                return;
            }

            products.forEach(product => {
                if (selectedProducts.has(product.id)) {
                    product.status = 'offline';
                }
            });

            selectedProducts.clear();
            selectAllCheckbox.checked = false;
            renderProducts();
        });
    }

    // 初始化页面
    window.addEventListener('DOMContentLoaded', init);
})();