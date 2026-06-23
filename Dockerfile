FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 zerobug && \
    adduser --system --uid 1001 zerobug

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json package-lock.json ./

RUN mkdir -p logs && chown zerobug:zerobug logs

USER zerobug

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
