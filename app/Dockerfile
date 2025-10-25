FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

# Set API URL for Kubernetes deployment
# This can be overridden at build time with --build-arg
ARG REACT_APP_API=http://localhost:32081
ENV REACT_APP_API=${REACT_APP_API}

EXPOSE 3000

CMD ["npm", "start"]