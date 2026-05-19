FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV LIVE_PROXY_PORT=8787

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY deepgram-proxy.js ./deepgram-proxy.js

EXPOSE 8787

CMD ["node", "deepgram-proxy.js"]
