#!/bin/bash

echo "启动空洞骑士：丝之歌价格对比网站..."
echo "================================"
echo ""

# 检查Python是否安装
if command -v python3 &> /dev/null; then
    echo "✅ 找到Python3，启动HTTP服务器..."
    echo "🌐 请在浏览器中访问: http://localhost:8000/prices.html"
    echo "⚠️  按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ 找到Python，启动HTTP服务器..."
    echo "🌐 请在浏览器中访问: http://localhost:8000/prices.html"
    echo "⚠️  按 Ctrl+C 停止服务器"
    echo ""
    python -m http.server 8000
else
    echo "❌ 未找到Python，请安装Python或使用其他方式启动HTTP服务器"
    echo ""
    echo "其他方式："
    echo "1. 如果安装了Node.js: npx http-server -p 8000"
    echo "2. 如果安装了PHP: php -S localhost:8000"
    exit 1
fi