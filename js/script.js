// 轮播图功能
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let currentIndex = 0;
    const slideCount = slides.length;

    // 显示当前幻灯片
    function showSlide(index) {
        // 隐藏所有幻灯片
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        // 移除所有指示器的活跃状态
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        // 显示当前幻灯片和指示器
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentIndex = index;
    }

    // 下一张幻灯片
    function nextSlide() {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= slideCount) {
            nextIndex = 0;
        }
        showSlide(nextIndex);
    }

    // 上一张幻灯片
    function prevSlide() {
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = slideCount - 1;
        }
        showSlide(prevIndex);
    }

    // 点击指示器切换幻灯片
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
        });
    });

    // 点击按钮切换幻灯片
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    // 自动轮播
    setInterval(nextSlide, 5000);
}

// 回到顶部功能
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) return;

    // 滚动事件监听
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    // 点击回到顶部
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initBackToTop();
});