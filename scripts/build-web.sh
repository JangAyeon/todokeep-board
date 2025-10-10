#!/bin/bash
# scripts/build-web.sh - Vercel 배포용

set -e

echo "🚀 Starting Web build process..."
echo "📍 Current directory: $(pwd)"
echo "📂 Directory structure:"
ls -la

# 현재 위치 확인 및 조정
# Vercel이 어디서 실행하든 루트를 찾아감
if [ -f "package.json" ] && [ -d "packages" ]; then
  # 이미 루트에 있음
  echo "✅ Already at root directory"
  ROOT_DIR="."
elif [ -f "../package.json" ] && [ -d "../packages" ]; then
  # 한 단계 위가 루트
  echo "📍 Moving to parent directory (root)"
  cd ..
  ROOT_DIR="."
elif [ -f "../../package.json" ] && [ -d "../../packages" ]; then
  # 두 단계 위가 루트
  echo "📍 Moving to grandparent directory (root)"
  cd ../..
  ROOT_DIR="."
else
  echo "❌ Cannot find project root!"
  echo "Current location: $(pwd)"
  echo "Files here:"
  ls -la
  exit 1
fi

echo "✅ Found project root at: $(pwd)"
echo "📂 Root contents:"
ls -la

# 1. 의존성 설치
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# 2. shared 패키지 복사
echo "📋 Copying shared package to Web..."
rm -rf todokeep-nextjs/node_modules/@todokeep
mkdir -p todokeep-nextjs/node_modules/@todokeep
cp -r packages/shared todokeep-nextjs/node_modules/@todokeep/

echo "✅ Shared package copied successfully"
ls -la todokeep-nextjs/node_modules/@todokeep/

# 3. Next.js 빌드
echo "🏗️  Building Next.js app..."
cd todokeep-nextjs
pnpm build

echo "✅ Web build complete!"
echo "📊 Build output:"
ls -lh .next/