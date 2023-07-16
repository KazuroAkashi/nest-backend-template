FROM node:alpine
WORKDIR /usr/src/app
ENV DEBUG=socket*
COPY package*.json .
COPY pnpm-lock.yaml .
RUN corepack pnpm install --shamefully-hoist
COPY . .
RUN corepack pnpx prisma generate
CMD [ "corepack", "pnpm", "test:all" ]