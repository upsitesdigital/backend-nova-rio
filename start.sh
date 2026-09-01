#!/bin/bash
set -e

cd /app/html/backend.ppu.novario.com.br

# The generated Prisma client is not committed and must match the schema
# before TypeScript is compiled. Run the compiled application in production
# instead of asking Nest to rebuild it on every restart.
if [ ! -f node_modules/.prisma/client/default.js ]; then
  mise exec node@22 -- npm run prisma:generate
fi
if [ ! -f dist/main.js ]; then
  mise exec node@22 -- npm run build
fi

# Node's env-file parser supports unquoted values with spaces, unlike sourcing
# the files in Bash. Production provides secrets, while the local file
# overrides Docker-only hostnames (for example `postgres`) with local services.
# Nginx's site mapping forwards the backend virtual host to port 8080.
export PORT=8080
exec mise exec node@22 -- node --env-file=.env.production --env-file=.env dist/main
