FROM node:17-alpine
WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY package*.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

CMD ["yarn", "start"]
