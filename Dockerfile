FROM node:14-slim

LABEL MAINTAINER="lakowske@gmail.com"
WORKDIR /home/node/app
COPY . .

EXPOSE 8080

CMD npm run serve
