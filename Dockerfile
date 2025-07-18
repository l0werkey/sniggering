# Use the official Bun image as base
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Copy package.json and bun.lockb for dependency installation
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Command to run the application
CMD ["bun", "run", "index.ts"]