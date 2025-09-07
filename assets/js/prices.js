// Silksong Hub - Steam Regional Price Comparison
class SteamPriceManager {
  constructor() {
    this.data = [];
    this.isLoading = false;
    this.sortSelector = null;
    this.currencyToggle = null;
    this.tableBody = null;
    this.bestDealBanner = null;
    this.bestDealText = null;
    this.showUSD = false; // Toggle for showing USD equivalent prices
    this.showUSDLocal = false; // true显示美元价格，false显示本地价格
    this.exchangeRates = {
      // 基于美元的汇率(2024年大致汇率)
      'USD': 1.00,
      'ARS': 0.0011, // 阿根廷比索 (更新汇率)
      'TRY': 0.030,  // 土耳其里拉 (更新汇率)
      'RUB': 0.011,  // 俄罗斯卢布
      'BRL': 0.18,   // 巴西雷亚尔 (更新汇率)
      'INR': 0.012,  // 印度卢比
      'CNY': 0.14,   // 人民币
      'EUR': 1.09,   // 欧元
      'GBP': 1.27,   // 英镑
      'JPY': 0.0067, // 日元
      'KRW': 0.00076, // 韩元
      'MXN': 0.055   // 墨西哥比索
    };
    this.init();
  }

  async init() {
    console.log('init() 调用，document.readyState:', document.readyState);
    
    // 由于使用了defer属性，DOM肯定已经准备好了
    if (document.readyState === 'loading') {
      console.log('DOM还在加载，等待DOMContentLoaded...');
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      console.log('DOM已准备好，直接调用setup()');
      // 使用setTimeout确保DOM完全准备好
      setTimeout(() => this.setup(), 0);
    }
  }

  async setup() {
    console.log('SteamPriceManager setup() started');
    
    this.sortSelector = document.getElementById('sort-selector');
    this.currencyToggle = document.getElementById('currency-toggle');
    this.tableBody = document.querySelector('#price-table tbody');
    this.bestDealBanner = document.getElementById('best-deal-banner');
    this.bestDealText = document.getElementById('best-deal-text');
    
    console.log('DOM element search results:', {
      sortSelector: !!this.sortSelector,
      currencyToggle: !!this.currencyToggle,
      tableBody: !!this.tableBody,
      bestDealBanner: !!this.bestDealBanner,
      bestDealText: !!this.bestDealText
    });
    
    if (!this.tableBody) {
      console.warn('Price table element not found, skipping price functionality initialization');
      return;
    }

    // Currency toggle functionality
    this.initializeCurrencyToggle();
    
    try {
      console.log('Starting data loading...');
      await this.loadData();
      console.log('Data loading completed, setting up event listeners...');
      this.setupEventListeners();
      console.log('Starting rendering...');
      this.render();
      console.log('Rendering completed');
    } catch (error) {
      console.error('Failed to initialize price table:', error);
      this.showError('Failed to load price data: ' + error.message);
    }
  }

  initializeCurrencyToggle() {
    // Initialize currency toggle button text
    this.updateCurrencyToggleText();
    
    // Listen for global language change events to update button text
    window.addEventListener('languageChanged', () => {
      this.updateCurrencyToggleText();
    });
  }

  updateCurrencyToggleText() {
    if (this.currencyToggle) {
      const isZH = document.documentElement.lang.startsWith('zh');
      this.currencyToggle.textContent = this.showUSD ? 
        (isZH ? '显示本地价格' : 'Show Local Prices') : 
        (isZH ? '显示美元价格' : 'Show USD Prices');
    }
  }

