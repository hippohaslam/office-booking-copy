FROM node:20.13.1

WORKDIR /app

ENV BUILD_COMMAND="yarn dev"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

COPY . .

RUN rm -rf node_modules
RUN rm -rf certs


RUN apt-get update
RUN apt-get install -y --no-install-recommends \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libu2f-udev \
    libxshmfence1 \
    libglu1-mesa \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libtool \
    autoconf \
    automake \
    chromium \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable
RUN yarn install --immutable

CMD ["sh", "-c", "$BUILD_COMMAND"]