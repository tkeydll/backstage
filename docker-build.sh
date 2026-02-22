#!/bin/bash
# Backstage Docker Multi-stage Build Script
# This script builds the Backstage application using Docker multi-stage build

set -e

# Default values
TAG="backstage:multistage"
USE_BUILDKIT=true
MEMORY=8192

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        --no-buildkit)
            USE_BUILDKIT=false
            shift
            ;;
        -m|--memory)
            MEMORY="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -t, --tag TAG      Docker image tag (default: backstage:multistage)"
            echo "  --no-buildkit      Disable Docker BuildKit"
            echo "  -m, --memory MB    Node.js memory limit in MB (default: 8192)"
            echo "  -h, --help         Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "🚀 Building Backstage with Docker multi-stage build..."
echo "📦 Target image: $TAG"

# Enable Docker BuildKit for better caching and performance (unless disabled)
if [ "$USE_BUILDKIT" = true ]; then
    export DOCKER_BUILDKIT=1
    echo "✅ Docker BuildKit enabled"
else
    echo "⚠️  Docker BuildKit disabled"
fi

# Build the Docker image
echo "📋 Building Docker image..."
echo "💾 Using Node.js memory limit: ${MEMORY}MB"
if docker image build . -f packages/backend/Dockerfile -t "$TAG" --build-arg NODE_OPTIONS="--max-old-space-size=$MEMORY"; then
    echo "✅ Build completed successfully!"
    echo "🐳 To run the container:"
    echo "   docker run -it -p 7007:7007 $TAG"
else
    echo "❌ Build failed!"
    exit 1
fi