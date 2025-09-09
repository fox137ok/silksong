#!/usr/bin/env node

/**
 * Nintendo Switch eShop API 测试脚本
 * 用于验证 nintendo-switch-eshop 库的基本功能
 */

import pkg from 'nintendo-switch-eshop';
const {
  getGamesAmerica,
  getGamesEurope, 
  getGamesJapan,
  getPrices,
  getShopsEurope,
  getShopsAmerica,
  getShopsAsia,
  parseNSUID
} = pkg;

async function testBasicAPI() {
  console.log('🎮 测试 Nintendo Switch eShop API\n');

  try {
    // 测试获取商店列表
    console.log('1. 获取可用商店...');
    const europeShops = await getShopsEurope();
    const americaShops = await getShopsAmerica();
    const asiaShops = await getShopsAsia();
    
    console.log(`   欧洲商店数量: ${europeShops.length}`);
    console.log(`   美洲商店数量: ${americaShops.length}`);
    console.log(`   亚洲商店数量: ${asiaShops.length}`);

    // 展示部分商店
    console.log('\n   部分欧洲商店:');
    europeShops.slice(0, 5).forEach(shop => {
      console.log(`   - ${shop.country} (${shop.code})`);
    });

    // 测试搜索游戏（使用原作 Hollow Knight 作为示例）
    console.log('\n2. 搜索 Hollow Knight 游戏...');
    const usGames = await getGamesAmerica();
    const hollowKnightGames = usGames.filter(game => 
      game.title.toLowerCase().includes('hollow knight')
    );

    console.log(`   找到 ${hollowKnightGames.length} 个相关游戏:`);
    hollowKnightGames.forEach(game => {
      console.log(`   - ${game.title} (NSUID: ${parseNSUID(game, 'US')})`);
    });

    // 如果找到了 Hollow Knight，测试价格获取
    if (hollowKnightGames.length > 0) {
      const game = hollowKnightGames[0];
      const nsuid = parseNSUID(game, 'US');
      
      if (nsuid) {
        console.log(`\n3. 获取 ${game.title} 在不同地区的价格...`);
        
        const countries = ['US', 'GB', 'JP', 'DE'];
        const results = await Promise.allSettled(
          countries.map(async country => {
            const prices = await getPrices(country, nsuid);
            return { country, prices };
          })
        );

        results.forEach((result, index) => {
          const country = countries[index];
          if (result.status === 'fulfilled') {
            const { prices } = result.value;
            if (prices && prices.length > 0) {
              const price = prices[0];
              console.log(`   ${country}: ${price.regular_price?.currency} ${price.regular_price?.amount || 'N/A'}`);
            } else {
              console.log(`   ${country}: 无价格信息`);
            }
          } else {
            console.log(`   ${country}: API错误 - ${result.reason.message}`);
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

async function searchSilksong() {
  console.log('\n4. 搜索 Silksong...');
  
  try {
    const regions = [
      { name: 'US', getter: getGamesAmerica },
      { name: 'EU', getter: getGamesEurope },
      { name: 'JP', getter: getGamesJapan }
    ];

    for (const region of regions) {
      console.log(`\n   搜索 ${region.name} 地区...`);
      const games = await region.getter();
      const silksongGames = games.filter(game => 
        game.title.toLowerCase().includes('silksong') ||
        game.title.toLowerCase().includes('silk song')
      );

      if (silksongGames.length > 0) {
        console.log(`   🎉 在 ${region.name} 找到 Silksong!`);
        silksongGames.forEach(game => {
          console.log(`   - ${game.title}`);
          console.log(`     NSUID: ${parseNSUID(game, region.name)}`);
          console.log(`     发布日期: ${game.releaseDate || '未知'}`);
        });
      } else {
        console.log(`   ❌ 在 ${region.name} 未找到 Silksong`);
      }
    }
  } catch (error) {
    console.error('搜索 Silksong 时出错:', error.message);
  }
}

// 运行测试
console.log('开始测试 Nintendo eShop API...\n');

testBasicAPI()
  .then(() => searchSilksong())
  .then(() => {
    console.log('\n✅ API 测试完成');
    console.log('\n💡 提示:');
    console.log('   - 如果 Silksong 未找到，说明游戏还未在 eShop 上架');
    console.log('   - 可以使用原作 Hollow Knight 的数据结构作为参考');
    console.log('   - 等游戏上架后，可以使用相同的方法获取真实价格');
  })
  .catch(error => {
    console.error('❌ 测试过程中出现错误:', error);
    process.exit(1);
  });