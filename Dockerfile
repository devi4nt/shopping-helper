FROM node:22-slim AS base

RUN corepack enable pnpm

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm prisma generate

# Build application
COPY . .
RUN pnpm build

# Production stage
FROM node:22-slim AS production

WORKDIR /app

# Copy built output and prisma files
COPY --from=base /app/.output ./.output
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/prisma.config.ts ./
COPY --from=base /app/node_modules/.pnpm/@prisma+engines*/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --from=base /app/package.json ./

RUN corepack enable pnpm

# Install only production deps needed for prisma migrate
COPY --from=base /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node .output/server/index.mjs"]
