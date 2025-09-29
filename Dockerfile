FROM node:20-alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install && cd client && npm install && npm run build && cd ../
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start"]