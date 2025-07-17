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

# Expose port (optional, depends on your app needs)
# EXPOSE 3000

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bunuser -u 1001

# Change ownership of the app directory to the non-root user
RUN chown -R bunuser:nodejs /app

# Switch to non-root user
USER bunuser

# Command to run the application
CMD ["bun", "run", "index.ts"]