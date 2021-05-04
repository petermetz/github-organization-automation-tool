FROM node:16.0.0-buster-slim as builder

RUN apt-get update

WORKDIR /
RUN mkdir /app/
WORKDIR /app/
COPY ./ ./
RUN npm ci
RUN npm run build
RUN npm run test
RUN npm prune --production

FROM node:16.0.0-buster-slim as runner

USER root

COPY --chown=$APP_USER:$APP_USER --from=builder /app/ ${APP}

RUN mkdir -p "${APP}/log/"
RUN chown -R $APP_USER:$APP_USER "${APP}/log/"

ARG APP=/usr/src/app

RUN apt-get update
RUN apt-get install -y ca-certificates tzdata curl tini
RUN rm -rf /var/lib/apt/lists/*


ENV TZ=Etc/UTC \
    APP_USER=appuser

RUN groupadd $APP_USER \
    && useradd -g $APP_USER $APP_USER \
    && mkdir -p ${APP}

COPY --from=builder /app/ ${APP}/

RUN chown -R $APP_USER:$APP_USER ${APP}

USER $APP_USER
WORKDIR ${APP}

ENTRYPOINT [ "./bin/github-organization-automation-tool" ]
