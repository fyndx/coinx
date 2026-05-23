# ---- Stage 1: Build ----
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Copy dependency files and patches first for layer caching
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Set CI=true so package.json conditional skips lefthook install
ENV CI=true

# Build-time env vars — pass via --build-arg; baked into the client bundle
ARG EXPO_PUBLIC_APP_ENV=production
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ARG EXPO_PUBLIC_BACKEND_URL
ARG EXPO_PUBLIC_SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT

ENV EXPO_PUBLIC_APP_ENV=$EXPO_PUBLIC_APP_ENV \
    EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL \
    EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY \
    EXPO_PUBLIC_BACKEND_URL=$EXPO_PUBLIC_BACKEND_URL \
    EXPO_PUBLIC_SENTRY_DSN=$EXPO_PUBLIC_SENTRY_DSN \
    SENTRY_ORG=$SENTRY_ORG \
    SENTRY_PROJECT=$SENTRY_PROJECT

# Install pnpm and all dependencies (dev deps needed for expo export)
RUN npm install -g pnpm@11.2.2
RUN pnpm install --frozen-lockfile

# Copy full source
COPY . .

# Export Expo web app with server output
RUN pnpm exec expo export --platform web

# ---- Stage 2: Production runner ----
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Copy server entrypoint and package files
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install pnpm and only production dependencies
RUN npm install -g pnpm@11.2.2
RUN CI=true pnpm install --prod --frozen-lockfile

EXPOSE 3000

CMD ["node", "server.js"]
