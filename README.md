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
  db:
    image: mysql:8.0.39
    container_name: mysql-db
    environment:
      MYSQL_ROOT_PASSWORD: admin123
      MYSQL_DATABASE: apartment_db
      TZ: Asia/Bangkok
    command: ["--default-authentication-plugin=mysql_native_password"]
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-padmin123"]
      interval: 10s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: ./Backend
    container_name: my-backend-app
    environment:
      SPRING_PROFILES_ACTIVE: "mysql"
      SPRING_DATASOURCE_URL: "jdbc:mysql://db:3306/apartment_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
      SPRING_DATASOURCE_USERNAME: "root"
      SPRING_DATASOURCE_PASSWORD: "admin123"
      TZ: Asia/Bangkok
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy
    # (แนะนำ) ใส่ restart policy
    restart: unless-stopped

  frontend:
    build:
      context: ./Frontend/app
    container_name: my-frontend-app
    ports:
      - "3000:3000"
    environment:
      # ใช้ชื่อ service backend + ใส่ /api ให้จบ
      - REACT_APP_API=http://localhost:8080
      # ถ้าจะใช้ token dev override (optional)
      # - REACT_APP_DEV_BEARER=eyJhbGciOi...
      - TZ=Asia/Bangkok
    depends_on:
      - backend
    restart: unless-stopped

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
