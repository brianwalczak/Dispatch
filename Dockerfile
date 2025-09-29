FROM node:20-alpine

WORKDIR /usr/src/app
COPY package*.json ./
COPY client/package*.json ./client/

RUN npm install && cd client && npm install
COPY . .

RUN cd client && npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
