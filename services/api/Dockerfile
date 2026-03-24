FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY services/api/package.json ./services/api/
COPY packages/ui/package.json ./packages/ui/
COPY packages/api/package.json ./packages/api/
COPY packages/app/package.json ./packages/app/
RUN pnpm install --frozen-lockfile --filter=@lustre/api-server

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/api/node_modules ./services/api/node_modules
COPY . .
RUN cd services/api && npx prisma generate && pnpm run build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/services/api/dist ./dist
COPY --from=build /app/services/api/node_modules ./node_modules
COPY --from=build /app/services/api/package.json ./
COPY --from=build /app/services/api/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/server.js"]
