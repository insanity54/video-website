#ripper

@todo

the problem here is that voddo is returning an incorrect filename.

"https://twitch.tv/dj_crispy stream has completed. Stream saved to [twitch:stream] dj_crispy: Downloading stream GraphQL" WRONG!

This must be a flaw in voddo.parseOutput()

```
chris@ti83plus:~/Documents/video-website$ yarn run start
yarn run v1.22.10
$ node index
ripping https://twitch.tv/dj_crispy ASAP.
[WARN] This Redis server's `default` user does not require a password, but a password was supplied
[WARN] This Redis server's `default` user does not require a password, but a password was supplied
  voddo response:[twitch:stream] dj_crispy: Downloading stream GraphQL
  voddo [twitch:stream] dj_crispy: Downloading stream access token GraphQL
  voddo [twitch:stream] 41307333406: Downloading m3u8 information
  voddo [download] Destination: dj_crispy (live) 2021-01-13 21_34-41307333406.mp4
[ffmpeg] Downloaded 37089864 bytes
[download] 100% of 35.37MiB in 02:07
  voddo , delay:5000 +0ms
https://twitch.tv/dj_crispy stream has completed. Stream saved to [twitch:stream] dj_crispy: Downloading stream GraphQL
[twitch:stream] dj_crispy: Downloading stream access token GraphQL
[twitch:stream] 41307333406: Downloading m3u8 information
[download] Destination: dj_crispy (live) 2021-01-13 21_34-41307333406.mp4
[ffmpeg] Downloaded 37089864 bytes
[download] 100% of 35.37MiB in 02:07

  video-website generating a video preview for [twitch:stream] dj_crispy: Downloading stream GraphQL
  video-website [twitch:stream] dj_crispy: Downloading stream access token GraphQL
  video-website [twitch:stream] 41307333406: Downloading m3u8 information
  video-website [download] Destination: dj_crispy (live) 2021-01-13 21_34-41307333406.mp4
[ffmpeg] Downloaded 37089864 bytes
[download] 100% of 35.37MiB in 02:07
  video-website  +0ms
node:internal/process/promises:227
          triggerUncaughtException(err, true /* fromPromise */);
          ^

Error: ffprobe exited with code 1
ffprobe version 4.2.4-1ubuntu0.1 Copyright (c) 2007-2020 the FFmpeg developers
  built with gcc 9 (Ubuntu 9.3.0-10ubuntu2)
  configuration: --prefix=/usr --extra-version=1ubuntu0.1 --toolchain=hardened --libdir=/usr/lib/x86_64-linux-gnu --incdir=/usr/include/x86_64-linux-gnu --arch=amd64 --enable-gpl --disable-stripping --enable-avresample --disable-filter=resample --enable-avisynth --enable-gnutls --enable-ladspa --enable-libaom --enable-libass --enable-libbluray --enable-libbs2b --enable-libcaca --enable-libcdio --enable-libcodec2 --enable-libflite --enable-libfontconfig --enable-libfreetype --enable-libfribidi --enable-libgme --enable-libgsm --enable-libjack --enable-libmp3lame --enable-libmysofa --enable-libopenjpeg --enable-libopenmpt --enable-libopus --enable-libpulse --enable-librsvg --enable-librubberband --enable-libshine --enable-libsnappy --enable-libsoxr --enable-libspeex --enable-libssh --enable-libtheora --enable-libtwolame --enable-libvidstab --enable-libvorbis --enable-libvpx --enable-libwavpack --enable-libwebp --enable-libx265 --enable-libxml2 --enable-libxvid --enable-libzmq --enable-libzvbi --enable-lv2 --enable-omx --enable-openal --enable-opencl --enable-opengl --enable-sdl2 --enable-libdc1394 --enable-libdrm --enable-libiec61883 --enable-nvenc --enable-chromaprint --enable-frei0r --enable-libx264 --enable-shared
  libavutil      56. 31.100 / 56. 31.100
  libavcodec     58. 54.100 / 58. 54.100
  libavformat    58. 29.100 / 58. 29.100
  libavdevice    58.  8.100 / 58.  8.100
  libavfilter     7. 57.100 /  7. 57.100
  libavresample   4.  0.  0 /  4.  0.  0
  libswscale      5.  5.100 /  5.  5.100
  libswresample   3.  5.100 /  3.  5.100
  libpostproc    55.  5.100 / 55.  5.100
[twitch:stream] dj_crispy: Downloading stream GraphQL
[twitch:stream] dj_crispy: Downloading stream access token GraphQL
[twitch:stream] 41307333406: Downloading m3u8 information
[download] Destination: dj_crispy (live) 2021-01-13 21_34-41307333406.mp4
[ffmpeg] Downloaded 37089864 bytes
[download] 100% of 35.37MiB in 02:07
: File name too long

    at ChildProcess.<anonymous> (/home/chris/Documents/video-website/node_modules/fluent-ffmpeg/lib/ffprobe.js:233:22)
    at ChildProcess.emit (node:events:376:20)
    at Process.ChildProcess._handle.onexit (node:internal/child_process:284:12)
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
chris@ti83plus:~/Documents/video-website$
```
