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



# FROM node:16.15.1 as base

# FROM base as dev
# ENV NODE_ENV=development
# COPY . /src
# # вывести в консоль RUN
# RUN echo "RUN: dev"
# # пауза на 6 секунд
# RUN sleep 5
# WORKDIR /src
# # RUN rm -rf node_modules/
# #RUN npm install forever -g
# #RUN npm i -y --force
# RUN npm rebuild
#RUN npm uninstall bcrypt
#RUN npm install bcryptjs --save
#RUN npm install nodemon -g

# RUN npm install node-gyp
# RUN npm install bcrypt 
# RUN npm install bcrypt

