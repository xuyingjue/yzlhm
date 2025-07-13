// 从API获取店铺订单数据
let storeOrders = [];
let currentOrderId = null;

class OrderCard {
    constructor(order) {
        this.order = order;
        return this.render();
    }

    render() {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-header">
                <div class="order-number">#${this.order.id}</div>
                <div class="order-time">${new Date(this.order.time).toLocaleString()}</div>
            </div>
            <div class="order-body">
                <div class="order-items">
                    ${this.order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.name}" class="item-image">
                            <div class="item-info">
                                <div class="item-title">${item.name}</div>
                                ${item.spec ? `<div class="item-spec">规格: ${item.spec}</div>` : ''}
                                <div class="item-price">x${item.quantity} ¥${(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <hr class="order-separator">
                <div class="order-summary">
                    <div class="order-total">总计: ¥${this.order.totalPrice.toFixed(2)}</div>
                </div>
                <div class="order-status">
                    <div class="status-text ${this.getStatusCodeClass()}">
                        ${this.getStatusText()}
                    </div>
                </div>
            </div>
        `;
        return card;
    }

    getStatusText() {
        switch(this.order.status) {
            case 'pending': return '待付款';
            case 'shipping': return '待发货';
            case 'completed': return '已完成';
            default: return '未知状态';
        }
    }

    getStatusCodeClass() {
        switch(this.order.status) {
            case 'pending': return 'status-pending';
            case 'shipping': return 'status-shipping';
            case 'completed': return 'status-completed';
            default: return '';
        }
    }
}

class OrdersPage {
    constructor() {
        this.orderContainer = document.getElementById('order-container');
        this.tabs = document.querySelectorAll('.tab');
        this.currentStatus = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderOrders();
        this.observeOrderChanges();
    }

    renderOrders() {
        const orders = orderStore.userOrders || [];
        let filteredOrders = orders;

        if (this.currentStatus !== 'all') {
            filteredOrders = orders.filter(order => order.status === this.currentStatus);
        }

        this.orderContainer.innerHTML = '';

        if (filteredOrders.length === 0) {
            this.orderContainer.innerHTML = '<div class="empty-tip">暂无订单数据</div>';
            return;
        }

        filteredOrders.forEach(order => {
            const orderCard = new OrderCard(order);
            this.orderContainer.appendChild(orderCard);
        });
    }

    bindEvents() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentStatus = tab.dataset.status;
                this.renderOrders();
            });
        });

        // 绑定发货弹窗事件
        document.getElementById('cancel-shipping').addEventListener('click', () => {
            document.getElementById('shipping-modal').style.display = 'none';
            this.clearShippingForm();
        });

        document.getElementById('confirm-shipping').addEventListener('click', () => {
            this.handleShippingSubmit();
        });

        // 点击发货按钮打开弹窗
        this.orderContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('status-btn')) {
                currentOrderId = e.target.dataset.id;
                document.getElementById('shipping-modal').style.display = 'block';
            }
        });
    }

    // 清空发货表单
    clearShippingForm() {
        document.getElementById('shipping-detail').value = '';
        document.getElementById('shipping-note').value = '';
        currentOrderId = null;
    }

    // 处理发货提交
    async handleShippingSubmit() {
        const shippingDetail = document.getElementById('shipping-detail').value;
        const shippingNote = document.getElementById('shipping-note').value;

        if (!shippingDetail) {
            alert('请输入物流信息');
            return;
        }

        // 解析物流信息（假设格式为"物流公司 运单号"）
        const [company, trackingNo] = shippingDetail.split(' ');
        if (!company || !trackingNo) {
            alert('请按照"物流公司 运单号"格式输入物流信息');
            return;
        }

        try {
            // 调用发货API
            const response = await fetch(`/api/store/orders/${currentOrderId}/ship`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    company,
                    trackingNo,
                    note: shippingNote
                })
            });

            if (!response.ok) throw new Error('发货失败');

            // 更新订单状态
            orderStore.updateStatus(currentOrderId, 'completed');
            this.clearShippingForm();
            document.getElementById('shipping-modal').style.display = 'none';
            alert('发货成功');
        } catch (error) {
            alert('发货失败: ' + error.message);
        }

    observeOrderChanges() {
        // 监听订单数据变化
        orderStore.on('change', () => this.renderOrders());
    }
}

// 初始化页面
window.addEventListener('DOMContentLoaded', () => new OrdersPage());
            id: 1,
            orderNumber: 'ORD20230512001',
            createTime: '2023-05-12 14:30:22',
            status: 'pending', // pending: 待付款, shipping: 待发货, completed: 已完成
            buyer: {
                avatar: '../../imgres/user.png',
                name: '张三'
            },
            items: [
                {
                    title: '高级宠物粮食 - 天然无谷配方',
                    image: '../../imgres/1.png',
                    price: 129.00,
                    quantity: 2
                }
            ],
            totalAmount: 258.00,
            countdown: 30 * 60, // 30分钟倒计时(秒)
            buyerMessage: ''
        },
        {
            id: 2,
            orderNumber: 'ORD20230512002',
            createTime: '2023-05-12 15:45:10',
            status: 'shipping',
            buyer: {
                avatar: '../../imgres/user.png',
                name: '李四'
            },
            items: [
                {
                    title: '宠物自动喂食器 - 智能定时',
                    image: '../../imgres/2.png',
                    price: 299.00,
                    quantity: 1
                },
                {
                    title: '猫咪逗猫棒 - 羽毛铃铛玩具',
                    image: '../../imgres/d.jpg',
                    price: 29.90,
                    quantity: 2
                }
            ],
            totalAmount: 358.80,
            countdown: 0,
            buyerMessage: '请尽快发货，谢谢！'
        },
        {
            id: 3,
            orderNumber: 'ORD20230511001',
            createTime: '2023-05-11 09:12:33',
            status: 'completed',
            buyer: {
                avatar: '../../imgres/user.png',
                name: '王五'
            },
            items: [
                {
                    title: '宠物专用旅行背包 - 透气舒适',
                    image: '../../imgres/3.jpg',
                    price: 159.00,
                    quantity: 1
                }
            ],
            totalAmount: 159.00,
            countdown: 0,
            buyerMessage: ''
        },
        {
            id: 4,
            orderNumber: 'ORD20230512003',
            createTime: '2023-05-12 16:20:45',
            status: 'pending',
            buyer: {
                avatar: '../../imgres/user.png',
                name: '赵六'
            },
            items: [
                {
                    title: '宠物指甲剪 - 安全防剪伤',
                    image: '../../imgres/q.png',
                    price: 39.90,
                    quantity: 1
                }
            ],
            totalAmount: 39.90,
            countdown: 15 * 60, // 15分钟倒计时(秒)
            buyerMessage: '请包装好一点'
        }
    ];

    let currentStatus = 'all';
    let countdownIntervals = {};

    // DOM元素
    const orderContainer = document.getElementById('order-container');
    const tabs = document.querySelectorAll('.tab');
    const shippingModal = document.getElementById('shipping-modal');
    const cancelShippingBtn = document.getElementById('cancel-shipping');
    const confirmShippingBtn = document.getElementById('confirm-shipping');
    const shippingDetailInput = document.getElementById('shipping-detail');
    const shippingNoteInput = document.getElementById('shipping-note');

    // 当前操作的订单ID
    let currentOrderId = null;

    // 初始化
    function init() {
        renderOrders();
        bindEvents();
        startCountdowns();
    }

    // 渲染订单列表
    function renderOrders() {
        let filteredOrders = orders;
        if (currentStatus !== 'all') {
            filteredOrders = orders.filter(order => order.status === currentStatus);
        }

        orderContainer.innerHTML = '';

        if (filteredOrders.length === 0) {
            orderContainer.innerHTML = '<div class="empty-tip">暂无订单数据</div>';
            return;
        }

        filteredOrders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.innerHTML = `
                <div class="order-header">
                    <div class="order-number">#${order.orderNumber.substring(3)}</div>
                    <div class="order-time">${order.createTime.split(' ')[1]}</div>
                </div>
                <div class="order-body">
                    <div class="buyer-info">
                    <hr class="order-separator">
                        <span class="buyer-name">👤 ${order.buyer.name}</span>
                        <button class="contact-btn" data-id="${order.id}">联系</button>
                    </div>
                    ${order.buyerMessage ? `<div class="buyer-message">[买家留言]："${order.buyerMessage}"</div>` : ''}
                    <hr class="order-separator">
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <img src="${item.image}" alt="${item.title}" class="item-image">
                                <div class="item-info">
                                    <div class="item-title">${item.title}</div>
                                    <div class="item-price">x${item.quantity} ¥${(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <hr class="order-separator">
                    <div class="order-summary">
                        <div class="order-total">总计: ¥${order.totalAmount.toFixed(2)}</div>
                    </div>
                    <div class="order-status">
                        <div class="status-text ${getStatusCodeClass(order.status)}">
                            ⏳ ${getStatusText(order.status)}${(order.status === 'pending' || order.status === 'shipping') ? `（<span class="countdown-timer" data-id="${order.id}">${formatCountdown(order.countdown)}</span>倒计时）` : ''}
                        </div>
                        ${order.status === 'shipping' ? `<button class="status-btn" data-id="${order.id}">发货按钮</button>` : ''}
                    </div>
                </div>
            `;
            orderContainer.appendChild(orderCard);
        });
    }

    // 获取状态文本
    function getStatusText(status) {
        switch(status) {
            case 'pending': return '待付款';
            case 'shipping': return '待发货';
            case 'completed': return '已完成';
            default: return '未知状态';
        }
    }

    // 获取状态样式类
    function getStatusCodeClass(status) {
        switch(status) {
            case 'pending': return 'status-pending';
            case 'shipping': return 'status-shipping';
            case 'completed': return 'status-completed';
            default: return '';
        }
    }

    // 格式化倒计时
    function formatCountdown(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 开始倒计时
    function startCountdowns() {
        // 清除已有的定时器
        Object.values(countdownIntervals).forEach(interval => clearInterval(interval));
        countdownIntervals = {};

        // 为每个待付款订单启动倒计时
        orders.forEach(order => {
            if (order.status === 'pending' && order.countdown > 0) {
                countdownIntervals[order.id] = setInterval(() => {
                    order.countdown--;
                    if (order.countdown <= 0) {
                        clearInterval(countdownIntervals[order.id]);
                        delete countdownIntervals[order.id];
                        // 这里可以添加订单超时逻辑
                    }
                    // 更新倒计时显示
                    const timerElement = document.querySelector(`.countdown-timer[data-id="${order.id}"]`);
                    if (timerElement) {
                        timerElement.textContent = formatCountdown(order.countdown);
                    }
                }, 1000);
            }
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
                renderOrders();
            });
        });

        // 订单操作
        orderContainer.addEventListener('click', (e) => {
            // 联系买家
            if (e.target.classList.contains('contact-btn')) {
                const orderId = parseInt(e.target.dataset.id);
                const order = orders.find(o => o.id === orderId);
                alert(`联系买家: ${order.buyer.name} (模拟功能)`);
            }

            // 发货按钮
            if (e.target.classList.contains('status-btn')) {
                currentOrderId = parseInt(e.target.dataset.id);
                // 清空表单
                shippingDetailInput.value = '';
                shippingNoteInput.value = '';
                // 显示发货弹窗
                shippingModal.style.display = 'flex';
            }
        });

        // 取消发货
        cancelShippingBtn.addEventListener('click', () => {
            shippingModal.style.display = 'none';
            currentOrderId = null;
        });

        // 确认发货
            confirmShippingBtn.addEventListener('click', () => {
                if (!currentOrderId) return;

                const shippingDetail = shippingDetailInput.value.trim();
                const shippingNote = shippingNoteInput.value.trim();
                if (!shippingDetail) {
                    alert('请输入发货详情');
                    return;
                }

                // 提交发货信息到API
                fetch(`/api/store/orders/${currentOrderId}/ship`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: JSON.stringify({
                        shippingDetail: shippingDetail,
                        shippingNote: shippingNote,
                        status: 'completed'
                    })
                })
                .then(response => {
                    if (!response.ok) throw new Error('发货失败');
                    return response.json();
                })
                .then(data => {
                    // 更新本地订单状态
                    const orderIndex = orders.findIndex(o => o.id === currentOrderId);
                    if (orderIndex !== -1) {
                        orders[orderIndex].status = 'completed';
                        orders[orderIndex].shippingDetail = shippingDetail;
                    }
                    renderOrders();
                    shippingModal.style.display = 'none';
                    currentOrderId = null;
                    showNotification('发货成功');
                })
                .catch(error => {
                    console.error('发货失败:', error);
                    alert('发货失败: ' + error.message);
                });
            });
    }

    // 初始化页面
    window.addEventListener('DOMContentLoaded', init);

    // 清理定时器
    window.addEventListener('beforeunload', () => {
        Object.values(countdownIntervals).forEach(interval => clearInterval(interval));
    });
})();