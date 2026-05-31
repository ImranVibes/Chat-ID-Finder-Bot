# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

# Long-polling bots do not require any open ports or incoming traffic
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
