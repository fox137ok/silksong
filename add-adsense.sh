#!/bin/bash

# 此脚本用于批量添加AdSense代码到所有HTML文件的head标签中

# AdSense代码
ADSENSE_CODE='  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7912112964735452"
     crossorigin="anonymous"></script>'

# 处理函数
process_file() {
  local file="$1"
  echo "处理文件: $file"
  
  # 检查文件是否已包含AdSense代码
  if grep -q "ca-pub-7912112964735452" "$file"; then
    echo "  已包含AdSense代码，跳过"
    return
  fi
  
  # 在</script>和下一个标签之间添加AdSense代码
  # 查找gtag配置后的</script>标签
  sed -i '' -e '/gtag.*config.*G-Z2BZFZX1ZW/,/<\/script>/!b;/<\/script>/a\
'"$ADSENSE_CODE"'' "$file"
  
  echo "  已添加AdSense代码"
}

# 主函数
main() {
  # 处理所有HTML文件
  find . -name "*.html" | while read -r file; do
    process_file "$file"
  done
  
  echo "所有HTML文件处理完成"
}

# 执行主函数
main
