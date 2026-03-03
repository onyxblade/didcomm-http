FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src/ src/
COPY scripts/ scripts/
COPY tsconfig.json ./

FROM build AS runtime
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["node", "--import", "tsx", "src/index.ts"]
