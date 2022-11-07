#!/bin/sh
start () {
  echo The app is starting!
  CONTRACT_NAME=ptit-nft.vbidev.testnet parcel index.html --open
}

start
