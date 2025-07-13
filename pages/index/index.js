// 暴露页面数据给前端渲染
window.pageData = {
  // 轮播图数据
  banners: [
    { image: '/imgres/1.png' },
    { image: '/imgres/2.png' },
    { image: '/imgres/3.jpg' }
  ],
  // 商品分类数据
  categories: [
    { id: 1, name: '主题', icon: '/imgres/z.png' },
    { id: 2, name: '键盘', icon: '/imgres/j.png' },
    { id: 3, name: '美化包', icon: '/imgres/m.png' },
    { id: 4, name: '定制v', icon: '/imgres/d.png' },
    { id: 5, name: '水印', icon: '/imgres/s.png' },
    { id: 6, name: '其他', icon: '/imgres/q.png' }
  ],
  // 推荐店铺数据
  recommendedShops: [
    {
      id: 1,
      name: '泉漾',
      image: '/imgres/qy.jpg',
      rating: 4.8,
      monthSales: 128
    },
    {
      id: 2,
      name: '小依美化铺',
      image: '/imgres/yi.png'
      rating: 4.6,
      monthSales: 96
    },
    {
      id: 3,
      name: '待入驻',
      image: '/imgres/d.jpg',
      rating: 4.7,
      monthSales: 156
    }
  ]
};

// 轮播图功能实现
function initCarousel() {
  const carousel = document.querySelector('.carousel-container');
  const wrapper = carousel.querySelector('.carousel-wrapper');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = carousel.querySelector('.prev-arrow');
  const nextBtn = carousel.querySelector('.next-arrow');
  const indicatorsContainer = carousel.querySelector('.carousel-indicators');
  let currentIndex = 0;
  let intervalId;

  // 创建指示器
  slides.forEach((_, index) => {
    const indicator = document.createElement('div');
    indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
    indicator.addEventListener('click', () => goToSlide(index));
    indicatorsContainer.appendChild(indicator);
  });
  const indicators = indicatorsContainer.querySelectorAll('.indicator');

  // 自动播放
  function startAutoPlay() {
    intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlide();
    }, 5000); // 5秒自动切换
  }

  // 停止自动播放
  function stopAutoPlay() {
    clearInterval(intervalId);
  }

  // 切换到指定幻灯片
  function goToSlide(index) {
    currentIndex = index;
    updateSlide();
  }

  // 更新幻灯片显示和指示器状态
  function updateSlide() {
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentIndex);
    });
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentIndex);
    });
  }

  // 上一张
  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlide();
    resetAutoPlay();
  });

  // 下一张
  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlide();
    resetAutoPlay();
  });

  // 重置自动播放计时器
  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // 鼠标悬停时停止自动播放
  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);

  // 初始化自动播放
  startAutoPlay();
}

// 动态渲染分类网格
function renderCategories() {
  const categoryContainer = document.querySelector('.category-grid');
  if (!categoryContainer) return;

  window.pageData.categories.forEach(category => {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.innerHTML = `
      <div class="category-icon">
        <img src="${category.icon}" alt="${category.name}">
      </div>
      <div class="category-name">${category.name}</div>
    `;
    categoryContainer.appendChild(categoryItem);
  });
}

// 动态渲染推荐店铺
function renderShops() {
  const shopContainer = document.querySelector('.shop-scroll');
  if (!shopContainer) return;

  window.pageData.recommendedShops.forEach(shop => {
    const shopCard = document.createElement('div');
    shopCard.className = 'shop-card';
    shopCard.innerHTML = `
      <div class="shop-image">
        <img src="${shop.image}" alt="${shop.name}">
      </div>
      <div class="shop-info">
        <h3 class="shop-name">${shop.name}</h3>
        <div class="shop-rating">
          <span class="star">★</span> ${shop.rating}
        </div>
      </div>
    `;
    shopContainer.appendChild(shopCard);

    // 添加店铺卡片点击事件
    shopCard.addEventListener('click', () => {
      window.location.href = `/pages/shop/shop.html?shopId=${shop.id}`;
    });
  });
}

// 页面初始化函数
function initPage() {
  initCarousel();
  renderCategories();
  renderShops();
}

// 页面加载完成后执行初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}