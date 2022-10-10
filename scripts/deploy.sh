#!/bin/bash

cd /home/ubuntu/ngx-storefront-api && \
npm install && \
pm2 restart ngx-storefront-api && echo "Deploy is completed.";