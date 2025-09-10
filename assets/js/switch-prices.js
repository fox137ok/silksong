// Silksong Hub - Nintendo Switch eShop Regional Price Comparison
class SwitchPriceManager {
  constructor() {
    this.data = [];
    this.isLoading = false;
    this.sortSelector = null;
    this.currencyToggle = null;
    this.tableBody = null;
    this.bestDealBanner = null;
    this.bestDealText = null;
    this.dataStatusBanner = null;
    this.dataStatusText = null;
    this.lastUpdatedText = null;
    this.showUSD = false; // Toggle for showing USD equivalent prices
    this.exchangeRates = {
      // 基于2025年9月真实市场汇率
      'USD': 1.00,
      'CAD': 0.72,    // 加拿大元
      'MXN': 0.0534,  // 墨西哥比索
      'BRL': 0.185,   // 巴西雷亚尔
      'EUR': 1.18,    // 欧元
      'GBP': 1.35,    // 英镑
      'JPY': 0.00677, // 日元
      'KRW': 0.000707, // 韩元
      'AUD': 0.65     // 澳元
    };
    this.init();
  }

  async init() {
    console.log('SwitchPriceManager init() called, document.readyState:', document.readyState);
    
    if (document.readyState === 'loading') {
      console.log('DOM is still loading, waiting for DOMContentLoaded...');
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      console.log('DOM is ready, calling setup() directly');
      setTimeout(() => this.setup(), 0);
    }
  }

