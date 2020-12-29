FROM jrottenberg/ffmpeg:3.3-alpine
FROM node:14-alpine

# copy ffmpeg bins from first image (greetz https://github.com/jrottenberg/ffmpeg/issues/99)
COPY --from=0 / /

WORKDIR /futureporn
COPY . .

CMD [ "npm", "run", "start" ]
