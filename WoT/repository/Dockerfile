FROM node:latest
WORKDIR /usr/src/repository
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 38080
CMD [ "node", "index.js" ]