# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

# Set API URL for Kubernetes deployment
# This can be overridden at build time with --build-arg
ARG REACT_APP_API=/
ENV REACT_APP_API=${REACT_APP_API}

# Build production bundle
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
