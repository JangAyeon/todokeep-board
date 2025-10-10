#!/bin/bash
# scripts/build-web.sh - Vercel 프론트엔드 배포 스크립트

set -e

echo "🚀 Starting Web build process..."
echo "📍 Current directory: $(pwd)"
echo "📂 Directory contents:"
ls -la

# 1. 의존성 설치
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# 2. shared 패키지 복사
echo "📋 Copying shared package to Web..."
rm -rf todokeep-nextjs/node_modules/@todokeep
mkdir -p todokeep-nextjs/node_modules/@todokeep
cp -r packages/shared todokeep-nextjs/node_modules/@todokeep/

echo "✅ Shared package copied"
ls -la todokeep-nextjs/node_modules/@todokeep/

# 3. Next.js 빌드
echo "🏗️  Building Next.js app..."
cd todokeep-nextjs
pnpm build

echo "✅ Web build complete!"
echo "📊 Build output:"
ls -lh .next/