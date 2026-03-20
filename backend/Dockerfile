FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# prisma schema (루트 기준 build context)
COPY prisma ./prisma

# backend 의존성 설치
COPY backend/package.json ./
COPY backend/tsconfig.json ./
COPY backend/tsconfig.build.json ./
COPY backend/nest-cli.json ./

RUN npm install

COPY backend/src ./src

RUN npx prisma generate --schema=./prisma/schema.prisma

RUN npm run build

FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

COPY backend/package.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss && node dist/src/main"]
