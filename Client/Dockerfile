FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM dependencies AS build
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production
ENV API_UPSTREAM=127.0.0.1:8080
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
