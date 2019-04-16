FROM node:10.15.3-alpine

# install dependencies
WORKDIR /opt/health-checker
COPY package.json package-lock.json ./
RUN npm cache clean --force && npm install

# copy app source to image _after_ npm install so that
# application code changes don't bust the docker cache of npm install step
COPY dist/*.js ./
COPY services.yaml services.yaml

# set application PORT and expose docker PORT, 80 is what Elastic Beanstalk expects

CMD [ "node", "index.js", "services.yaml" ]