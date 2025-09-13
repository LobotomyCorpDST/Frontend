> Setting .env
- REACT_APP_API_BASE=BACKEND_URL

> Docker compose test
create `docker-compose.yml` outside of front/back folder
```
version: '3.8'

services:
  # --- MySQL Database Service ---
  db:
    image: mysql:latest
    container_name: mysql-db
    environment:
      MYSQL_ROOT_PASSWORD: admin123
      MYSQL_DATABASE: apartment_db
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin" ,"ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # --- Spring Boot Backend Service ---
  backend:
    build: ./backend
    container_name: my-backend-app
    ports:
      - "8000:8000"
    environment:
      SPRING_DATASOURCE_URL: "jdbc:mysql://db:3306/apartment_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
      SPRING_DATASOURCE_USERNAME: "root"
      SPRING_DATASOURCE_PASSWORD: "admin123"
    depends_on:
      db:
        condition: service_healthy

  # --- React Frontend Service ---
  frontend:
    build:
      context: ./frontend/app
    container_name: my-frontend-app
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_BASE=http://backend:8080
    depends_on:
      - backend

# Defines the named volume for persisting MySQL data.
volumes:
  mysql-data:
```

- ### then
run
`docker-compose up --build`
*make sure your docker desktop is opened
