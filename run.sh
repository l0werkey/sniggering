#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Discord Bot with Docker...${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo -e "${YELLOW}Please create a .env file with your DISCORD_TOKEN${NC}"
    echo -e "${YELLOW}You can copy from .env.example:${NC}"
    echo "cp .env.example .env"
    echo "Then edit .env with your actual Discord token"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running!${NC}"
    echo -e "${YELLOW}Please start Docker and try again${NC}"
    exit 1
fi

# Load environment variables from .env file
set -a
source .env
set +a

# Validate that DISCORD_TOKEN is set
if [ -z "$DISCORD_TOKEN" ]; then
    echo -e "${RED}❌ Error: DISCORD_TOKEN not found in .env file!${NC}"
    echo -e "${YELLOW}Please add your Discord bot token to the .env file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables loaded${NC}"
echo -e "${GREEN}🔧 Building and starting the bot...${NC}"

# Build and run the container
docker-compose up --build

echo -e "${GREEN}🛑 Bot stopped${NC}"