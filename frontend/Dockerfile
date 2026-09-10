# ---- Stage 1: Build ----
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source and build for production
COPY . .
RUN npm run build -- --configuration production

# ---- Stage 2: Run ----
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy only what's needed to run the SSR server
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install only production dependencies (needed by the SSR server at runtime)
RUN npm ci --omit=dev

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Your project name in angular.json is "frontend", so the build output lands in dist/frontend
CMD ["node", "dist/frontend/server/server.mjs"]