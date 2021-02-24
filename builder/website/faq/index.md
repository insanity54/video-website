---
layout: layouts/info.njk
title: FAQ
templateClass: tmpl-Info
eleventyNavigation:
  key: FAQ
  order: 3
---

Frequently Asked Questions

## What are these IPFS hash thingies?

FuturePorn serves all image thumbnails and video using [IPFS, the Inter-Planetary File System](https://ipfs.io). IPFS is a new and exciting way of saving and accessing data on the internet.

IPFS introduces the concept of file pinning, which is a fancy way of mirroring a file. People who run an IPFS node on their computer can pin files they like, which replicates the file on their computer and optionally serves it to other people who want access to that same file.

File servers can come and go, yet the content stays accessible so long as the file remains popular enough to be pinned by people willing to share their bandwidth.


## Why do the videos load so slow?

### Reason 1. There aren't enough pins.

As a file becomes more popular and more pinned, IPFS enables faster download times because bits of the file are coming from several severs instead of just one.

As a hobby and a public service, Futureporn provides 1 pin of every video file. Beyond that, it's up to the Science Team!


### Reason 2. The public IPFS gateway is overloaded.

The public IPFS gateway is what lets your computer pull data from IPFS without having to run IPFS yourself. There are a lot of other people using the gateway, so it can be slow. 

There is potential for achieving faster download speeds by running your own IPFS node; running your own node bypasses the public IPFS gateway completely.

## Do I need to run IPFS on my computer to use this website?

No. Running IPFS on your computer is completely optional, but if you'd like to get started, here are some recoomendations.

[IPFS Desktop](https://docs.ipfs.io/install/ipfs-desktop/) for easily running a node.
[IPFS Companion](https://docs.ipfs.io/install/ipfs-companion/) for integrating IPFS into your web browser.

## Why no 360p?

It's coming, but it takes a few hours. VODs are recorded in the highest quality available, and posted to Futureporn immediately. Behind the scenes, Futureporn is transcoding the video to a lower resolution.


## Who made this website?

Futureporn is made with love by [Chris "CJ Crispy" Grimmett](https://grimtech.net/about/).

Are you in need of a web developer? I am in need of work! Contact me via [e-mail](mailto:chris@grimtech.net) or see [my contact page](https://grimtech.net/contact) for alternative methods.