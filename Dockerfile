FROM node:12.13.0-slim

# Install dependencies for running Electron and nwjs
RUN apt-get update -y && \
    apt-get install -y \
      libasound2 \
      libatomic1 \
      libgtk2.0-0 \
      libgconf-2-4 \
      libnotify-dev \
      libnss3 \
      libxss1 \
      xvfb &&\
    rm -rf /var/lib/apt/lists/*

WORKDIR /src/electron-log

# npm dependencies
COPY package.json package.json
RUN npm install

COPY . .
RUN chown -R node test-projects/webpack

USER node
ENV CI=1 \
    DISPLAY=":99" \
    DOCKER=1

RUN Xvfb :99 -screen 0 1024x768x24 -nolisten tcp & npm run test:full
