FROM jrottenberg/ffmpeg:3.3-alpine
FROM node:15-alpine

# copy ffmpeg bins from first image (greetz https://github.com/jrottenberg/ffmpeg/issues/99)
COPY --from=0 / /

# install youtube-dl
RUN apk --no-cache add curl python3 && ln -sf python3 /usr/bin/python
RUN curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl && chmod a+rx /usr/local/bin/youtube-dl


WORKDIR /futureporn
COPY . .
RUN npm install

CMD [ "npm", "run", "start" ]
