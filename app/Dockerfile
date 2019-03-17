FROM node:8
EXPOSE 3000
WORKDIR /usr/src/app

#Install deps
COPY package*.json ./
RUN npm install

#Copy source code
COPY . .

CMD [ "npm", "start" ]
