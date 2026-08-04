# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package*.json prisma ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client & Build NestJS app
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/src/main.js"]
