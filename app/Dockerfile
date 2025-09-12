#FROM node:18
#
#WORKDIR /app
#
## Install dependencies
#COPY app/package.json app/package-lock.json* ./
#RUN npm install
#
## Copy source
#COPY . .
#
## Expose React dev server port
#EXPOSE 3000
#
## Start React
#CMD ["npm", "start"]

FROM node:18-alpine

WORKDIR /app

# Copy package files from the build context root (now ./frontend/app)
COPY package.json package-lock.json* ./

RUN npm install

# Copy all other files from the build context root
COPY .. .

EXPOSE 3000

CMD ["npm", "start"]
