// 页面路由逻辑 - 带淡入淡出动画
function navigateTo(url) {
    // 添加离开动画
    document.body.classList.add('page-fade-enter');
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// 页面加载完成后添加进入动画
window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-fade-enter-active');
    // 动画结束后移除类
    setTimeout(() => {
        document.body.classList.remove('page-fade-enter', 'page-fade-enter-active');
    }, 300);
});

// 重写所有导航链接的点击事件
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href]').forEach(link => {
        // 过滤外部链接和锚点链接
        if (!link.href.startsWith(window.location.origin) || link.href.includes('#')) return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.href);
        });
    });
});