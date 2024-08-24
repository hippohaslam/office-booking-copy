FROM node:20.13.1

WORKDIR /app

COPY . .

RUN rm -rf node_modules
RUN rm -rf certs


RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN corepack enable
RUN yarn install

CMD ["yarn", "dev"]