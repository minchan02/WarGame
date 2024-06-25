FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod -R 444 /app

EXPOSE 4001

CMD ["node", "index.js"]