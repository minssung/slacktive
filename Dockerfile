FROM node:12-alpine
ENV NODE_ENV development
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install && npm install pm2 -g

EXPOSE 3000
CMD npm start