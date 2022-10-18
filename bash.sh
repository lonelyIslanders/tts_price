#!/bin/bash 
step=1 #间隔的秒数，不能大于60 
for (( i = 0; i < 60; i=(i+step) )); do 
  $(node '/usr/share/nginx/nodejs/tts_price/tts.js') 
  sleep $step 
done 
exit 0 