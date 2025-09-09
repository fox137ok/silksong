#!/usr/bin/env node

/**
 * 搜索空洞骑士：丝之歌的NSUID
 */

import pkg from 'nintendo-switch-eshop';
const {
  getGamesAmerica,
  getGamesEurope, 
  getGamesJapan,
  parseNSUID
} = pkg;

async function findSilksong() {
  console.log('🔍 搜索空洞骑士：丝之歌的NSUID...\n');
  
  const regions = [
    { name: 'US', getter: getGamesAmerica },
    { name: 'EU', getter: getGamesEurope },
    { name: 'JP', getter: getGamesJapan }
  ];

  const searchTerms = [
    'hollow knight silksong',
    'silksong',
    'hollow knight: silksong'
  ];

  for (const region of regions) {
    console.log(`\n🌍 搜索 ${region.name} 地区...`);
    
    try {
      console.log('   正在获取游戏列表...');
      const games = await region.getter();
      console.log(`   获取到 ${games.length} 个游戏`);
      
      for (const term of searchTerms) {
        const foundGames = games.filter(game => 
          game.title && game.title.toLowerCase().includes(term.toLowerCase())
        );
        
        if (foundGames.length > 0) {
          console.log(`\n   🎉 找到匹配 "${term}" 的游戏:`);
          foundGames.forEach(game => {
            const nsuid = parseNSUID(game, region.name);
            console.log(`     - 标题: ${game.title}`);
            console.log(`       NSUID: ${nsuid || '未找到'}`);
            console.log(`       发布日期: ${game.releaseDate || '未知'}`);
            console.log(`       开发商: ${game.developer || '未知'}`);
            console.log(`       -------`);
          });
        }
      }
      
      // 如果没有找到Silksong，尝试搜索Hollow Knight
      const hollowKnightGames = games.filter(game => 
        game.title && game.title.toLowerCase().includes('hollow knight')
      );
      
      if (hollowKnightGames.length > 0) {
        console.log(`\n   📖 找到 Hollow Knight 相关游戏 ${hollowKnightGames.length} 个:`);
        hollowKnightGames.slice(0, 3).forEach(game => {
          const nsuid = parseNSUID(game, region.name);
          console.log(`     - ${game.title} (NSUID: ${nsuid || '未找到'})`);
        });
      }
      
    } catch (error) {
      console.error(`   ❌ ${region.name} 地区搜索失败:`, error.message);
    }
  }
  
  console.log('\n💡 提示:');
  console.log('   - 如果找到了Silksong的NSUID，请记录下来用于价格获取');
  console.log('   - 可以使用原作Hollow Knight的NSUID作为参考');
  console.log('   - 确保游戏确实已在相应地区的eShop发售');
}

findSilksong().catch(error => {
  console.error('❌ 搜索失败:', error);
  process.exit(1);
});