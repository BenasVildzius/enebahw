FROM node:18-alpine AS builder
WORKDIR /app

# install frontend deps and build
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci
COPY frontend/ frontend/
RUN cd frontend && npm run build

FROM node:18-alpine
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
