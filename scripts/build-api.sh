#!/bin/bash
# scripts/build-api.sh - Render 백엔드 배포 스크립트

set -e  # 에러 발생 시 즉시 중단

echo "🚀 Starting API build process..."

# 1. 의존성 설치
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# 2. shared 패키지 복사
echo "📋 Copying shared package to API..."
rm -rf todokeep-api/node_modules/@todokeep
mkdir -p todokeep-api/node_modules/@todokeep
cp -r packages/shared todokeep-api/node_modules/@todokeep/

# 3. API 빌드
echo "🏗️  Building API..."
cd todokeep-api
pnpm build

echo "✅ API build complete!"
echo "📊 Build output:"
ls -lh dist/