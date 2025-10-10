#!/bin/bash
# scripts/test-build.sh - 로컬에서 배포 전 테스트

set -e

echo "🧪 Testing build process locally..."

# 클린업
echo "🧹 Cleaning previous builds..."
rm -rf todokeep-api/dist
rm -rf todokeep-nextjs/.next
rm -rf todokeep-api/node_modules/@todokeep
rm -rf todokeep-nextjs/node_modules/@todokeep

# API 빌드 테스트
echo ""
echo "==================================="
echo "📡 Testing API Build"
echo "==================================="
bash scripts/build-api.sh

# Web 빌드 테스트
echo ""
echo "==================================="
echo "🌐 Testing Web Build"
echo "==================================="
bash scripts/build-web.sh

echo ""
echo "✅ All builds successful!"
echo "🎉 Ready to deploy!"