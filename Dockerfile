FROM node:alpine AS builder

RUN apk update
RUN apk add python3 build-base

WORKDIR /app
COPY . .

RUN yarn
RUN yarn build

FROM node:alpine

WORKDIR /app

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/dist dist
COPY --from=builder /app/package.json ./

ENTRYPOINT yarn start