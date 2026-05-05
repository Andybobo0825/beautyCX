FROM node:22-alpine AS dependencies
WORKDIR /app
COPY serverclient/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

FROM node:22-alpine AS production
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/beautycx.sqlite
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY serverclient/ ./
COPY data/beautycx.sqlite ./data/beautycx.sqlite
EXPOSE 8080
CMD ["node", "server.js"]
