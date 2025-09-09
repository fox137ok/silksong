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

    // 预取管理结构（用于在离开页面时取消）
    this.preloadTimers = new Set();
    this.idleCallbacks = new Set();
    this.preloaded = new Set();

    // 绑定事件
    this.bindEvents();

    // 开始自动播放
    this.startAutoPlay();

    // 设置初始状态
    this.updateSlide(0);

    // 按需加载当前与下一张，避免一次性并发所有大图
    this.ensureSlideBg(0);
    this.preloadNext(0);
  }

  // 仅在需要时为某张幻灯片设置背景图
  ensureSlideBg(index) {
    const slide = this.slides[index];
    if (!slide) return;

    // 第一张有 img（优化 LCP），不必再设背景
    if (slide.querySelector('img.carousel-bg-image')) return;

    const bg = slide.dataset.bg;
    if (!bg) return;
    if (slide.dataset.bgLoaded === '1' || slide.style.backgroundImage) return;

    const img = new Image();
    try { img.decoding = 'async'; } catch (_) {}
    if ('fetchPriority' in img) {
      try { img.fetchPriority = 'low'; } catch (_) {}
    }
    img.onload = () => {
      slide.style.backgroundImage = `url(${bg})`;
      slide.dataset.bgLoaded = '1';
    };
    img.onerror = () => {
      slide.dataset.bgLoaded = '1';
    };

    const run = () => { img.src = bg; };
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(run, { timeout: 1500 });
      this.idleCallbacks.add(id);
    } else {
      const t = setTimeout(run, 300);
      this.preloadTimers.add(t);
    }
  }

  // 低优先级仅预取下一张，避免占满首屏带宽
  preloadNext(currentIndex) {
    if (!this.slides || this.slides.length === 0) return;
    const nextIndex = (currentIndex + 1) % this.slides.length;
    if (this.preloaded.has(nextIndex)) return;

    const slide = this.slides[nextIndex];
    if (!slide) return;

    const bg = slide.dataset.bg;
    if (!bg) return;

    // 已加载过或已有背景时跳过
    if (slide.dataset.bgLoaded === '1' || slide.style.backgroundImage) {
      this.preloaded.add(nextIndex);
      return;
    }

    const img = new Image();
    try { img.decoding = 'async'; } catch (_) {}
    if ('fetchPriority' in img) {
      try { img.fetchPriority = 'low'; } catch (_) {}
    }
    img.onload = () => {
      // 不直接设置背景，等真正切到该页时再设，避免首次渲染开销
      this.preloaded.add(nextIndex);
    };
    img.onerror = () => {
      this.preloaded.add(nextIndex);
    };

    const run = () => { img.src = bg; };
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(run, { timeout: 2000 });
      this.idleCallbacks.add(id);
    } else {
      const t = setTimeout(run, 500);
      this.preloadTimers.add(t);
    }
  }

  cancelPendingPreloads() {
    // 取消所有未决的预取任务
    for (const t of this.preloadTimers) clearTimeout(t);
    this.preloadTimers.clear();
    if (typeof cancelIdleCallback === 'function') {
      for (const id of this.idleCallbacks) cancelIdleCallback(id);
    }
    this.idleCallbacks.clear();
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
        this.cancelPendingPreloads();
      } else if (this.isPlaying) {
        this.startAutoPlay();
      }
    });

    // 页面离开时取消未决预取，避免占用导航时的带宽
    window.addEventListener('pagehide', () => {
      this.cancelPendingPreloads();
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

    // 按需加载当前背景，并低优先级预取下一张
    this.ensureSlideBg(index);
    this.preloadNext(index);
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
    this.cancelPendingPreloads();
    
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
