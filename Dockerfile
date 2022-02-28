FROM node:17-alpine

RUN apk add --no-cache \
    make gcc g++ \
    R R-dev R-doc \
    gdal gdal-dev \
    proj proj-dev \
    sqlite sqlite-dev \
    geos geos-dev

COPY r-setup.R /tmp
RUN Rscript /tmp/r-setup.R

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
EXPOSE 3000
ENTRYPOINT [ "node", "/app/index.js" ]
