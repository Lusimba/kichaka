# artfront/Dockerfile
FROM node:18-alpine AS build

WORKDIR /artfront

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Use nginx to serve the built files
FROM nginx:alpine
COPY --from=build /artfront/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]