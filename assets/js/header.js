// Silksong Hub - Header/Footer 组件管理
class SilksongHeader {
  constructor() {
    this.currentPage = this.getCurrentPage();
    // 功能开关：可在此隐藏未上线的菜单项
    this.features = {
      news: false,
      media: false,
    };
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
    // 根据当前路径决定语言前缀与导航链接
    const isZh = window.location.pathname.startsWith('/zh/');
    const hrefHome = isZh ? '/zh/' : '/';
    const hrefNews = isZh ? '/zh/news/' : '/news/';
    const hrefPrices = isZh ? '/zh/prices/' : '/prices.html';
    const hrefMap = isZh ? '/zh/map/' : '/map.html';
    // 暂无中文版，始终指向英文
    const hrefMedia = '/media.html';

    const initialLangCode = isZh ? 'zh-CN' : 'en';
    const initialLangLabel = isZh ? '中文' : 'English';

    const logoAria = isZh ? 'Silksong Hub 首页' : 'Silksong Hub Home';
    const navAria = isZh ? '主导航' : 'Main Navigation';
    const langToggleAria = isZh ? '切换语言' : 'Switch language';
    const mobileToggleAria = isZh ? '切换移动端菜单' : 'Toggle mobile menu';
    const srOnlyMenu = isZh ? '菜单' : 'Menu';

    header.innerHTML = `
      <div class="header-content">
        <a href="${hrefHome}" class="logo" rel="home" aria-label="${logoAria}">
          <img src="/assets/img/silksong-logo.png" alt="Silksong" style="height: 32px; width: auto; margin-right: 8px;">
          <span class="logo-text">SilksongHub</span>
        </a>
        
        <nav role="navigation" aria-label="${navAria}">
          <ul id="main-nav">
            <li><a href="${hrefHome}" data-page="home" data-zh="首页" data-en="Home">${isZh ? '首页' : 'Home'}</a></li>
            ${this.features.news ? `<li><a href="${hrefNews}" data-page="news" data-zh="新闻" data-en="News">${isZh ? '新闻' : 'News'}</a></li>` : ''}
            <li><a href="${hrefPrices}" data-page="prices" data-zh="价格" data-en="Prices">${isZh ? '价格' : 'Prices'}</a></li>
            <li><a href="${hrefMap}" data-page="map" data-zh="地图" data-en="Map">${isZh ? '地图' : 'Map'}</a></li>
            ${this.features.media ? `<li><a href="${hrefMedia}" data-page="media" data-zh="媒体" data-en="Media">${isZh ? '媒体' : 'Media'}</a></li>` : ''}
          </ul>
        </nav>
        
        <!-- 语言切换器 -->
        <div class="language-switcher">
          <button class="lang-toggle" aria-label="${langToggleAria}" data-current-lang="${initialLangCode}">
            <span class="lang-current">${initialLangLabel}</span>
            <span class="lang-arrow">▼</span>
          </button>
          <div class="lang-dropdown">
            <button class="lang-option" data-lang="en">English</button>
            <button class="lang-option" data-lang="zh-CN">中文</button>
          </div>
        </div>

        <button class="mobile-menu-toggle" aria-label="${mobileToggleAria}" aria-expanded="false">
          <span class="sr-only">${srOnlyMenu}</span>
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

  ensureNoMobileLock() {
    // 确保页面未被误锁定滚动
    document.body.classList.remove('mobile-menu-open');
    const nav = document.getElementById('main-nav');
    if (nav) nav.classList.remove('active');
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
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
    // 将当前路径映射到对应语言的真实页面路径，并跳转
    // 本地直接打开 file:// 时不跳转，仅更新文本，以免指向系统根目录
    const proto = window.location.protocol;
    if (proto !== 'http:' && proto !== 'https:') {
      return; // 跳过 URL 重写，便于本地直接打开 HTML 预览
    }
    const { pathname, search, hash } = window.location;
    const isCurrentZh = pathname.startsWith('/zh/');

    function toZh(p) {
      if (p === '/' || p === '/index.html') return '/zh/';
      if (p === '/prices.html') return '/zh/prices/';
      if (p === '/map.html') return '/zh/map/';
      if (p === '/media.html') return '/media.html'; // 暂无中文版，保持英文路径
      if (p.startsWith('/news/')) return '/zh' + p;
      // 其它路径通用前缀
      return p.startsWith('/zh/') ? p : ('/zh' + p);
    }

    function toEn(p) {
      if (p === '/zh/' || p === '/zh/index.html') return '/';
      if (p === '/zh/prices/' || p === '/zh/prices/index.html') return '/prices.html';
      if (p === '/zh/map/' || p === '/zh/map/index.html') return '/map.html';
      if (p === '/zh/media/' || p === '/zh/media/index.html') return '/media.html';
      if (p.startsWith('/zh/news/')) return p.replace('/zh', '');
      // 去掉 zh 前缀
      return p.replace(/^\/zh/, '') || '/';
    }

    let newPath = pathname;
    if (lang === 'zh-CN') {
      newPath = toZh(pathname);
    } else {
      newPath = toEn(pathname);
    }

    const newUrl = newPath + search + hash;
    const currentUrl = pathname + search + hash;
    if (newUrl === currentUrl) return; // 已在目标URL，无需跳转
    window.location.href = newUrl;
  }

  initializeLanguage() {
    // 从 URL、localStorage或默认设置中获取语言
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    const storedLang = localStorage.getItem('selectedLanguage');
    const pathIsZh = window.location.pathname.split('/').filter(Boolean)[0] === 'zh';
    const initialLang = document.documentElement.dataset.lang || document.documentElement.lang || 'en';
    const desired = urlLang ?? (storedLang && ['zh-CN','en'].includes(storedLang) ? storedLang : (pathIsZh ? 'zh-CN' : 'en'));

    // 若当前语言与期望语言一致，则不触发切换，避免不必要的URL变更
    if (desired !== initialLang) {
      this.switchLanguage(desired);
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
        this.ensureNoMobileLock();
        // 窗口放大为桌面视图时，确保解除锁定
        window.addEventListener('resize', () => {
          if (window.innerWidth > 768) this.ensureNoMobileLock();
        });
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
      this.ensureNoMobileLock();
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) this.ensureNoMobileLock();
      });
    }
  }
}

// 创建全局实例
window.silksongHeader = new SilksongHeader();

// 导出给其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SilksongHeader;
}
