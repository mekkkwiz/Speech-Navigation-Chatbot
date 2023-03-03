FROM node:16-alpine

WORKDIR /app

COPY package.json yarn.lock ./
COPY server ./server
COPY index.js ./index.js

RUN yarn install

COPY client_v2/pages ./client_v2/pages
COPY client_v2/public ./client_v2/public
COPY client_v2/redux ./client_v2/redux
COPY client_v2/styles ./client_v2/styles

COPY client_v2/next-env.d.ts ./client_v2/next-env.d.ts
COPY client_v2/next.config.js ./client_v2/next.config.js
COPY client_v2/package-lock.json client_v2/package-lock.json
COPY client_v2/package.json client_v2/package.json
COPY client_v2/tailwind.config.js ./client_v2/tailwind.config.js
COPY client_v2/postcss.config.js ./client_v2/postcss.config.js
COPY client_v2/tsconfig.json ./client_v2/tsconfig.json

WORKDIR /app/client_v2
RUN yarn install

WORKDIR /app

CMD ["yarn", "dev"]

EXPOSE 3000
EXPOSE 5000