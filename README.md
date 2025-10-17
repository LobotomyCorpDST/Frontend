### how to run

1. go inside the folder

   ```bash
   cd Frontend/app
   npm install
   ```
2. copy the example env file and set your api url

   ```bash
   cp .env.example .env
   ```

   if you’re running backend on local docker, just keep this:

   ```
   REACT_APP_API=http://localhost:8080
   ```
3. run it

   ```bash
   npm start
   ```

   will start on **[http://localhost:3000](http://localhost:3000)**

---

### if using docker

1st thing 1st you have to create docker-compose.yml in "root" directory
```version: '3.8'

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
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: docker
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
      - REACT_APP_API_BASE=http://localhost:8080
      - CHOKIDAR_USEPOLLING=true
    volumes:
      # Mounts local source code into the container's /app directory
      - ./frontend/app:/app
      - /app/node_modules
    depends_on:
      - backend

# Defines the named volume for persisting MySQL data.
volumes:
  mysql-data:
```

you can also build and run it from docker-compose
(make sure backend and db are up too)

```bash
docker-compose build frontend
docker-compose up -d frontend
```

then visit **[http://localhost:3000](http://localhost:3000)**

---

### project structure (short version)

```
src/
  api/http.js        -> handles all requests + tokens
  components/
    LoginPage/       
    Home/
    Dashboard/
    RoomList/
    InvoiceHistory/
    LeaseHistory/
    Maintenance/
.env.example          -> base api url
```

---

### notes

* don’t push your real `.env`
  just use `.env.example` for sharing variables
* token will be auto-saved to `localStorage` after login
* every api call should go through `http.js`, don’t use fetch manually
* if you get 403 or "failed to fetch", check your backend CORS and api url

---

### useful scripts

```bash
npm start       # run dev mode
npm run build   # build for production
npm test        # run tests (if we add them)
```

---
