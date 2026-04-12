#!/bin/sh
export PATH=/usr/local/bin:/usr/bin:/bin
cd /Users/timinkan/projects/apimarketplace
exec /usr/local/bin/node node_modules/next/dist/bin/next dev -p 3020 --turbo
