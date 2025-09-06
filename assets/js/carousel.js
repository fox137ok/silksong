// Silksong Hub - 轮播图功能
class HeroCarousel {
  constructor() {
    this.currentSlide = 0;
    this.slides = [];
    this.indicators = [];
    this.autoPlayInterval = null;
    this.autoPlayDelay = 6000; // 6秒自动切换
    this.isPlaying = true;
    
    this.init();
  }

  init() {
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupCarousel();
      });
    } else {
      this.setupCarousel();
    }
  }

  setupCarousel() {
    // 获取轮播相关元素
    this.carousel = document.querySelector('.hero-carousel');
    this.slidesContainer = document.querySelector('.carousel-slides');
    this.slides = document.querySelectorAll('.carousel-slide');
    this.indicators = document.querySelectorAll('.indicator');
    this.prevBtn = document.querySelector('.carousel-prev');
    this.nextBtn = document.querySelector('.carousel-next');

    if (!this.carousel || this.slides.length === 0) {
      console.warn('轮播图元素未找到或没有幻灯片');
      return;
    }

    // 预加载背景图片
    this.preloadImages();

    // 绑定事件
    this.bindEvents();

    // 开始自动播放
    this.startAutoPlay();

    // 设置初始状态
    this.updateSlide(0);
  }

  preloadImages() {
    // 预加载所有轮播图片以提升性能
    this.slides.forEach((slide, index) => {
      const bgImage = slide.dataset.bg;
      if (bgImage) {
        const img = new Image();
        img.onload = () => {
          slide.style.backgroundImage = `url(${bgImage})`;
        };
        img.src = bgImage;
      }
    });
  }

  bindEvents() {
    // 前一张按钮
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.previousSlide();
        this.resetAutoPlay();
      });
    }

    // 下一张按钮
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.nextSlide();
        this.resetAutoPlay();
      });
    }

    // 指示器点击
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
        this.resetAutoPlay();
      });
    });

    // 键盘控制
    document.addEventListener('keydown', (e) => {
      if (!this.isCarouselVisible()) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.previousSlide();
          this.resetAutoPlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextSlide();
          this.resetAutoPlay();
          break;
        case ' ': // 空格键暂停/恢复
          e.preventDefault();
          this.toggleAutoPlay();
          break;
      }
    });

    // 鼠标悬停控制
    if (this.carousel) {
      this.carousel.addEventListener('mouseenter', () => {
        this.pauseAutoPlay();
      });

      this.carousel.addEventListener('mouseleave', () => {
        if (this.isPlaying) {
          this.startAutoPlay();
        }
      });
    }

    // 触摸滑动支持（移动端）
    this.setupTouchEvents();

    // 页面可见性变化时的处理
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoPlay();
      } else if (this.isPlaying) {
        this.startAutoPlay();
      }
    });

    // 窗口尺寸变化时重新计算
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.updateSlide(this.currentSlide);
      }, 250);
    });
  }

  setupTouchEvents() {
    if (!this.carousel) return;

    let startX = 0;
    let startY = 0;
    let moveX = 0;
    let moveY = 0;
    let startTime = 0;

    this.carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    }, { passive: true });

    this.carousel.addEventListener('touchmove', (e) => {
      moveX = e.touches[0].clientX;
      moveY = e.touches[0].clientY;
    }, { passive: true });

    this.carousel.addEventListener('touchend', (e) => {
      const deltaX = moveX - startX;
      const deltaY = moveY - startY;
      const deltaTime = Date.now() - startTime;

      // 检查是否为有效的滑动手势
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 300) {
        if (deltaX > 0) {
          // 向右滑动 - 上一张
          this.previousSlide();
        } else {
          // 向左滑动 - 下一张
          this.nextSlide();
        }
        this.resetAutoPlay();
      }
    }, { passive: true });
  }

  updateSlide(index) {
    // 移除所有活跃状态
    this.slides.forEach(slide => slide.classList.remove('active'));
    this.indicators.forEach(indicator => indicator.classList.remove('active'));

    // 设置当前幻灯片和指示器为活跃状态
    if (this.slides[index]) {
      this.slides[index].classList.add('active');
    }
    
    if (this.indicators[index]) {
      this.indicators[index].classList.add('active');
    }

    this.currentSlide = index;

    // 更新ARIA属性
    this.updateAccessibility();

    // 触发自定义事件
    const slideChangeEvent = new CustomEvent('slideChanged', {
      detail: {
        currentSlide: this.currentSlide,
        totalSlides: this.slides.length
      }
    });
    document.dispatchEvent(slideChangeEvent);
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.updateSlide(nextIndex);
  }

  previousSlide() {
    const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.updateSlide(prevIndex);
  }

  goToSlide(index) {
    if (index >= 0 && index < this.slides.length) {
      this.updateSlide(index);
    }
  }

  startAutoPlay() {
    this.clearAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  pauseAutoPlay() {
    this.clearAutoPlay();
  }

  clearAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  resetAutoPlay() {
    if (this.isPlaying) {
      this.startAutoPlay();
    }
  }

  toggleAutoPlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startAutoPlay();
    } else {
      this.pauseAutoPlay();
    }
  }

  isCarouselVisible() {
    // 检查轮播图是否在视口中可见
    if (!this.carousel) return false;
    
    const rect = this.carousel.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  updateAccessibility() {
    // 更新无障碍访问属性
    this.slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', index !== this.currentSlide);
    });

    this.indicators.forEach((indicator, index) => {
      indicator.setAttribute('aria-pressed', index === this.currentSlide);
      const slideTitle = this.slides[index]?.querySelector('.slide-title')?.textContent || 
                        this.slides[index]?.querySelector('.slide-tagline')?.textContent || 
                        `幻灯片 ${index + 1}`;
      indicator.setAttribute('aria-label', `转到${slideTitle}`);
    });

    // 更新按钮状态
    if (this.prevBtn) {
      this.prevBtn.setAttribute('aria-label', '上一张幻灯片');
    }
    
    if (this.nextBtn) {
      this.nextBtn.setAttribute('aria-label', '下一张幻灯片');
    }
  }

  // 获取当前幻灯片信息
  getCurrentSlideInfo() {
    return {
      current: this.currentSlide,
      total: this.slides.length,
      isPlaying: this.isPlaying
    };
  }

  // 销毁轮播（清理资源）
  destroy() {
    this.clearAutoPlay();
    
    // 移除事件监听器
    if (this.prevBtn) this.prevBtn.removeEventListener('click', this.previousSlide);
    if (this.nextBtn) this.nextBtn.removeEventListener('click', this.nextSlide);
    
    this.indicators.forEach((indicator, index) => {
      indicator.removeEventListener('click', () => this.goToSlide(index));
    });
  }
}

// 创建全局轮播实例
window.heroCarousel = new HeroCarousel();

// 监听语言切换事件，更新轮播内容
document.addEventListener('languageChanged', (e) => {
  // 轮播内容会通过语言管理器自动更新
  // 这里可以添加额外的轮播相关语言更新逻辑
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeroCarousel;
}