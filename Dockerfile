FROM jrottenberg/ffmpeg:3.3-alpine
FROM node:15-alpine

# set the timezone
RUN apk add tzdata
ENV TZ="America/New_York"
RUN ls /usr/share/zoneinfo && \
  cp /usr/share/zoneinfo/America/Los_Angeles /etc/localtime && \
  echo "America/New_York" > /etc/timezone

# this hack invalidates the cache (see https://github.com/caprover/caprover/issues/381)
ADD https://www.google.com /time.now

# copy ffmpeg bins from first image (greetz https://github.com/jrottenberg/ffmpeg/issues/99)
COPY --from=0 / /

# install python for youtube-dl
RUN apk --no-cache add curl python3 && ln -sf python3 /usr/bin/python

# install s3cmd for backups
RUN apk s3cmd


WORKDIR /futureporn
COPY . .
RUN yarn install

CMD [ "yarn", "run", "start" ]
