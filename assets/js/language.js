// Silksong Hub - 多语言支持系统
class LanguageManager {
  constructor() {
    this.currentLang = 'en';
    this.init();
  }

  init() {
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupLanguageElements();
        this.bindEvents();
      });
    } else {
      this.setupLanguageElements();
      this.bindEvents();
    }
  }

  setupLanguageElements() {
    // 获取当前语言设置
    this.currentLang = document.documentElement.dataset.lang || 'en';
    
    // 初始化所有多语言元素
    this.updateAllElements();
  }

  bindEvents() {
    // 监听语言切换事件
    document.addEventListener('languageChanged', (e) => {
      this.currentLang = e.detail.language;
      this.updateAllElements();
      this.updateMetaTags();
    });
  }

  updateAllElements() {
    // 更新所有带有多语言数据属性的元素
    const elements = document.querySelectorAll('[data-zh][data-en]');
    
    elements.forEach(element => {
      const zhText = element.dataset.zh;
      const enText = element.dataset.en;
      
      if (this.currentLang === 'en' && enText) {
        // 更新文本内容
        if (element.tagName === 'META') {
          element.setAttribute('content', enText);
        } else if (element.tagName === 'TITLE') {
          element.textContent = enText;
        } else {
          // 检查是否包含HTML标签
          if (enText.includes('<') && enText.includes('>')) {
            element.innerHTML = enText;
          } else {
            element.textContent = enText;
          }
        }
      } else if (this.currentLang === 'zh-CN' && zhText) {
        // 中文
        if (element.tagName === 'META') {
          element.setAttribute('content', zhText);
        } else if (element.tagName === 'TITLE') {
          element.textContent = zhText;
        } else {
          // 检查是否包含HTML标签
          if (zhText.includes('<') && zhText.includes('>')) {
            element.innerHTML = zhText;
          } else {
            element.textContent = zhText;
          }
        }
      } else if (enText) {
        // 默认英文
        if (element.tagName === 'META') {
          element.setAttribute('content', enText);
        } else if (element.tagName === 'TITLE') {
          element.textContent = enText;
        } else {
          // 检查是否包含HTML标签
          if (enText.includes('<') && enText.includes('>')) {
            element.innerHTML = enText;
          } else {
            element.textContent = enText;
          }
        }
      }
    });

    // 更新特殊元素
    this.updateSpecialElements();
  }

  updateSpecialElements() {
    // 更新 YouTube 视频标题
    const youtubeElements = document.querySelectorAll('[data-zh-title][data-en-title]');
    youtubeElements.forEach(element => {
      const zhTitle = element.dataset.zhTitle;
      const enTitle = element.dataset.enTitle;
      const title = this.currentLang === 'en' ? enTitle : zhTitle;
      
      element.setAttribute('playlabel', title);
      
      const srOnly = element.querySelector('.sr-only');
      if (srOnly) {
        srOnly.textContent = title;
      }
    });

    // 更新进度条动画
    this.updateProgressBars();
  }

  updateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill[data-progress]');
    progressBars.forEach(bar => {
      const progress = bar.dataset.progress;
      // 延迟执行动画以确保页面渲染完成
      setTimeout(() => {
        bar.style.width = `${progress}%`;
      }, 500);
    });
  }

  updateMetaTags() {
    // 更新页面 meta 标签
    const title = document.querySelector('title[data-zh][data-en]');
    const description = document.querySelector('meta[name="description"][data-zh][data-en]');
    const ogTitle = document.querySelector('meta[property="og:title"][data-zh][data-en]');
    const ogDescription = document.querySelector('meta[property="og:description"][data-zh][data-en]');
    const twitterTitle = document.querySelector('meta[property="twitter:title"][data-zh][data-en]');
    const twitterDescription = document.querySelector('meta[property="twitter:description"][data-zh][data-en]');

    // 更新页面标题和描述
    if (title) {
      const titleText = this.currentLang === 'en' ? title.dataset.en : title.dataset.zh;
      document.title = titleText;
    }

    // 更新 Open Graph 属性
    if (ogTitle) {
      const ogTitleText = this.currentLang === 'en' ? ogTitle.dataset.en : ogTitle.dataset.zh;
      ogTitle.setAttribute('content', ogTitleText);
    }

    if (ogDescription) {
      const ogDescText = this.currentLang === 'en' ? ogDescription.dataset.en : ogDescription.dataset.zh;
      ogDescription.setAttribute('content', ogDescText);
    }

    // 更新 Twitter 卡片
    if (twitterTitle) {
      const twitterTitleText = this.currentLang === 'en' ? twitterTitle.dataset.en : twitterTitle.dataset.zh;
      twitterTitle.setAttribute('content', twitterTitleText);
    }

    if (twitterDescription) {
      const twitterDescText = this.currentLang === 'en' ? twitterDescription.dataset.en : twitterDescription.dataset.zh;
      twitterDescription.setAttribute('content', twitterDescText);
    }

    // 更新 HTML lang 属性
    document.documentElement.lang = this.currentLang;
    
    // 更新 Open Graph locale
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute('content', this.currentLang === 'en' ? 'en_US' : 'zh_CN');
    }
  }

  // 获取当前语言的文本
  getText(zhText, enText) {
    return this.currentLang === 'zh-CN' ? zhText : enText;
  }

  // 动态添加多语言支持的元素
  addMultiLangElement(element, zhText, enText) {
    element.dataset.zh = zhText;
    element.dataset.en = enText;
    
    // 立即更新文本
    const currentText = this.currentLang === 'zh-CN' ? zhText : enText;
    // 检查是否包含HTML标签
    if (currentText && currentText.includes('<') && currentText.includes('>')) {
      element.innerHTML = currentText;
    } else {
      element.textContent = currentText;
    }
  }
}

// 创建全局语言管理器实例
window.languageManager = new LanguageManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LanguageManager;
}