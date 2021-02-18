---
layout: layouts/info.njk
title: About
templateClass: tmpl-Info
eleventyNavigation:
  key: About
  order: 3
---

FuturePorn is a [ProjektMelody](https://twitter.com/projektmelody) fan website made by [CJ Crispy](https://grimtech.net/about).

## Why this website exists

I created this website because I love naps. While napping, I often missed Melody's Chaturbate streams. Her Chaturbate VODs eventually appear on her [PornHub](https://www.pornhub.com/model/projekt-melody), but that seems to be a manual process that often takes a day or more. I got bummed out about having to wait, so I got to work making an automated way to record her streams, and never miss a thing!

## What are these IPFS hash thingies?

FuturePorn serves all image thumbnails and video using [IPFS, the Inter-Planetary File System](https://ipfs.io). IPFS is a new and exciting way of saving and accessing data on the internet.

IPFS introduces the concept of file pinning, which is a fancy way of mirroring a file. People who run an IPFS node on their computer can pin files they like, and immediately the file is replicated to their computer and can be served to other people who want access to that same file.

File servers can come and go, yet the content stays accessible so long as the file remains popular enough to be pinned by people willing to share their bandwidth.

As the name implies, IPFS is built to be a filesystem for the new space age.

_Let's make ProjektMelody the first porn on Mars!_ 🌎📡🚀🌌


## Why do the videos load so slow?

### Reason 1. There aren't enough pins.

As a file becomes more popular and more pinned, IPFS enables faster download times because bits of the file are coming from several severs instead of just one.

As a hobby and a public service, I provide 1 pin of every video file. Beyond that, it's up to the science team!


### Reason 2. The public IPFS gateway is overloaded.

The public IPFS gateway is what lets your computer pull data from IPFS without having to run IPFS yourself. There are a lot of other people using the gateway, so it can be slow. 

There is the potential for achieving faster download speeds if you bypass the public IPFS gateway completely by running your own IPFS daemon.


## Do I need to run IPFS on my computer to use this website?

No. Running IPFS on your computer is completely optional, but if you'd like to get started, I recommend [IPFS Desktop](https://docs.ipfs.io/install/ipfs-desktop/) for easily running a daemon, and [IPFS Companion](https://docs.ipfs.io/install/ipfs-companion/) for integrating IPFS into your web browser.


## About the Developer

https://grimtech.net/about/

Are you in need of a web developer? I am in need of work! Contact me via [e-mail](mailto:chris@grimtech.net) or see [my contact page](https://grimtech.net/contact) for alternative methods.
