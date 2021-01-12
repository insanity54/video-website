FROM jrottenberg/ffmpeg:3.3-alpine
FROM node:15-alpine

# copy ffmpeg bins from first image (greetz https://github.com/jrottenberg/ffmpeg/issues/99)
COPY --from=0 / /

# this hack invalidates the cache (see https://github.com/caprover/caprover/issues/381)
ADD https://www.google.com /time.now

# install youtube-dl
RUN apk --no-cache add curl python3 && ln -sf python3 /usr/bin/python
RUN curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl && chmod a+rx /usr/local/bin/youtube-dl


WORKDIR /futureporn
COPY . .
RUN yarn install

CMD [ "yarn", "run", "start" ]
