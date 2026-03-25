# ── Build stage ────────────────────────────────────────────────────────────────
FROM elixir:1.17-alpine AS builder

RUN apk add --no-cache build-base git

WORKDIR /app

# Install hex and rebar
RUN mix local.hex --force && mix local.rebar --force

ENV MIX_ENV=prod

# Fetch dependencies first (Docker layer cache)
COPY mix.exs mix.lock* ./
RUN mix deps.get --only prod
RUN mix deps.compile

# Copy application source
COPY config ./config
COPY lib ./lib
COPY priv ./priv

# Build the release
RUN mix release

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM alpine:3.20 AS runtime

RUN apk add --no-cache libstdc++ openssl ncurses-libs

# Create non-root user
RUN addgroup -g 1001 -S realtime && adduser -u 1001 -S realtime -G realtime

WORKDIR /app

COPY --from=builder --chown=realtime:realtime /app/_build/prod/rel/realtime ./

USER realtime

ENV HOME=/app
ENV MIX_ENV=prod
ENV PORT=4001

EXPOSE 4001

CMD ["bin/realtime", "start"]
