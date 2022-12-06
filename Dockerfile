FROM node:18-alpine AS base
ENV ROOT=/app
ENV NODE_PATH=${ROOT}/node_modules
WORKDIR ${ROOT}
RUN apk --no-cache upgrade \
    && chown node:node ${ROOT}

FROM base AS build
COPY package-lock.json package.json app.js ${ROOT}
RUN npm ci --omit=dev

FROM base AS prod
COPY --chown=node:node --from=build ${ROOT} ${ROOT}
USER node
EXPOSE 3000
ENTRYPOINT [ "node", "app.js" ]
