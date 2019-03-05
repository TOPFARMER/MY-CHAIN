#pull from the official image
FROM node:alpine

WORKDIR /chain-sketch

COPY . /chain-sketch


RUN npm install

CMD npm start
