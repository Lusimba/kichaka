# artfront/Dockerfile
# --- Builder Stage ---
FROM node:18-slim AS builder

WORKDIR /artfront

# Copy package files
COPY package*.json ./

# Install ALL dependencies because we need them for build
RUN npm ci   # Faster and more reliable than npm install

# Copy source files
COPY . .

# Build for production
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine AS production

# Only copy the built files - no node_modules, source, etc.
COPY --from=builder /artfront/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# --- Development Stage ---
FROM node:18-slim AS development

WORKDIR /artfront

# Copy package files
COPY package*.json ./

# Install ALL dependencies for development
RUN npm ci

# We'll mount the source code at runtime
# This stage is used for development

EXPOSE 5173

# Run Vite dev server with host flag to allow external connections
CMD ["npm", "run", "dev", "--", "--host"]