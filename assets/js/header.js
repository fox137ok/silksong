// Silksong Hub - Header/Footer 组件管理
class SilksongHeader {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('news')) return 'news';
    if (path.includes('prices')) return 'prices';
    if (path.includes('map')) return 'map';
    if (path.includes('media')) return 'media';
    return 'home';
  }

  createHeader() {
    const header = document.createElement('header');
    header.id = 'site-header';
    header.innerHTML = `
      <div class="header-content">
        <a href="index.html" class="logo" aria-label="Silksong Hub 首页">
          <img src="./assets/img/silksong-logo.png" alt="Silksong" style="height: 32px; width: auto; margin-right: 8px;">
          <span class="logo-text">SilksongHub</span>
        </a>
        
        <nav role="navigation" aria-label="主导航">
          <ul id="main-nav">
            <li><a href="index.html" data-page="home" data-zh="首页" data-en="Home">首页</a></li>
            <!-- <li><a href="news.html" data-page="news" data-zh="新闻" data-en="News">新闻</a></li> -->
            <li><a href="prices.html" data-page="prices" data-zh="价格" data-en="Prices">价格</a></li>
            <li><a href="map.html" data-page="map" data-zh="地图" data-en="Map">地图</a></li>
            <!-- <li><a href="media.html" data-page="media" data-zh="媒体" data-en="Media">媒体</a></li> -->
          </ul>
        </nav>
        
        <!-- 语言切换器 -->
        <div class="language-switcher">
          <button class="lang-toggle" aria-label="切换语言" data-current-lang="zh-CN">
            <span class="lang-current">中文</span>
            <span class="lang-arrow">▼</span>
          </button>
          <div class="lang-dropdown">
            <button class="lang-option" data-lang="zh-CN">中文</button>
            <button class="lang-option" data-lang="en">English</button>
          </div>
        </div>

        <button class="mobile-menu-toggle" aria-label="切换移动端菜单" aria-expanded="false">
          <span class="sr-only">菜单</span>
          <span class="hamburger">☰</span>
        </button>
      </div>
    `;
    return header;
  }

  createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="footer-content">
        <div class="footer-info">
          <p class="footer-text" 
             data-zh="© 2025 silksonghub.com — 粉丝网站，与 Team Cherry 无关联"
             data-en="© 2025 silksonghub.com — Fan site, not affiliated with Team Cherry">
            © 2025 silksonghub.com — 粉丝网站，与 Team Cherry 无关联
          </p>
          <p class="footer-disclaimer" 
             data-zh="本站内容仅供参考，具体信息以官方发布为准"
             data-en="Content is for reference only, official information takes precedence">
            本站内容仅供参考，具体信息以官方发布为准
          </p>
        </div>
        
        <div class="footer-social">
          <a href="http://x.com/teamcherrygames" 
             target="_blank" 
             rel="noopener noreferrer" 
             aria-label="X (Twitter)"
             class="social-link">
            <span class="social-icon">𝕏</span>
          </a>
          <a href="https://www.youtube.com/user/teamcherrygames" 
             target="_blank" 
             rel="noopener noreferrer" 
             aria-label="YouTube"
             class="social-link">
            <span class="social-icon">📺</span>
          </a>
          <a href="https://www.facebook.com/teamcherrygames" 
             target="_blank" 
             rel="noopener noreferrer" 
             aria-label="Facebook"
             class="social-link">
            <span class="social-icon">f</span>
          </a>
          <a href="https://bsky.app/profile/did:plc:njcr3moahtid7crxdjtu26jp" 
             target="_blank" 
             rel="noopener noreferrer" 
             aria-label="Bluesky"
             class="social-link">
            <span class="social-icon">🦋</span>
          </a>
        </div>
      </div>
    `;
    return footer;
  }

  insertComponents() {
    // 插入 Header
    const existingHeader = document.getElementById('site-header');
    if (!existingHeader) {
      const header = this.createHeader();
      document.body.insertBefore(header, document.body.firstChild);
    }

    // 插入 Footer
    const existingFooter = document.querySelector('.site-footer');
    if (!existingFooter) {
      const footer = this.createFooter();
      document.body.appendChild(footer);
    }
  }

  setActiveNavigation() {
    const navLinks = document.querySelectorAll('#main-nav a[data-page]');
    navLinks.forEach(link => {
      const page = link.getAttribute('data-page');
      if (page === this.currentPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  setupMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.getElementById('main-nav');
    
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        // 切换状态
        toggle.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('active');
        document.body.classList.toggle('mobile-menu-open');
        
        // 更新按钮图标
        const hamburger = toggle.querySelector('.hamburger');
        if (hamburger) {
          hamburger.textContent = !isExpanded ? '✕' : '☰';
        }
      });

      // 点击导航链接后关闭移动端菜单
      const navLinks = nav.querySelectorAll('a');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('mobile-menu-open');
          const hamburger = toggle.querySelector('.hamburger');
          if (hamburger) {
            hamburger.textContent = '☰';
          }
        });
      });

      // 点击外部关闭移动端菜单
      document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !nav.contains(e.target)) {
          nav.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('mobile-menu-open');
          const hamburger = toggle.querySelector('.hamburger');
          if (hamburger) {
            hamburger.textContent = '☰';
          }
        }
      });

      // ESC 键关闭移动端菜单
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
          nav.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('mobile-menu-open');
          const hamburger = toggle.querySelector('.hamburger');
          if (hamburger) {
            hamburger.textContent = '☰';
          }
          toggle.focus();
        }
      });
    }
  }

  setupSmoothScrolling() {
    // 为锚点链接添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          const headerHeight = document.getElementById('site-header')?.offsetHeight || 0;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupScrollHeader() {
    let lastScrollY = window.scrollY;
    const header = document.getElementById('site-header');
    
    if (!header) return;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      // 添加/移除滚动样式
      if (currentScrollY > 100) {
        header.style.background = 'rgba(14, 15, 26, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
      } else {
        header.style.background = 'rgba(14, 15, 26, 0.95)';
        header.style.boxShadow = 'none';
      }

      lastScrollY = currentScrollY;
    });
  }

  setupLanguageSwitcher() {
    const langToggle = document.querySelector('.lang-toggle');
    const langDropdown = document.querySelector('.lang-dropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    
    if (!langToggle || !langDropdown) return;
    
    // 切换下拉菜单
    langToggle.addEventListener('click', (e) => {
      e.preventDefault();
      langDropdown.classList.toggle('active');
      langToggle.classList.toggle('active');
    });
    
    // 语言选择
    langOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLang = option.dataset.lang;
        this.switchLanguage(selectedLang);
        langDropdown.classList.remove('active');
        langToggle.classList.remove('active');
      });
    });
    
    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
      if (!langToggle.contains(e.target) && !langDropdown.contains(e.target)) {
        langDropdown.classList.remove('active');
        langToggle.classList.remove('active');
      }
    });
  }

  switchLanguage(lang) {
    // 更新 HTML 元素语言属性
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    
    // 更新语言切换按钮显示
    const langToggle = document.querySelector('.lang-toggle');
    const langCurrent = document.querySelector('.lang-current');
    if (langToggle && langCurrent) {
      langToggle.dataset.currentLang = lang;
      langCurrent.textContent = lang === 'zh-CN' ? '中文' : 'English';
    }
    
    // 触发自定义事件用于其他组件监听
    const languageChangeEvent = new CustomEvent('languageChanged', {
      detail: { language: lang }
    });
    document.dispatchEvent(languageChangeEvent);
    
    // 存储语言选择
    localStorage.setItem('selectedLanguage', lang);
    
    // 更新 URL
    this.updateUrlWithLanguage(lang);
  }

  updateUrlWithLanguage(lang) {
    const url = new URL(window.location);
    if (lang === 'en') {
      url.searchParams.set('lang', 'en');
    } else {
      url.searchParams.delete('lang');
    }
    window.history.replaceState({}, '', url);
  }

  initializeLanguage() {
    // 从 URL、localStorage或默认设置中获取语言
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    const storedLang = localStorage.getItem('selectedLanguage');
    const defaultLang = 'en';
    
    const htmlLang = document.documentElement.dataset.lang || document.documentElement.lang;
    let currentLang = urlLang ?? (storedLang && ['zh-CN','en'].includes(storedLang) ? storedLang : undefined) ?? (['zh-CN','en'].includes(htmlLang) ? htmlLang : defaultLang);
    
    // 设置初始语言
    if (currentLang !== 'en') {
      this.switchLanguage(currentLang);
    }
  }

  init() {
    // 等待 DOM 完全加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.insertComponents();
        this.setActiveNavigation();
        this.setupMobileMenu();
        this.setupLanguageSwitcher();
        this.setupSmoothScrolling();
        this.setupScrollHeader();
        this.initializeLanguage();
      });
    } else {
      // DOM 已经加载完成
      this.insertComponents();
      this.setActiveNavigation();
      this.setupMobileMenu();
      this.setupLanguageSwitcher();
      this.setupSmoothScrolling();
      this.setupScrollHeader();
      this.initializeLanguage();
    }
  }
}

// 创建全局实例
window.silksongHeader = new SilksongHeader();

// 导出给其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SilksongHeader;
}