# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies for building
RUN npm ci

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Generate Prisma client and compile TypeScript to JS
RUN npx prisma generate
RUN npm run build

# Clean dev dependencies out of node_modules to optimize production size
RUN npm prune --production

# Stage 2: Production runtime stage
FROM node:18-alpine AS runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/src/main"]
