#!/bin/bash

cd /home/ubuntu/ngx-storefront-api && \
npm install && \
npm run migrate && \
pm2 restart ngx-storefront-api && echo "Deploy is completed.";