  async setup() {
    console.log('SwitchPriceManager setup() started');
    
    this.sortSelector = document.getElementById('sort-selector');
    this.currencyToggle = document.getElementById('currency-toggle');
    this.tableBody = document.querySelector('#price-table tbody');
    this.bestDealBanner = document.getElementById('best-deal-banner');
    this.bestDealText = document.getElementById('best-deal-text');
    this.dataStatusBanner = document.getElementById('data-status-banner');
    this.dataStatusText = document.getElementById('data-status-text');
    this.lastUpdatedText = document.getElementById('last-updated-text');
    
    console.log('DOM element search results:', {
      sortSelector: !!this.sortSelector,
      currencyToggle: !!this.currencyToggle,
      tableBody: !!this.tableBody,
      bestDealBanner: !!this.bestDealBanner,
      bestDealText: !!this.bestDealText,
      dataStatusBanner: !!this.dataStatusBanner,
      dataStatusText: !!this.dataStatusText,
      lastUpdatedText: !!this.lastUpdatedText
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
      this.updateDataStatus();
      this.render();
      console.log('Rendering completed');
    } catch (error) {
      console.error('Failed to initialize price table:', error);
      this.showError('Failed to load price data: ' + error.message);
    }
  }

  initializeCurrencyToggle() {
    this.updateCurrencyToggleText();
    
    // Listen for global language change events to update button text
    window.addEventListener('languageChanged', () => {
      this.updateCurrencyToggleText();
    });
  }

  updateCurrencyToggleText() {
    if (this.currencyToggle) {
      const currentLang = document.documentElement.dataset.lang || 
                         document.documentElement.lang || 
                         (window.languageManager ? window.languageManager.currentLang : 'en');
      const isZH = currentLang === 'zh-CN';
      this.currencyToggle.textContent = this.showUSD ? 
        (isZH ? '显示本地价格' : 'Show Local Prices') : 
        (isZH ? '显示美元价格' : 'Show USD Prices');
    }
  }

  async loadData() {
    if (this.isLoading) return;
    
    console.log('loadData() starting execution');
    this.isLoading = true;
    this.showLoading();
    
    try {
      console.log('Fetching: /data/switch-prices.json');
      console.log('Current page URL:', window.location.href);
      
      const response = await fetch('/data/switch-prices.json');
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('Starting to parse JSON data...');
      const rawData = await response.json();
      console.log('Raw data structure:', rawData);
      
      // Extract regions array from new data format
      this.data = rawData.regions || rawData || [];
      console.log('Raw data length:', this.data.length);
      
      // Store metadata if available
      this.metadata = {
        lastUpdated: rawData.lastUpdated,
        dataVersion: rawData.dataVersion,
        gameStatus: rawData.gameStatus,
        note: rawData.note
      };
      
      // Filter data to show only items with eShop prices
      const filteredData = this.data.filter(item => item.eshop && item.eshop.price);
      console.log('Filtered data length:', filteredData.length);
      
      // Process each data entry, adding USD equivalent price
      console.log('Starting to process price data...');
      this.data = filteredData.map(item => {
          try {
            const currencyCode = this.getCurrencyCode(item.currency, item.region, item.eshop.price);
            const priceUSD = this.convertToUSD(item.eshop.price, currencyCode);
            const savings = this.calculateSavings(item.eshop.price, currencyCode);
            
            return {
              ...item,
              eshop: {
                ...item.eshop,
                priceUSD: priceUSD,
                savings: savings
              }
            };
          } catch (error) {
            console.error('Error processing price data:', item, error);
            return {
              ...item,
              eshop: {
                ...item.eshop,
                priceUSD: item.eshop.price,
                savings: 0
              }
            };
          }
        });
      console.log('Price data processing completed, final data length:', this.data.length);
    } catch (error) {
      console.error('Failed to load price data:', error);
      
      let errorMessage = 'Failed to load data';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (window.location.protocol === 'file:') {
          errorMessage = 'Please access the page through an HTTP server instead of opening the HTML file directly. You can use "python3 -m http.server 8000" to start a local server.';
        } else {
          errorMessage = 'Failed to load JSON file, please check if data/switch-prices.json exists';
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
      'CAD$': 'CAD',
      'MX$': 'MXN',
      'R$': 'BRL',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY', // Nintendo eShop generally uses JPY for Japan
      '₩': 'KRW',
      'AUD$': 'AUD',
      'HK$': 'HKD'
    };
    
    // Special handling for different currencies with $ symbol
    if (currency === '$') {
      if (region === 'MX') return 'MXN';
      return 'USD'; // Default to USD
    }
    
    return currencyMap[currency] || 'USD';
  }

  convertToUSD(price, currencyCode) {
    if (currencyCode === 'USD') {
      return price;
    }
    
    const rate = this.exchangeRates[currencyCode] || 1;
    return price * rate;
  }

  calculateSavings(price, currencyCode) {
    const priceUSD = this.convertToUSD(price, currencyCode);
    const basePriceUSD = 19.99; // US region baseline price
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
    
    // 监听语言切换事件，重新渲染表格
    document.addEventListener('languageChanged', () => {
      console.log('Language changed, re-rendering Switch price table');
      this.render();
    });
  }

  sortData(data, sortBy) {
    switch (sortBy) {
      case 'price':
        return [...data].sort((a, b) => a.eshop.priceUSD - b.eshop.priceUSD);
      case 'region':
        return [...data].sort((a, b) => this.getRegionName(a.region, a.regionName).localeCompare(this.getRegionName(b.region, b.regionName)));
      case 'savings':
        return [...data].sort((a, b) => b.eshop.savings - a.eshop.savings);
      default:
        return [...data].sort((a, b) => a.eshop.priceUSD - b.eshop.priceUSD);
    }
  }

  render() {
    console.log('render() called, data length:', this.data.length);
    
    if (!this.tableBody) {
      console.error('render(): tableBody does not exist');
      return;
    }
    
    if (!this.data.length) {
      console.warn('render(): No data to display');
      this.showError('No price data to display');
      return;
    }

    const sortBy = this.sortSelector ? this.sortSelector.value : 'price';
    console.log('Sort method:', sortBy);
    const sortedData = this.sortData(this.data, sortBy);
    console.log('Sorted data length:', sortedData.length);
    
    // Find the best deal
    const bestDeal = sortedData[0];
    this.updateBestDealBanner(bestDeal);

    // Generate table rows
    const rows = sortedData.map((item, index) => {
      const isLowest = index === 0;
      const priceUSD = item.eshop.priceUSD || item.eshop.price || 0;
      const savings = item.eshop.savings || 0;
      
      const displayPrice = this.showUSD ? 
        `$${priceUSD.toFixed(2)}` : 
        `${item.currency}${this.formatPrice(item.eshop.price)}`;
      
      const currentLang = document.documentElement.dataset.lang || 
                         document.documentElement.lang || 
                         (window.languageManager ? window.languageManager.currentLang : 'en');
      const isZH = currentLang === 'zh-CN';
      const savingsText = savings > 0 ? 
        `${isZH ? '节省' : 'Save'} $${savings.toFixed(2)}` : 
        (isZH ? '无节省' : 'No savings');
      
      return `
        <tr ${isLowest ? 'class="lowest-price-row"' : ''}>
          <td style="text-align: center;">
            <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
              ${item.flag ? `<span>${item.flag}</span>` : ''}
              <strong style="color: ${isLowest ? 'var(--accent)' : 'var(--text)'}">
                ${this.getRegionName(item.region, item.regionName)}
              </strong>
            </div>
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
            <a href="${item.eshop.url}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="buy-button"
               aria-label="${isZH ? '购买' : 'Buy'} - Nintendo eShop ${this.getRegionName(item.region, item.regionName)}">
              ${isZH ? '购买' : 'Buy'}
            </a>
          </td>
        </tr>
      `;
    }).join('');

    this.tableBody.innerHTML = rows;
  }

  updateDataStatus() {
    // Data status banner has been removed - this method is now disabled
    return;
  }

  updateBestDealBanner(bestDeal) {
    if (!this.bestDealBanner || !this.bestDealText || !bestDeal) return;
    
    const savings = bestDeal.eshop.savings || 0;
    const priceUSD = bestDeal.eshop.priceUSD || bestDeal.eshop.price || 0;
    const savingsPercent = ((savings / 19.99) * 100).toFixed(1);
    
    const isZH = document.documentElement.lang.startsWith('zh');
    this.bestDealText.innerHTML = `
      ${bestDeal.flag ? bestDeal.flag + ' ' : ''}${this.getRegionName(bestDeal.region, bestDeal.regionName)} - ${bestDeal.currency}${this.formatPrice(bestDeal.eshop.price)} 
      (${isZH ? '约' : 'approx.'} $${priceUSD.toFixed(2)}) 
      <span style="color: #fff;">${isZH ? '节省' : 'Save'} ${savingsPercent}%</span>
    `;
    this.bestDealBanner.style.display = 'block';
  }

  formatPrice(price) {
    if (price >= 1000) {
      return price.toLocaleString();
    }
    return price.toString();
  }

  getRegionName(region, regionName = null) {
    // 使用更可靠的语言检测方式
    const currentLang = document.documentElement.dataset.lang || 
                       document.documentElement.lang || 
                       (window.languageManager ? window.languageManager.currentLang : 'en');
    const isZH = currentLang === 'zh-CN';
    
    const regionNames = {
      'US': isZH ? '美国' : 'United States',
      'CA': isZH ? '加拿大' : 'Canada',
      'MX': isZH ? '墨西哥' : 'Mexico',
      'BR': isZH ? '巴西' : 'Brazil',
      'EU': isZH ? '欧盟' : 'European Union',
      'UK': isZH ? '英国' : 'United Kingdom',
      'GB': isZH ? '英国' : 'United Kingdom',
      'DE': isZH ? '德国' : 'Germany',
      'FR': isZH ? '法国' : 'France',
      'IT': isZH ? '意大利' : 'Italy',
      'ES': isZH ? '西班牙' : 'Spain',
      'JP': isZH ? '日本' : 'Japan',
      'KR': isZH ? '韩国' : 'South Korea',
      'AU': isZH ? '澳大利亚' : 'Australia',
      'HK': isZH ? '香港' : 'Hong Kong'
    };
    
    // 优先使用语言转换后的名称，而不是数据中的regionName
    return regionNames[region] || region;
  }

  showLoading() {
    if (this.tableBody) {
      const currentLang = document.documentElement.dataset.lang || 
                         document.documentElement.lang || 
                         (window.languageManager ? window.languageManager.currentLang : 'en');
      const isZH = currentLang === 'zh-CN';
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

  // Public method: get best deal info
  getBestDeal() {
    if (!this.data.length) return null;
    
    const sorted = this.sortData(this.data, 'price');
    const bestDeal = sorted[0];
    
    return {
      region: bestDeal.region,
      regionName: this.getRegionName(bestDeal.region, bestDeal.regionName),
      price: bestDeal.eshop.price,
      currency: bestDeal.currency,
      priceUSD: bestDeal.eshop.priceUSD,
      savings: bestDeal.eshop.savings,
      savingsPercent: ((bestDeal.eshop.savings / 19.99) * 100).toFixed(1),
      url: bestDeal.eshop.url
    };
  }

  // Public method: refresh data
  async refresh() {
    this.data = [];
    await this.loadData();
    this.render();
  }

  // Public method: get all data
  getData() {
    return this.data;
  }
}

// Create global instance
window.switchPriceManager = new SwitchPriceManager();

// Export for other scripts to use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SwitchPriceManager;
}