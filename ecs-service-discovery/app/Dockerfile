FROM node:19-alpine3.16
WORKDIR /app

COPY package*.json .
RUN npm ci
COPY index.js .

EXPOSE 3000

CMD [ "npm", "start" ]