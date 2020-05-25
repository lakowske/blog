FROM gcr.io/coherent-coder-103403/blog-builder as builder

FROM node:14-slim
LABEL MAINTAINER="lakowske@gmail.com"
WORKDIR /home/node/app
COPY --from=builder /home/node/app/package.json .
RUN npm install --production
COPY --from=builder /home/node/app/src/index.js ./src/index.js
COPY --from=builder /home/node/app/index.json .
COPY --from=builder /home/node/app/public ./public


EXPOSE 8080
ENV PORT=8080

CMD npm run serve