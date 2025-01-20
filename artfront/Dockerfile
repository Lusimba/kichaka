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
    npm install

# Copy source files
COPY . .

# Build for production
RUN if [ "$NODE_ENV" = "production" ]; then \
    echo "PATH=$PATH" && \
    ls -la /artfront/node_modules/.bin && \
    which npm && \
    npm run build || echo "Build failed with $?"; \
    fi

# --- Production Stage ---
FROM caddy:2-alpine AS production

RUN adduser -D -u 1000 caddy && \
    mkdir -p /data/caddy /config/caddy && \
    chown -R caddy:caddy /data/caddy /config/caddy

COPY --from=builder /artfront/dist /usr/share/caddy

ENV XDG_CONFIG_HOME=/config \
    XDG_DATA_HOME=/data

USER caddy

EXPOSE 5173

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]

# --- Development Stage ---
FROM builder AS development

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]