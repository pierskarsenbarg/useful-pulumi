FROM node:15-alpine as build
WORKDIR /app
COPY package.json .
RUN npm install
COPY index.js .
FROM node:15-alpine
WORKDIR /app
COPY --from=build /app .
EXPOSE 80
CMD [ "npm", "start" ]