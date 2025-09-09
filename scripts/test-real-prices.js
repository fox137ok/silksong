#!/usr/bin/env node

/**
 * 测试真实价格获取功能
 */

import pkg from 'nintendo-switch-eshop';
const { getPrices } = pkg;

// 一些已知的热门游戏NSUID用于测试
const testGames = [
  {
    name: 'The Legend of Zelda: Breath of the Wild',
    nsuid: '70010000000025'  // 塞尔达传说：旷野之息
  },
  {
    name: 'Super Mario Odyssey', 
    nsuid: '70010000000154'  // 超级马力欧奥德赛
  },
  {
    name: 'Animal Crossing: New Horizons',
    nsuid: '70010000027619'  // 集合啦！动物森友会
  }
];

const regions = [
  { code: 'US', name: '美国' },
  { code: 'GB', name: '英国' },
  { code: 'JP', name: '日本' },
  { code: 'DE', name: '德国' }
];

async function testPriceAPI() {
  console.log('🧪 测试Nintendo eShop价格API...\n');
  
  for (const game of testGames.slice(0, 1)) { // 只测试第一个游戏
    console.log(`🎮 测试游戏: ${game.name} (NSUID: ${game.nsuid})`);
    
    for (const region of regions) {
      try {
        console.log(`   正在获取${region.name}(${region.code})价格...`);
        const prices = await getPrices(region.code, game.nsuid);
        
        if (prices && prices.length > 0) {
          const price = prices[0];
          console.log(`   ✅ ${region.name}: ${price.regular_price?.currency || '?'} ${price.regular_price?.amount || 'N/A'}`);
          if (price.discount_price) {
            console.log(`      折扣价: ${price.discount_price.currency} ${price.discount_price.amount}`);
          }
        } else {
          console.log(`   ❌ ${region.name}: 无价格数据`);
        }
      } catch (error) {
        console.log(`   ❌ ${region.name}: ${error.message}`);
      }
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('');
  }
  
  // 现在尝试搜索可能的Silksong NSUID
  console.log('🔍 测试可能的Silksong NSUID...');
  
  // 这些是可能的Silksong NSUID（基于网络搜索和推测）
  const possibleSilksongNSUIDs = [
    '70010000063881',  // 可能的Silksong NSUID
    '70010000003205',  // 原版Hollow Knight NSUID
    '70010000063880',  // 相邻NSUID
    '70010000063882'   // 相邻NSUID
  ];
  
  for (const nsuid of possibleSilksongNSUIDs) {
    console.log(`\n测试NSUID: ${nsuid}`);
    
    try {
      const prices = await getPrices('US', nsuid);
      if (prices && prices.length > 0) {
        console.log(`🎉 找到价格数据! NSUID: ${nsuid}`);
        console.log(`   价格: ${prices[0].regular_price?.currency} ${prices[0].regular_price?.amount}`);
        
        // 如果找到了，测试其他地区
        console.log('   测试其他地区...');
        for (const region of ['GB', 'DE', 'JP']) {
          try {
            const regionPrices = await getPrices(region, nsuid);
            if (regionPrices && regionPrices.length > 0) {
              const p = regionPrices[0];
              console.log(`   ${region}: ${p.regular_price?.currency} ${p.regular_price?.amount}`);
            }
          } catch (err) {
            console.log(`   ${region}: ${err.message}`);
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        break; // 如果找到了就停止搜索
      } else {
        console.log(`   无价格数据`);
      }
    } catch (error) {
      console.log(`   错误: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testPriceAPI().catch(console.error);