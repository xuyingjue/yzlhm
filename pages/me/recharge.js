document.addEventListener('DOMContentLoaded', function() {
    // 金额选择逻辑
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('customAmount');
    const confirmBtn = document.getElementById('confirmRecharge');
    let selectedAmount = null;

    // 固定金额选择
    amountBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除其他按钮的选中状态
            amountBtns.forEach(b => b.classList.remove('selected'));
            // 添加当前按钮的选中状态
            this.classList.add('selected');
            // 清空自定义金额
            customAmountInput.value = '';
            // 设置选中金额
            selectedAmount = parseFloat(this.dataset.amount);
            // 启用确认按钮
            confirmBtn.disabled = false;
        });
    });

    // 自定义金额输入
    customAmountInput.addEventListener('input', function() {
        const amount = parseFloat(this.value);
        // 验证金额是否有效
        if (amount && amount > 0) {
            // 移除固定金额的选中状态
            amountBtns.forEach(b => b.classList.remove('selected'));
            // 设置选中金额
            selectedAmount = amount;
            // 启用确认按钮
            confirmBtn.disabled = false;
        } else {
            // 禁用确认按钮
            confirmBtn.disabled = true;
        }
    });

    // 确认充值按钮点击事件
    confirmBtn.addEventListener('click', function() {
        if (!selectedAmount || selectedAmount <= 0) {
            alert('请选择有效的充值金额');
            return;
        }

        // 显示二维码弹窗
        const qrcodeModal = document.getElementById('qrcodeModal');
        const paymentAmount = document.getElementById('paymentAmount');
        const qrcodeImage = document.getElementById('qrcodeImage');
        const closeBtn = qrcodeModal.querySelector('.close-btn');

        // 设置支付金额
        paymentAmount.textContent = selectedAmount.toFixed(2);

        // 生成支付二维码
        new QRCode(qrcodeImage, {
            text: `https://pay.example.com/recharge?amount=${selectedAmount}&userId=${getUserId()}`,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        // 显示弹窗
        qrcodeModal.style.display = 'flex';

        // 关闭弹窗事件
        closeBtn.addEventListener('click', function() {
            qrcodeModal.style.display = 'none';
            // 清空二维码
            qrcodeImage.innerHTML = '';
        });

        // 点击弹窗外部关闭
        window.addEventListener('click', function(event) {
            if (event.target === qrcodeModal) {
                qrcodeModal.style.display = 'none';
                // 清空二维码
                qrcodeImage.innerHTML = '';
            }
        });

        // 模拟支付轮询检查
        const checkPaymentInterval = setInterval(() => {
            // 模拟支付成功后更新
            saveRechargeRecord(selectedAmount);
            updateUserBalance(selectedAmount);
            clearInterval(checkPaymentInterval);
            qrcodeModal.style.display = 'none';
            alert('充值成功');
            window.location.href = '/pages/me/me.html';
        }, 5000);
    });

    // 加载充值记录
    loadRechargeHistory();

    // 保存充值记录到localStorage
    function saveRechargeRecord(amount) {
        const records = JSON.parse(localStorage.getItem('rechargeRecords') || '[]');
        const newRecord = {
            amount: amount,
            date: new Date().toLocaleString()
        };
        records.unshift(newRecord); // 添加到数组开头
        localStorage.setItem('rechargeRecords', JSON.stringify(records));
    }

    // 加载充值记录并显示
    function loadRechargeHistory() {
        const records = JSON.parse(localStorage.getItem('rechargeRecords') || '[]');
        const historyList = document.getElementById('historyList');

        // 如果没有记录，显示默认提示
        if (records.length === 0) {
            historyList.innerHTML = '<div class="history-empty">暂无充值记录</div>';
            return;
        }

        // 生成记录列表HTML
        let historyHTML = '';
        records.forEach(record => {
            historyHTML += `
                <div class="history-item">
                    <div class="history-date">${record.date}</div>
                    <div class="history-amount">+¥${record.amount.toFixed(2)}</div>
                </div>
            `;
        });

        historyList.innerHTML = historyHTML;
    }

    // 更新用户余额
    function updateUserBalance(amount) {
        const currentBalance = parseFloat(localStorage.getItem('userBalance') || '0');
        const newBalance = currentBalance + amount;
        localStorage.setItem('userBalance', newBalance.toFixed(2));
    }
});