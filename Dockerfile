FROM node:10.15.3-alpine

WORKDIR /opt/health-checker

COPY package*.json dist/*.js ./

RUN npm ci --only=production

CMD [ "node", "cli.js" ]