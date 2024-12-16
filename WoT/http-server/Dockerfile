FROM node:latest
WORKDIR /usr/src/http-server
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 38090
#EXPOSE 443
CMD [ "node", "index.js" ]