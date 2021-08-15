FROM node:14-slim as builder

LABEL MAINTAINER="lakowske@gmail.com"
WORKDIR /home/node/app
COPY . .
RUN npm install
RUN npm run index
RUN npm run build
