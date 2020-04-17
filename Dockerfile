FROM node:4-onbuild

EXPOSE 5555

LABEL MAINTAINER="lakowske@gmail.com"

CMD node index.js 5555 ./public
