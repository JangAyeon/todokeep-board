#!/bin/bash
# scripts/setup.sh - 스크립트 실행 권한 부여

echo "🔧 Setting up deployment scripts..."

chmod +x scripts/build-api.sh
chmod +x scripts/build-web.sh
chmod +x scripts/test-build.sh
chmod +x scripts/setup.sh

echo "✅ All scripts are now executable!"
echo ""
echo "Available commands:"
echo "  ./scripts/build-api.sh  - Build API for Render"
echo "  ./scripts/build-web.sh  - Build Web for Vercel"
echo "  ./scripts/test-build.sh - Test both builds locally"