// Silksong Hub - 价格表功能
class PriceManager {
  constructor() {
    this.data = [];
    this.isLoading = false;
    this.regionSelector = null;
    this.tableBody = null;
    this.init();
  }

  async init() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    this.regionSelector = document.getElementById('region-selector');
    this.tableBody = document.querySelector('#price-table tbody');
    
    if (!this.regionSelector || !this.tableBody) {
      console.warn('价格表元素未找到，跳过价格功能初始化');
      return;
    }

    try {
      await this.loadData();
      this.setupEventListeners();
      this.render(this.regionSelector.value);
    } catch (error) {
      console.error('初始化价格表失败:', error);
      this.showError('加载价格数据失败，请刷新页面重试');
    }
  }

  async loadData() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoading();
    
    try {
      const response = await fetch('./data/prices.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      this.data = await response.json();
      this.populateRegionSelector();
    } catch (error) {
      console.error('加载价格数据失败:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  populateRegionSelector() {
    if (!this.regionSelector || !this.data.length) return;

    // 获取所有唯一的地区
    const regions = [...new Set(this.data.map(item => item.region))];
    
    // 清空现有选项（保留默认选项）
    const currentOptions = Array.from(this.regionSelector.options);
    const defaultOption = currentOptions.find(opt => opt.value === 'US');
    
    this.regionSelector.innerHTML = '';
    
    // 重新添加选项
    regions.forEach(region => {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = this.getRegionName(region);
      
      if (region === 'US') {
        option.selected = true;
      }
      
      this.regionSelector.appendChild(option);
    });
  }

  getRegionName(region) {
    const regionNames = {
      'US': '美国 (USD)',
      'CN': '中国 (CNY)',
      'MX': '墨西哥 (MXN)',
      'AR': '阿根廷 (ARS)',
      'TR': '土耳其 (TRY)',
      'RU': '俄罗斯 (RUB)',
      'BR': '巴西 (BRL)',
      'IN': '印度 (INR)',
      'EU': '欧盟 (EUR)',
      'UK': '英国 (GBP)',
      'JP': '日本 (JPY)',
      'KR': '韩国 (KRW)'
    };
    
    return regionNames[region] || region;
  }

  formatPrice(platform) {
    if (!platform || !platform.price) {
      return '<span class="price-unavailable">暂无</span>';
    }
    
    const price = typeof platform.price === 'number' ? platform.price.toFixed(2) : platform.price;
    const url = platform.url || '#';
    const ariaLabel = `在 ${this.getPlatformName(platform.platform || '')} 购买，价格 ${platform.currency || ''} ${price}`;
    
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="price-link" aria-label="${ariaLabel}">
      ${platform.currency || ''} ${price}
    </a>`;
  }

  getPlatformName(platform) {
    const names = {
      'steam': 'Steam',
      'eshop': 'Nintendo eShop', 
      'ps': 'PlayStation Store',
      'xbox': 'Xbox Store'
    };
    return names[platform] || platform;
  }

  setupEventListeners() {
    if (this.regionSelector) {
      this.regionSelector.addEventListener('change', (e) => {
        this.render(e.target.value);
      });
    }
  }

  render(selectedRegion) {
    if (!this.tableBody || !this.data.length) return;

    // 筛选选定地区的数据
    const regionData = this.data.filter(item => item.region === selectedRegion);
    
    if (regionData.length === 0) {
      this.showNoData(selectedRegion);
      return;
    }

    // 获取所有平台的价格用于比较
    const allPrices = [];
    regionData.forEach(item => {
      if (item.steam?.price) allPrices.push(item.steam.price);
      if (item.eshop?.price) allPrices.push(item.eshop.price);
      if (item.ps?.price) allPrices.push(item.ps.price);
      if (item.xbox?.price) allPrices.push(item.xbox.price);
    });

    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;

    // 生成表格行
    const rows = regionData.map(item => {
      const steamLowest = item.steam?.price === minPrice;
      const eshopLowest = item.eshop?.price === minPrice;
      const psLowest = item.ps?.price === minPrice;
      const xboxLowest = item.xbox?.price === minPrice;

      return `
        <tr>
          <td>
            <strong>${this.getRegionName(item.region)}</strong>
          </td>
          <td class="${steamLowest ? 'lowest' : ''}" data-platform="steam">
            ${this.formatPrice({ ...item.steam, platform: 'steam', currency: item.currency })}
          </td>
          <td class="${eshopLowest ? 'lowest' : ''}" data-platform="eshop">
            ${this.formatPrice({ ...item.eshop, platform: 'eshop', currency: item.currency })}
          </td>
          <td class="${psLowest ? 'lowest' : ''}" data-platform="ps">
            ${this.formatPrice({ ...item.ps, platform: 'ps', currency: item.currency })}
          </td>
          <td class="${xboxLowest ? 'lowest' : ''}" data-platform="xbox">
            ${this.formatPrice({ ...item.xbox, platform: 'xbox', currency: item.currency })}
          </td>
        </tr>
      `;
    }).join('');

    this.tableBody.innerHTML = rows;
    
    // 添加最低价格提示
    if (minPrice !== null) {
      this.showLowestPriceInfo(minPrice, regionData[0]?.currency || '');
    }
  }

  showLowestPriceInfo(price, currency) {
    // 移除现有的提示
    const existingInfo = document.querySelector('.lowest-price-info');
    if (existingInfo) {
      existingInfo.remove();
    }

    // 创建新的提示
    const info = document.createElement('div');
    info.className = 'lowest-price-info';
    info.innerHTML = `
      <p class="text-accent">
        <strong>💰 最低价格: ${currency} ${price.toFixed(2)}</strong>
      </p>
    `;

    // 插入到表格前
    const table = document.getElementById('price-table');
    if (table) {
      table.parentNode.insertBefore(info, table);
    }
  }

  showLoading() {
    if (this.tableBody) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">
            <span class="loading" aria-label="加载中"></span>
            <span class="sr-only">正在加载价格数据...</span>
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

  showNoData(region) {
    if (this.tableBody) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center" style="color: var(--text-muted); padding: 2rem;">
            暂无 ${this.getRegionName(region)} 地区的价格数据
          </td>
        </tr>
      `;
    }
  }

  // 公开方法：手动刷新数据
  async refresh() {
    this.data = [];
    await this.loadData();
    if (this.regionSelector) {
      this.render(this.regionSelector.value);
    }
  }

  // 公开方法：获取当前数据
  getData() {
    return this.data;
  }

  // 公开方法：获取最低价格信息
  getLowestPrice(region) {
    const regionData = this.data.filter(item => item.region === region);
    if (regionData.length === 0) return null;

    const prices = [];
    regionData.forEach(item => {
      if (item.steam?.price) prices.push({ platform: 'Steam', price: item.steam.price, url: item.steam.url });
      if (item.eshop?.price) prices.push({ platform: 'Nintendo eShop', price: item.eshop.price, url: item.eshop.url });
      if (item.ps?.price) prices.push({ platform: 'PlayStation Store', price: item.ps.price, url: item.ps.url });
      if (item.xbox?.price) prices.push({ platform: 'Xbox Store', price: item.xbox.price, url: item.xbox.url });
    });

    if (prices.length === 0) return null;

    prices.sort((a, b) => a.price - b.price);
    return {
      ...prices[0],
      currency: regionData[0].currency,
      region: regionData[0].region
    };
  }
}

// 创建全局实例
window.priceManager = new PriceManager();

// 导出给其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PriceManager;
}