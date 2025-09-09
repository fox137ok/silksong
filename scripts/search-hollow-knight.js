#!/usr/bin/env node

/**
 * 搜索 Hollow Knight 系列游戏
 */

import pkg from 'nintendo-switch-eshop';
const { getGamesEurope, parseNSUID, getPrices } = pkg;

async function searchHollowKnight() {
  console.log('🔍 搜索 Hollow Knight 游戏...\n');
  
  try {
    console.log('正在获取欧洲地区游戏列表...');
    const games = await getGamesEurope();
    console.log(`获取到 ${games.length} 个游戏\n`);
    
    const hollowKnightGames = games.filter(game => {
      const title = game.title ? game.title.toLowerCase() : '';
      return title.includes('hollow knight') || 
             title.includes('silksong');
    });
    
    console.log(`找到 ${hollowKnightGames.length} 个 Hollow Knight 相关游戏:\n`);
    
    for (const game of hollowKnightGames) {
      const nsuid = parseNSUID(game, 'EU');
      console.log(`🎮 游戏: ${game.title}`);
      console.log(`   NSUID: ${nsuid || '未找到'}`);
      console.log(`   发布商: ${game.publisher || '未知'}`);
      console.log(`   开发商: ${game.developer || '未知'}`);
      console.log(`   发布日期: ${game.releaseDate || '未知'}`);
      console.log(`   分类: ${Array.isArray(game.categories) ? game.categories.join(', ') : (game.categories || '未知')}`);
      
      // 如果找到NSUID，尝试获取价格
      if (nsuid) {
        try {
          console.log(`   正在获取价格信息...`);
          const prices = await getPrices('GB', nsuid);
          if (prices && prices.length > 0) {
            const price = prices[0];
            console.log(`   英国价格: £${price.regular_price?.amount || 'N/A'}`);
            if (price.discount_price) {
              console.log(`   折扣价: £${price.discount_price.amount}`);
            }
          } else {
            console.log(`   价格: 无价格信息`);
          }
        } catch (priceError) {
          console.log(`   价格获取失败: ${priceError.message}`);
        }
      }
      console.log(`   -------\n`);
    }
    
    // 如果没找到Silksong，查看是否有其他可能的名称
    console.log('🔍 搜索可能的其他名称...');
    const possibleNames = ['silk song', 'knight silk', 'team cherry'];
    for (const name of possibleNames) {
      const matches = games.filter(game => {
        const title = game.title ? game.title.toLowerCase() : '';
        return title.includes(name.toLowerCase());
      });
      
      if (matches.length > 0) {
        console.log(`\n找到匹配 "${name}" 的游戏:`);
        matches.slice(0, 3).forEach(game => {
          console.log(`  - ${game.title}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 搜索失败:', error.message);
    console.error('详细错误:', error);
  }
}

searchHollowKnight();