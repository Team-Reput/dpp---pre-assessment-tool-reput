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

# Angular 18 SSR build output is typically dist/dpp_leads_dashboard/server/server.mjs
# Update dpp_leads_dashboard below to match the "name" field in your angular.json / package.json
CMD ["node", "dist/dpp_leads_dashboard/server/server.mjs"]