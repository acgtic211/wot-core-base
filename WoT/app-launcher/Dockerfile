FROM node:latest
WORKDIR /usr/src/app-launcher
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 39080
CMD [ "node", "index.js" ]