# docker build -t with_ignore -f Dockerfile . 
# docker run --rm with_ignore git
FROM node:16.15.1 as base
ENV NODE_ENV=development
COPY package*.json ./
WORKDIR /src
RUN npm install
# подключить порты 40 443 80 
EXPOSE 3000 8443 8080 8443

CMD [ "npm", "run", "dev" ]
