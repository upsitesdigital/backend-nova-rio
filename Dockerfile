FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

COPY . .

RUN npm run build && npx tsc -p tsconfig.seed.json

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/dist ./dist
COPY --from=build /app/assets ./assets
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./

RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /app/uploads/receipts && chown -R appuser:appgroup /app/uploads
USER appuser

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && ([ -f dist/prisma/seed.js ] && node dist/prisma/seed.js || true) && node dist/main.js"]
