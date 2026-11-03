FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_SITE_TITLE="WriteSpace — your thoughts, your space"
RUN VITE_SITE_TITLE="$VITE_SITE_TITLE" npm run build && chown -R node:node /app
USER node
EXPOSE 8080
CMD ["node", "node_modules/vite/bin/vite.js", "preview", "--host", "0.0.0.0", "--port", "8080"]

