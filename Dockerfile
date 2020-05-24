FROM node:14-slim

LABEL MAINTAINER="lakowske@gmail.com"
WORKDIR /home/node/app
COPY . .
RUN npm install
RUN npm run index

EXPOSE 8080
ENV PORT=8080

CMD npm run serve