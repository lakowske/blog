FROM node:4-onbuild

EXPOSE 8080

MAINTAINER lakowske@gmail.com

CMD node index.js 8080 ./public
