# artfront/Dockerfile
# --- Builder Stage ---
FROM node:18-slim AS builder

# Set build arguments and environment variables
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV \
    NPM_CONFIG_LOGLEVEL=error \
    NPM_CONFIG_CACHE=/tmp/npm-cache \
    PATH=/artfront/node_modules/.bin:$PATH 

WORKDIR /artfront

# Copy package files
COPY package*.json ./

# Install dependencies using cache mount
RUN --mount=type=cache,target=/tmp/npm-cache \
    npm install --production=false

# Copy source files
COPY . .

# Build for production
RUN if [ "$NODE_ENV" = "production" ]; then \
    npm run build && \
    npm prune --production; \ 
    fi

# --- Production Stage ---
FROM nginx:alpine AS production

COPY --from=builder /artfront/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# --- Development Stage ---
FROM builder AS development

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]