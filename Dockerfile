FROM node:10.7.0-slim

ENV DISPLAY :99
WORKDIR /src/electron-log

# Install dependencies for running Electron and nwjs
RUN apt-get update -y && \
    apt-get install -y \
      libgtk2.0-0 \
      libgconf-2-4 \
      libnotify-dev \
      libnss3 \
      libxss1 \
      xvfb

# npm dependencies
COPY package.json package.json
RUN npm install

COPY . /src/electron-log

RUN Xvfb :99 -screen 0 1024x768x24 -nolisten tcp & npm test
