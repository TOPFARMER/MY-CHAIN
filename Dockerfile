#pull from the official image
FROM node:alpine

WORKDIR /chain-sketch

COPY . /chain-sketch

# Set proxy server, replace host:port with values for your servers
#ENV http_proxy http://127.0.0.1:8123/
#ENV https_proxy http://127.0.0.1:8123/

RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cnpm install

CMD npm run dev