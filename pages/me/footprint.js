document.addEventListener('DOMContentLoaded', function() {
    const footprintContainer = document.getElementById('footprintContainer');
    const todayProducts = document.getElementById('todayProducts');
    const yesterdayProducts = document.getElementById('yesterdayProducts');
    const allEmptyState = document.getElementById('allEmptyState');
    const clearBtn = document.getElementById('clearFootprint');

    // 初始化页面
    initFootprintPage();

    // 初始化足迹页面
    function initFootprintPage() {
        loadFootprintData();
        bindEvents();
    }

    // 获取认证Token
function getAuthToken() {
    return localStorage.getItem('authToken') || '';
}

// 显示提示信息
function showFeedback(type, message) {
    const feedback = document.querySelector(`.${type}-feedback`);
    feedback.textContent = message;
    feedback.style.display = 'flex';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 3000);
}

// 从API加载足迹数据
function loadFootprintData() {
    fetch('/api/user/footprints', {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('加载足迹失败');
        return response.json();
    })
    .then(data => {
        const { today, yesterday } = groupFootprintByDate(data);
        renderFootprintGroup(today, todayProducts);
        renderFootprintGroup(yesterday, yesterdayProducts);
        checkEmptyState(today.length, yesterday.length);
    })
    .catch(error => {
        console.error('加载浏览足迹失败:', error);
        showFeedback('error', '加载足迹失败，请重试');
    });
}

    // 按日期分组足迹数据
    function groupFootprintByDate(records) {
        const today = [];
        const yesterday = [];
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

        records.forEach(record => {
            const recordTime = new Date(record.timestamp).getTime();
            if (recordTime >= todayStart) {
                today.push(record);
            } else if (recordTime >= yesterdayStart) {
                yesterday.push(record);
            }
        });

        // 按浏览时间倒序排列
        return {
            today: today.sort((a, b) => b.timestamp - a.timestamp),
            yesterday: yesterday.sort((a, b) => b.timestamp - a.timestamp)
        };
    }

    // 渲染足迹分组
    function renderFootprintGroup(records, container) {
        container.innerHTML = '';
        records.forEach(record => {
            const card = createProductCard(record);
            container.appendChild(card);
        });
    }

    // 创建商品卡片
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card list-item-fade-in';
            card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='/imgres/default.png'">
            <div class="product-info">
                <div class="product-name">${escapeHtml(product.name)}</div>
                <div class="product-price">¥${product.price}</div>
            </div>
        `;
        return card;
    }

    // 检查空状态
    function checkEmptyState(todayCount, yesterdayCount) {
        if (todayCount === 0 && yesterdayCount === 0) {
            footprintContainer.style.display = 'none';
            allEmptyState.style.display = 'block';
        } else {
            footprintContainer.style.display = 'block';
            allEmptyState.style.display = 'none';
        }
    }

    // 绑定事件
    function bindEvents() {
        clearBtn.addEventListener('click', handleClearFootprint);
    }

    // 清空足迹处理
    function handleClearFootprint() {
        if (confirm('确定要清空所有浏览足迹吗？此操作不可恢复。')) {
            fetch('/api/user/footprints', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            })
            .then(response => {
                if (!response.ok) throw new Error('清空足迹失败');
                return response.json();
            })
            .then(data => {
                todayProducts.innerHTML = '';
                yesterdayProducts.innerHTML = '';
                checkEmptyState(0, 0);
                showFeedback('success', '浏览足迹已清空');
            })
            .catch(error => {
                console.error('清空浏览足迹失败:', error);
                showFeedback('error', '清空足迹失败，请重试');
            });
        }
    }

    // HTML转义函数
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});