  async loadData() {
    if (this.isLoading) return;
    
    console.log('loadData() 开始执行');
    this.isLoading = true;
    this.showLoading();
    
    try {
      console.log('发起fetch请求到: ./data/prices.json');
      console.log('当前页面URL:', window.location.href);
      console.log('请求完整URL:', new URL('./data/prices.json', window.location.href).href);
      
      const response = await fetch('./data/prices.json');
      console.log('响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('开始解析JSON数据...');
      this.data = await response.json();
      console.log('原始数据长度:', this.data.length);
      
      // 过滤只显示有Steam价格的数据
      const filteredData = this.data.filter(item => item.steam && item.steam.price);
      console.log('过滤后数据长度:', filteredData.length);
      
      // 处理每条数据，添加美元等价价格
      console.log('开始处理价格数据...');
      this.data = filteredData.map(item => {
          try {
            const currencyCode = this.getCurrencyCode(item.currency, item.region, item.steam.price);
            const priceUSD = this.convertToUSD(item.steam.price, currencyCode);
            const savings = this.calculateSavings(item.steam.price, currencyCode);
            
            return {
              ...item,
              steam: {
                ...item.steam,
                priceUSD: priceUSD,
                savings: savings
              }
            };
          } catch (error) {
            console.error('处理价格数据时出错:', item, error);
            // 返回默认值
            return {
              ...item,
              steam: {
                ...item.steam,
                priceUSD: item.steam.price, // 假设是美元
                savings: 0
              }
            };
          }
        });
      console.log('价格数据处理完成，最终数据长度:', this.data.length);
    } catch (error) {
      console.error('Failed to load price data:', error);
      
      // Provide more detailed error information
      let errorMessage = 'Failed to load data';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (window.location.protocol === 'file:') {
          errorMessage = 'Please access the page through an HTTP server instead of opening the HTML file directly. You can use "python3 -m http.server 8000" to start a local server.';
        } else {
          errorMessage = 'Failed to load JSON file, please check if data/prices.json exists';
        }
      } else if (error.message.includes('HTTP')) {
        errorMessage = `Server error: ${error.message}`;
      }
      
      throw new Error(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  getCurrencyCode(currency, region = '', price = 0) {
    const currencyMap = {
      '$': 'USD',
      '¥': 'CNY', // 默认人民币，如果是日元会特别处理
      '€': 'EUR',
      '£': 'GBP',
      '₺': 'TRY',
      '₽': 'RUB',
      'R$': 'BRL',
      '₹': 'INR',
      '₩': 'KRW'
    };
    
    // 特殊处理：根据地区判断货币
    if (currency === '¥') {
      // 根据地区或价格范围判断是人民币还是日元
      if (region === 'JP' || price > 1000) {
        return 'JPY';
      }
      return 'CNY';
    }
    
    return currencyMap[currency] || 'USD';
  }

  convertToUSD(price, currencyCode) {
    // 如果已经是美元，直接返回
    if (currencyCode === 'USD') {
      return price;
    }
    
    const rate = this.exchangeRates[currencyCode] || 1;
    return price * rate;
  }

  calculateSavings(price, currencyCode) {
    const priceUSD = this.convertToUSD(price, currencyCode);
    const basePriceUSD = 19.99; // 美区基准价格
    return Math.max(0, basePriceUSD - priceUSD);
  }

  setupEventListeners() {
    if (this.sortSelector) {
      this.sortSelector.addEventListener('change', () => this.render());
    }

    if (this.currencyToggle) {
      this.currencyToggle.addEventListener('click', () => {
        this.showUSD = !this.showUSD;
        this.updateCurrencyToggleText();
        this.render();
      });
    }

  }

  sortData(data, sortBy) {
    switch (sortBy) {
      case 'price':
        return [...data].sort((a, b) => a.steam.priceUSD - b.steam.priceUSD);
      case 'region':
        return [...data].sort((a, b) => this.getRegionName(a.region).localeCompare(this.getRegionName(b.region)));
      case 'savings':
        return [...data].sort((a, b) => b.steam.savings - a.steam.savings);
      default:
        return [...data].sort((a, b) => a.steam.priceUSD - b.steam.priceUSD);
    }
  }

  render() {
    console.log('render() 调用，数据长度:', this.data.length);
    
    if (!this.tableBody) {
      console.error('render(): tableBody 不存在');
      return;
    }
    
    if (!this.data.length) {
      console.warn('render(): No data to display');
      this.showError('No price data to display');
      return;
    }

    const sortBy = this.sortSelector ? this.sortSelector.value : 'price';
    console.log('排序方式:', sortBy);
    const sortedData = this.sortData(this.data, sortBy);
    console.log('排序后数据长度:', sortedData.length);
    
    // 找到最优惠的价格
    const bestDeal = sortedData[0]; // 已经按价格排序，第一个是最便宜的
    this.updateBestDealBanner(bestDeal);

    // 生成表格行
    const rows = sortedData.map((item, index) => {
      const isLowest = index === 0; // 最便宜的标记为最优
      const priceUSD = item.steam.priceUSD || item.steam.price || 0;
      const savings = item.steam.savings || 0;
      
      const displayPrice = this.showUSD ? 
        `$${priceUSD.toFixed(2)}` : 
        `${item.currency}${this.formatPrice(item.steam.price)}`;
      
      const isZH = document.documentElement.lang.startsWith('zh');
      const savingsText = savings > 0 ? 
        `${isZH ? '节省' : 'Save'} $${savings.toFixed(2)}` : 
        (isZH ? '无节省' : 'No savings');
      
      return `
        <tr ${isLowest ? 'class="lowest-price-row"' : ''}>
          <td>
            <strong style="color: ${isLowest ? 'var(--accent)' : 'var(--text)'}">
              ${this.getRegionName(item.region)}
            </strong>
          </td>
          <td class="${isLowest ? 'lowest' : ''}" style="font-weight: 600;">
            ${displayPrice}
          </td>
          <td style="color: var(--text-secondary);">
            $${priceUSD.toFixed(2)}
          </td>
          <td style="color: ${savings > 0 ? 'var(--accent)' : 'var(--text-muted)'}; font-weight: 600;">
            ${savingsText}
          </td>
          <td>
            <a href="${item.steam.url}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="buy-button"
               aria-label="${isZH ? '购买' : 'Buy'} - Steam ${this.getRegionName(item.region)}">
              ${isZH ? '购买' : 'Buy'}
            </a>
          </td>
        </tr>
      `;
    }).join('');

    this.tableBody.innerHTML = rows;
  }

  updateBestDealBanner(bestDeal) {
    if (!this.bestDealBanner || !this.bestDealText || !bestDeal) return;
    
    const savings = bestDeal.steam.savings || 0;
    const priceUSD = bestDeal.steam.priceUSD || bestDeal.steam.price || 0;
    const savingsPercent = ((savings / 19.99) * 100).toFixed(1);
    
    const isZH = document.documentElement.lang.startsWith('zh');
    this.bestDealText.innerHTML = `
      ${this.getRegionName(bestDeal.region)} - ${bestDeal.currency}${this.formatPrice(bestDeal.steam.price)} 
      (${isZH ? '约' : 'approx.'} $${priceUSD.toFixed(2)}) 
      <span style="color: #fff;">${isZH ? '节省' : 'Save'} ${savingsPercent}%</span>
    `;
    this.bestDealBanner.style.display = 'block';
  }

  formatPrice(price) {
    // 格式化价格显示
    if (price >= 1000) {
      return price.toLocaleString();
    }
    return price.toString();
  }

  getRegionName(region) {
    const isZH = document.documentElement.lang.startsWith('zh');
    const regionNames = {
      'US': isZH ? '美国' : 'United States',
      'CN': isZH ? '中国' : 'China',
      'MX': isZH ? '墨西哥' : 'Mexico',
      'AR': isZH ? '阿根廷' : 'Argentina',
      'TR': isZH ? '土耳其' : 'Turkey',
      'RU': isZH ? '俄罗斯' : 'Russia',
      'BR': isZH ? '巴西' : 'Brazil',
      'IN': isZH ? '印度' : 'India',
      'EU': isZH ? '欧盟' : 'European Union',
      'UK': isZH ? '英国' : 'United Kingdom',
      'JP': isZH ? '日本' : 'Japan',
      'KR': isZH ? '韩国' : 'South Korea'
    };
    
    return regionNames[region] || region;
  }

  showLoading() {
    if (this.tableBody) {
      const isZH = document.documentElement.lang.startsWith('zh');
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">
            <span class="loading" aria-label="Loading"></span>
            <span style="margin-left: 0.5rem;">${isZH ? '正在加载价格数据...' : 'Loading price data...'}</span>
          </td>
        </tr>
      `;
    }
  }

  showError(message) {
    if (this.tableBody) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center" style="color: var(--accent); padding: 2rem;">
            <strong>⚠️ ${message}</strong>
          </td>
        </tr>
      `;
    }
  }

  // 公开方法：获取最优价格信息
  getBestDeal() {
    if (!this.data.length) return null;
    
    const sorted = this.sortData(this.data, 'price');
    const bestDeal = sorted[0];
    
    return {
      region: bestDeal.region,
      regionName: this.getRegionName(bestDeal.region),
      price: bestDeal.steam.price,
      currency: bestDeal.currency,
      priceUSD: bestDeal.steam.priceUSD,
      savings: bestDeal.steam.savings,
      savingsPercent: ((bestDeal.steam.savings / 19.99) * 100).toFixed(1),
      url: bestDeal.steam.url
    };
  }

  // 公开方法：刷新数据
  async refresh() {
    this.data = [];
    await this.loadData();
    this.render();
  }

  // 公开方法：获取所有数据
  getData() {
    return this.data;
  }
}

// 创建全局实例
window.steamPriceManager = new SteamPriceManager();

// 导出给其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SteamPriceManager;
}