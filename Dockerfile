FROM node:alpine3.16 AS builder

RUN apk update
RUN apk add python3 build-base 

WORKDIR /app
COPY . .

RUN yarn global add pnpm

RUN pnpm install
RUN pnpm build

FROM node:alpine

RUN yarn global add pnpm

WORKDIR /app

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/dist dist
COPY --from=builder /app/package.json ./

ENTRYPOINT pnpm start
