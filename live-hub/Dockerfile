FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./tsconfig.json
COPY src ./src

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
