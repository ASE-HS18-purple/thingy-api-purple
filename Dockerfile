FROM node as server

WORKDIR /usr/deployment/thingy-api-purple

COPY . .
RUN npm install --save-prod
RUN npm run build
RUN cp -r ./src/config ./dist/config
RUN ls -a ./dist/config
RUN npm install nodemon -g
ENTRYPOINT ["nodemon", "./dist/index.js"]
EXPOSE 3000

