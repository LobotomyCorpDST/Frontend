### new how to run

# Kubernetes Restart Guide

This guide explains how to restart your Kubernetes deployment after restarting your PC. (or if you have already set it up)

---

## Prerequisites

1. **Docker Desktop must be running**
   - Make sure Docker Desktop is started
   - Verify Kubernetes is enabled: Docker Desktop → Settings → Kubernetes → Enable Kubernetes

2. **Verify Kubernetes is ready**
   ```bash
   kubectl cluster-info
   ```
   You should see: `Kubernetes control plane is running at https://kubernetes.docker.internal:6443`

---

## Step-by-Step Restart Instructions

### Step 1: Check Current Deployment Status

```bash
kubectl get pods -n doomed-apt
```

**Expected output:**
- If pods are already running: You're good to go! Skip to Step 5.
- If namespace doesn't exist or pods are missing: Continue to Step 2.

### Step 2: Deploy the Application

Navigate to the project directory and apply all Kubernetes manifests:
(Don't use this same path, this is my file structure)

```bash
cd c:\Users\itm\Desktop\front+backshoyt
kubectl apply -f Backend/k8s/
kubectl apply -f Frontend/app/k8s/
```

**What this does:**
- Creates the `doomed-apt` namespace
- Deploys MySQL database
- Deploys backend API (2 replicas)
- Deploys frontend React app
- Creates NodePort services for external access

### Step 3: Wait for MySQL to be Ready

MySQL takes the longest to start. Wait for it to be ready before proceeding:

```bash
kubectl wait --for=condition=ready pod -l app=mysql -n doomed-apt --timeout=180s
```

### Step 4: Verify All Pods are Running

Check that all pods are in the `Running` state:

```bash
kubectl get pods -n doomed-apt
```

**Expected output:**
```
NAME                                  READY   STATUS    RESTARTS   AGE
backend-deployment-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
backend-deployment-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
frontend-deployment-xxxxxxxxx-xxxxx   1/1     Running   0          2m
mysql-xxxxxxxxxx-xxxxx                1/1     Running   0          2m
```

**If backend pods are not ready:** They may be waiting for MySQL. Give them 1-2 more minutes or restart them:
```bash
kubectl rollout restart deployment/backend-deployment -n doomed-apt
kubectl rollout status deployment/backend-deployment -n doomed-apt
```

### Step 5: Access the Application

Once all pods are running:

- **Frontend**: http://localhost:32080
- **Backend API**: http://localhost:32081

**Login credentials:**
- Username: `guest`
- Password: `guest123`

---

## Quick Verification Commands

### Check all resources in the namespace
```bash
kubectl get all -n doomed-apt
```

### View backend logs
```bash
kubectl logs -n doomed-apt -l app=backend --tail=50
```

### View frontend logs
```bash
kubectl logs -n doomed-apt -l app=frontend --tail=50
```

### View MySQL logs
```bash
kubectl logs -n doomed-apt -l app=mysql --tail=50
```

### Check service endpoints
```bash
kubectl get svc -n doomed-apt
```

**Expected output:**
```
NAME       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
backend    NodePort    10.x.x.x        <none>        8080:32081/TCP   Xm
db         ClusterIP   10.x.x.x        <none>        3306/TCP         Xm
frontend   NodePort    10.x.x.x        <none>        3000:32080/TCP   Xm
```

---

## Troubleshooting

### Problem: Pods stuck in `Pending` or `ContainerCreating`

**Solution:** Wait a few minutes. If still stuck after 3 minutes:
```bash
kubectl describe pod <pod-name> -n doomed-apt
```
Look for error messages in the Events section.

### Problem: Backend pods crash with "Connection refused" to MySQL

**Solution:** MySQL hasn't finished starting. Wait for it:
```bash
kubectl wait --for=condition=ready pod -l app=mysql -n doomed-apt --timeout=180s
kubectl rollout restart deployment/backend-deployment -n doomed-apt
```

### Problem: "No static resource" errors in frontend or report page

**Solution:** Backend pods may not have the latest image. Restart them:
```bash
kubectl rollout restart deployment/backend-deployment -n doomed-apt
kubectl rollout restart deployment/frontend-deployment -n doomed-apt
```

### Problem: Can't access frontend at http://localhost:32080

**Solutions:**
1. Check if the frontend pod is running:
   ```bash
   kubectl get pods -n doomed-apt -l app=frontend
   ```

2. Verify the NodePort service:
   ```bash
   kubectl get svc frontend -n doomed-apt
   ```
   Should show `3000:32080/TCP`

3. Check frontend logs for errors:
   ```bash
   kubectl logs -n doomed-apt -l app=frontend
   ```

### Problem: API calls failing with CORS errors

**Solution:** The frontend is configured to call `http://localhost:32081`. Make sure you're accessing the frontend via `http://localhost:32080` (not `127.0.0.1`).

---

## Complete Cleanup (If You Need to Start Fresh)

If something goes wrong and you want to completely remove and redeploy:

```bash
# Delete everything
kubectl delete namespace doomed-apt

# Wait a few seconds for cleanup
timeout /t 10

# Redeploy
kubectl apply -f Backend/k8s/
kubectl apply -f Frontend/app/k8s/

# Wait for MySQL
kubectl wait --for=condition=ready pod -l app=mysql -n doomed-apt --timeout=180s

# Verify
kubectl get pods -n doomed-apt
```

---

## Docker Image Information

The deployment uses these Docker images (built locally):

- **Backend**: `mmmmnl/lobotomy:v.1.0`
- **Frontend**: `mmmmnl/lobotomy_but_front:latest`
- **MySQL**: `mysql:8.0` (official image)

**Note:** Since these images are built locally on your machine, they're already available to Docker Desktop Kubernetes. You don't need to push/pull from Docker Hub.

---

## One-Command Restart (For Future Use)

Save this as a batch file for quick restarts:

**restart-k8s.bat:**
```bat
@echo off
echo Deploying Kubernetes resources...
kubectl apply -f Backend/k8s/
kubectl apply -f Frontend/app/k8s/

echo.
echo Waiting for MySQL to be ready...
kubectl wait --for=condition=ready pod -l app=mysql -n doomed-apt --timeout=180s

echo.
echo Checking pod status...
kubectl get pods -n doomed-apt

echo.
echo Application ready!
echo Frontend: http://localhost:32080
echo Backend: http://localhost:32081
echo Login: guest / guest123
```

Usage:
```bash
cd c:\Users\itm\Desktop\front+backshoyt
restart-k8s.bat
```

---

## Summary

**After PC restart, run these commands:**

1. Make sure Docker Desktop is running
2. Navigate to project directory:
   ```bash
   cd c:\Users\itm\Desktop\front+backshoyt
   ```
3. Deploy:
   ```bash
   kubectl apply -f Backend/k8s/
   kubectl apply -f Frontend/app/k8s/
   ```
4. Wait for MySQL:
   ```bash
   kubectl wait --for=condition=ready pod -l app=mysql -n doomed-apt --timeout=180s
   ```
5. Access at http://localhost:32080

**That's it!** 🎉



-------------------------------------------------------------------------------

### for old how to run

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
