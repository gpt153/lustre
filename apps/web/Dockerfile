FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/web/ ./apps/web/
COPY packages/ui/ ./packages/ui/
COPY packages/api/ ./packages/api/
COPY packages/app/ ./packages/app/
COPY services/api/package.json ./services/api/
COPY services/api/src/trpc/ ./services/api/src/trpc/
COPY services/api/tsconfig.json ./services/api/
RUN pnpm install --frozen-lockfile
RUN pnpm turbo build --filter=@lustre/web

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
