FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json .
COPY pnpm-lock.yaml .
#RUN npm ci --only=production
#RUN yarn install --frozen-lockfile --prod
ENV NODE_ENV "production"
RUN corepack pnpm install --frozen-lockfile --shamefully-hoist
COPY . .
RUN corepack pnpx prisma generate
EXPOSE ${PORT}
RUN corepack pnpm build
CMD [ "node", "./dist/main" ]