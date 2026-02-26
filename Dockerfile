FROM node:20.20-alpine AS builder
WORKDIR /app

# install frontend deps and build
# copy entire frontend so we can detect a prebuilt `frontend/dist`
COPY frontend/ frontend/

# If the frontend has a prebuilt `dist` directory present in the build context,
# skip installing/building front-end deps (useful to avoid remote registry issues).
RUN if [ -d frontend/dist ]; then \
    echo "Using prebuilt frontend/dist - skipping frontend install/build"; \
    else \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-factor 10 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm cache verify || true && \
    cd frontend && npm ci && npm run build; \
    fi

FROM node:20.20-alpine
WORKDIR /app

# install backend deps
COPY backend/package*.json backend/
RUN cd backend && npm ci --production
COPY backend/ backend/

# copy built frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

ENV PORT=8080
EXPOSE 8080

CMD ["node", "backend/src/server.js"]
