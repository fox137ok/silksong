#!/usr/bin/env node

/**
 * 快速API测试 - 验证nintendo-switch-eshop库基本功能
 */

import pkg from 'nintendo-switch-eshop';
const { getGamesAmerica } = pkg;

async function quickTest() {
  console.log('🧪 快速API测试...');
  
  try {
    console.log('尝试获取美国游戏列表...');
    
    // 设置5秒超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), 5000);
    });
    
    const gamesPromise = getGamesAmerica();
    
    const games = await Promise.race([gamesPromise, timeoutPromise]);
    
    console.log(`✅ 成功获取 ${games.length} 个游戏`);
    
    // 查找 Hollow Knight 相关游戏
    const hollowKnightGames = games.filter(game => 
      game.title.toLowerCase().includes('hollow knight')
    );
    
    console.log(`\n🔍 找到 ${hollowKnightGames.length} 个 Hollow Knight 相关游戏:`);
    hollowKnightGames.slice(0, 3).forEach(game => {
      console.log(`  - ${game.title}`);
    });
    
    console.log('\n✅ API测试成功');
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
}

quickTest();