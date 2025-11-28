# ---- Base builder image ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ---- Production image ----
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Only install production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# If you need any static assets/templates, copy them too, e.g.:
# COPY --from=builder /app/public ./public

EXPOSE 3001
CMD ["node", "dist/main.js"]