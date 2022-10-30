#!/bin/bash
step=1
for (( i = 0; i < 60; i=(i+step) )); do
    $(/usr/bin/node 'tts.js')
    sleep $step
done
exit 0