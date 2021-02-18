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

# install system dependencies
RUN apk --no-cache add curl python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

# install s3cmd
RUN pip3 install s3cmd


WORKDIR /futureporn
COPY . .
RUN yarn install

CMD [ "yarn", "run", "start" ]
