### new how to run

# Apartment Invoice Management System

A full-stack apartment management system with Spring Boot backend and React frontend. Features include room management, invoice generation with debt tracking, lease contracts, maintenance scheduling, supply inventory, and document storage.

## Tech Stack

- **Backend:** Spring Boot 3.5.5, Java 21, MySQL 8.0, JWT Authentication
- **Frontend:** React 19.1.1, Material-UI 7.3.1
- **Deployment:** Docker, Kubernetes (Docker Desktop), Docker Hub
- **CI/CD:** Github Acitons

## Table of Contents

1. [Quick Start After PC Restart](#quick-start-after-pc-restart)
2. [Initial Setup (First Time)](#initial-setup-first-time)
3. [Development Workflow](#development-workflow)
4. [Deployment Guide](#deployment-guide)
5. [Troubleshooting](#troubleshooting)
6. [Features](#features)
7. [API Documentation](#api-documentation)

---

## Quick Start After PC Restart

### Prerequisites (Must be Running)
- Docker Desktop
- MySQL Workbench (optional, for database inspection)

### Step-by-Step Instructions

#### 1. Start Docker Desktop
```bash
# Open Docker Desktop application
# Wait for the status to show "Docker Desktop is running"
# Verify with:
docker ps
```

#### 2. Verify Kubernetes Cluster
```bash
# Check cluster is running
kubectl cluster-info

# Expected output:
# Kubernetes control plane is running at https://kubernetes.docker.internal:6443
```

#### 3. Check Deployment Status
```bash
# Check all pods are running
kubectl get pods -n doomed-apt

# Expected output (all pods should be Running):
# NAME                                   READY   STATUS    RESTARTS   AGE
# backend-deployment-xxxxx-xxxxx         1/1     Running   0          Xm
# backend-deployment-xxxxx-xxxxx         1/1     Running   0          Xm
# frontend-deployment-xxxxx-xxxxx        1/1     Running   0          Xm
# mysql-xxxxx-xxxxx                      1/1     Running   0          Xm
```

#### 4. Access the Application

**Option A: Using NodePort (Direct Access)**
- Frontend: [http://localhost:32080](http://localhost:32080)
- Backend API: [http://localhost:32081](http://localhost:32081)

> Important: In production builds keep `REACT_APP_API=/api` (default) so the frontend calls its own origin and lets the nginx proxy forward `/api/*` traffic to the `backend` service. Pointing it directly at the backend LoadBalancer/IP will bypass the proxy and the browser will block requests because the backend does not emit `Access-Control-Allow-Origin`.

**Option B: Using Port-Forward (Alternative Ports)**
```bash
# Terminal 1 - Backend on port 8080
kubectl port-forward -n doomed-apt svc/backend 8080:8080

# Terminal 2 - Frontend on port 3000
kubectl port-forward -n doomed-apt svc/frontend 3000:80
```

Then access:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [https://apt.krentiz.dev/api](https://apt.krentiz.dev/api)

#### 5. Login Credentials

**Admin Account:**
- Username: `admin`
- Password: `1234`
- Permissions: Full access (CRUD operations)

**Staff Account:**
- Username: `staff`
- Password: `staff123`
- Permissions: Full access (CRUD operations)

**Guest Account:**
- Username: `guest`
- Password: `guest123`
- Permissions: Read-only access

#### 6. Verify Application is Working
```bash
# Test backend health
curl http://localhost:32081/health
# Expected: {"application":"apartment-invoice","status":"UP"}

# Test authentication
curl -X POST http://localhost:32081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"1234"}'
# Expected: {"token":"eyJ...","username":"admin"}
```

---

## Initial Setup (First Time)

### 1. Install Required Software

#### Windows:
- **Docker Desktop** (includes Kubernetes): [Download](https://www.docker.com/products/docker-desktop/)
- **Java 21**: [Download](https://adoptium.net/)
- **Node.js 18+**: [Download](https://nodejs.org/)
- **MySQL 8.0**: [Download](https://dev.mysql.com/downloads/installer/)
- **Git**: [Download](https://git-scm.com/downloads)

#### Enable Kubernetes in Docker Desktop:
1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Check "Enable Kubernetes"
4. Click "Apply & Restart"
5. Wait for Kubernetes to start (status shows green)

### 2. Clone the Repository

```bash
cd C:\Users\itm\Desktop
git clone <your-repo-url> front+backshoyt
cd front+backshoyt
```

### 3. Configure MySQL Database

**Option A: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to local instance (root@localhost:3306)
3. Create database:
```sql
CREATE DATABASE apartment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Option B: Using Command Line**
```bash
mysql -u root -p
# Enter password: admin123
CREATE DATABASE apartment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. Build Backend

```bash
cd Backend
./gradlew clean build
# This will:
# - Download dependencies
# - Compile Java code
# - Run tests
# - Create JAR file in build/libs/
```

### 5. Build Frontend

```bash
cd Frontend/app
npm install
npm run build
# This will:
# - Download node_modules
# - Create optimized production build in build/
```

### 6. Build and Push Docker Images

**Login to Docker Hub:**
```bash
docker login
# Username: mmmmnl
# Password: <your-docker-hub-password>
```

**Build Backend Image:**
```bash
cd Backend
docker build -t mmmmnl/lobotomy:v.1.4 .
docker push mmmmnl/lobotomy:v.1.4
```

**Build Frontend Image:**
```bash
cd Frontend/app
docker build -t mmmmnl/lobotomy_but_front:v.1.3 .
docker push mmmmnl/lobotomy_but_front:v.1.3
```

### 7. Deploy to Kubernetes

**Create Namespace:**
```bash
kubectl create namespace doomed-apt
```

**Apply All Manifests:**
```bash
# MySQL
kubectl apply -f Backend/k8s/mysql.yaml

# Backend
kubectl apply -f Backend/k8s/persistent-volume.yaml
kubectl apply -f Backend/k8s/persistent-volume-claim.yaml
kubectl apply -f Backend/k8s/deployment.yaml
kubectl apply -f Backend/k8s/service-nodeport.yaml

# Frontend
kubectl apply -f Frontend/app/k8s/deployment.yaml
kubectl apply -f Frontend/app/k8s/service-nodeport.yaml
```

**Wait for Pods to be Ready:**
```bash
kubectl wait --for=condition=ready pod -l app=mysql -n doomed-apt --timeout=60s
kubectl wait --for=condition=ready pod -l app=backend -n doomed-apt --timeout=120s
kubectl wait --for=condition=ready pod -l app=frontend -n doomed-apt --timeout=60s
```

**Verify Deployment:**
```bash
kubectl get all -n doomed-apt
```

### 8. Access the Application

Visit [http://localhost:32080](http://localhost:32080) and login with admin credentials.

---

## Development Workflow

### Running Locally (Without Docker)

#### Backend:
```bash
cd Backend
# Make sure MySQL is running on localhost:3306
./gradlew bootRun
# Backend will start on https://apt.krentiz.dev/api
```

#### Frontend:
```bash
cd Frontend/app
# Create .env file with:
# REACT_APP_API=https://apt.krentiz.dev/api
npm start
# Frontend will start on http://localhost:3000
```

### Making Changes and Deploying

#### 1. Update Code
```bash
# Make your changes to backend or frontend code
```

#### 2. Increment Version
```bash
# Update version in:
# - Backend/k8s/deployment.yaml (image: mmmmnl/lobotomy:v.X.X)
# - Frontend/app/k8s/deployment.yaml (image: mmmmnl/lobotomy_but_front:v.X.X)
```

#### 3. Build and Test Locally
```bash
# Backend
cd Backend
./gradlew clean build
./gradlew test

# Frontend
cd Frontend/app
npm test
npm run build
```

#### 4. Build Docker Images
```bash
# Backend
cd Backend
docker build -t mmmmnl/lobotomy:v.X.X .

# Frontend
cd Frontend/app
docker build -t mmmmnl/lobotomy_but_front:v.X.X .
```

#### 5. Push to Docker Hub
```bash
docker push mmmmnl/lobotomy:v.X.X
docker push mmmmnl/lobotomy_but_front:v.X.X
```

#### 6. Deploy to Kubernetes
```bash
# Apply updated deployments
kubectl apply -f Backend/k8s/deployment.yaml
kubectl apply -f Frontend/app/k8s/deployment.yaml

# Or use rolling restart
kubectl rollout restart deployment/backend-deployment -n doomed-apt
kubectl rollout restart deployment/frontend-deployment -n doomed-apt

# Check rollout status
kubectl rollout status deployment/backend-deployment -n doomed-apt
kubectl rollout status deployment/frontend-deployment -n doomed-apt
```

### Running with Docker Compose (Local Testing)

```bash
# Start all services
docker-compose up -d

# Access:
# - Frontend: http://localhost:3000
# - Backend: https://apt.krentiz.dev/api
# - MySQL: localhost:3307

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## Deployment Guide

### Kubernetes Architecture

```
doomed-apt namespace
├── mysql (1 replica)
│   ├── Service: db (ClusterIP, port 3306)
│   └── Storage: emptyDir (ephemeral)
├── backend (2 replicas)
│   ├── Service: backend (NodePort 32081 → 8080)
│   ├── PersistentVolume: uploads-pv (10Gi at /mnt/uploads)
│   └── PersistentVolumeClaim: uploads-pvc
└── frontend (1 replica)
    └── Service: frontend (NodePort 32080 → 80)
```

### Port Mappings

| Service  | Internal Port | NodePort | Alternative (Port-Forward) |
|----------|---------------|----------|----------------------------|
| Frontend | 80            | 32080    | 3000                       |
| Backend  | 8080          | 32081    | 8080                       |
| MySQL    | 3306          | N/A      | N/A (internal only)        |

### Environment Variables

**Backend (Backend/k8s/deployment.yaml):**
```yaml
SPRING_PROFILES_ACTIVE: docker
SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/apartment_db
SPRING_DATASOURCE_USERNAME: root
SPRING_DATASOURCE_PASSWORD: admin123
SPRING_JPA_HIBERNATE_DDL_AUTO: update
```

**Frontend (Frontend/app/k8s/deployment.yaml):**
```yaml
REACT_APP_API: http://localhost:32081
```

### Persistent Storage

**Uploads Volume** (`/app/uploads` in backend):
- Stores uploaded documents (contracts, receipts, payment slips)
- 10GB capacity
- Mounted at `/mnt/uploads` on host
- Retained across pod restarts

**To backup uploads:**
```bash
kubectl cp doomed-apt/<backend-pod-name>:/app/uploads ./uploads-backup
```

**To restore uploads:**
```bash
kubectl cp ./uploads-backup doomed-apt/<backend-pod-name>:/app/uploads
```

---

## Troubleshooting

### Common Issues

#### 1. Pods Not Starting

**Check pod status:**
```bash
kubectl get pods -n doomed-apt
```

**View pod logs:**
```bash
kubectl logs <pod-name> -n doomed-apt
```

**Describe pod for events:**
```bash
kubectl describe pod <pod-name> -n doomed-apt
```

#### 2. Cannot Access Application

**Verify services are running:**
```bash
kubectl get svc -n doomed-apt
```

**Test backend health:**
```bash
curl http://localhost:32081/health
```

**Check if port is in use:**
```bash
netstat -ano | findstr :32080
netstat -ano | findstr :32081
```

#### 3. Database Connection Failed

**Check MySQL pod:**
```bash
kubectl logs <mysql-pod-name> -n doomed-apt
```

**Test connection from backend pod:**
```bash
kubectl exec -it <backend-pod-name> -n doomed-apt -- curl http://db:3306
```

#### 4. Docker Desktop Not Running

**Start Docker Desktop:**
1. Open Docker Desktop application
2. Wait for status: "Docker Desktop is running"
3. Verify Kubernetes is enabled (Settings → Kubernetes)

#### 5. Image Pull Errors

**Check image exists:**
```bash
docker pull mmmmnl/lobotomy:v.1.4
docker pull mmmmnl/lobotomy_but_front:v.1.3
```

**Force re-pull:**
```bash
kubectl rollout restart deployment/backend-deployment -n doomed-apt
```

#### 6. Port Already in Use

**Kill process using port:**
```bash
# Find process ID
netstat -ano | findstr :<port>

# Kill process
taskkill /PID <process-id> /F
```

#### 7. Mock Data Not Loaded

**Check DataLoader logs:**
```bash
kubectl logs <backend-pod-name> -n doomed-apt | grep DataLoader
```

**Force reload by clearing database:**
```bash
# Delete MySQL pod (will recreate with fresh database)
kubectl delete pod -l app=mysql -n doomed-apt

# Wait for MySQL to be ready
kubectl wait --for=condition=ready pod -l app=mysql -n doomed-apt --timeout=60s

# Restart backend to reload data
kubectl rollout restart deployment/backend-deployment -n doomed-apt
```

### Useful Commands

**View all resources:**
```bash
kubectl get all -n doomed-apt
```

**View logs (follow mode):**
```bash
kubectl logs -f <pod-name> -n doomed-apt
```

**Access pod shell:**
```bash
kubectl exec -it <pod-name> -n doomed-apt -- /bin/bash
```

**Port forward to pod:**
```bash
kubectl port-forward <pod-name> 8080:8080 -n doomed-apt
```

**Delete and recreate everything:**
```bash
kubectl delete namespace doomed-apt
kubectl create namespace doomed-apt
# Then re-apply all manifests
```

**View persistent volumes:**
```bash
kubectl get pv
kubectl get pvc -n doomed-apt
```

---

## Features

### 1. Room Management
- 60 rooms across 4 floors (201-515)
- Track occupancy status (OCCUPIED/FREE)
- Assign tenants to rooms
- Set common fees and garbage fees per room

### 2. Tenant Management
- Store tenant information (name, phone, LINE ID)
- View tenant details and lease history
- Track active leases per tenant

### 3. Invoice Management
- Generate monthly invoices with:
  - Rent charges
  - Electricity usage (units × rate)
  - Water usage (units × rate)
  - Common fees
  - Garbage fees
  - Maintenance charges
  - Other fees
- **Debt Accumulation:** Track unpaid invoices with interest calculation
- **Invoice Settings:** Configure payment instructions and QR code
- **CSV Import:** Bulk create invoices from CSV file
- **PDF Export:** Generate printable invoices
- Track invoice status (PENDING, PAID, OVERDUE)

### 4. Lease Contract Management
- Create lease agreements with:
  - Start and end dates
  - Monthly rent amount
  - Deposit amount
  - Custom contract terms
- Track lease status (ACTIVE, ENDED, SETTLED)
- **PDF Export:** Generate printable lease contracts
- **Document Upload:** Attach scanned contracts

### 5. Maintenance Tracking
- Schedule maintenance tasks
- Track status (PLANNED, IN_PROGRESS, COMPLETED, CANCELED)
- Record costs and completion dates
- **Document Upload:** Attach maintenance reports and receipts
- View upcoming maintenance (today + next 3 days)

### 6. Supply Inventory
- Track apartment supplies (furniture, equipment)
- Monitor stock levels
- **Low Stock Alerts:** Automatic alerts when quantity < 3
- Inline editing for quick updates

### 7. Document Storage
- Upload and download documents (JPG, PNG, PDF)
- 10MB file size limit
- Organize by entity type (Lease, Maintenance, Invoice)
- View file list with download/delete options

### 8. Dashboard
- Occupancy statistics
- Revenue tracking
- Upcoming maintenance
- Quick access to all features

### 9. Authentication & Authorization
- JWT token-based authentication
- Role-based access control:
  - **ADMIN/STAFF:** Full CRUD access
  - **GUEST:** Read-only access
- Secure API endpoints

---

## API Documentation

### Base URL
- Production: `http://localhost:32081`
- Development: `https://apt.krentiz.dev/api`

### Authentication

**Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "1234"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin"
}
```

**Register:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "role": "STAFF"
}
```

### API Endpoints

All endpoints require `Authorization: Bearer <token>` header except `/health` and `/api/auth/*`.

#### Rooms
- `GET /api/rooms` - List all rooms
- `GET /api/rooms/{id}` - Get room by ID
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/{id}` - Update room
- `DELETE /api/rooms/{id}` - Delete room

#### Tenants
- `GET /api/tenants` - List all tenants
- `GET /api/tenants/{id}` - Get tenant by ID
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/{id}` - Update tenant
- `DELETE /api/tenants/{id}` - Delete tenant

#### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/{id}` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/{id}` - Update invoice
- `DELETE /api/invoices/{id}` - Delete invoice
- `GET /api/invoices/{id}/pdf` - Generate invoice PDF
- `POST /api/invoices/import/csv` - Import invoices from CSV

#### Leases
- `GET /api/leases` - List all leases
- `GET /api/leases/{id}` - Get lease by ID
- `POST /api/leases` - Create new lease
- `PUT /api/leases/{id}` - Update lease
- `DELETE /api/leases/{id}` - Delete lease
- `GET /api/leases/{id}/pdf` - Generate lease PDF

#### Maintenance
- `GET /api/maintenance` - List all maintenance records
- `GET /api/maintenance/{id}` - Get maintenance by ID
- `POST /api/maintenance` - Create new maintenance
- `PUT /api/maintenance/{id}` - Update maintenance
- `DELETE /api/maintenance/{id}` - Delete maintenance

#### Supplies
- `GET /api/supplies` - List all supplies
- `GET /api/supplies/{id}` - Get supply by ID
- `POST /api/supplies` - Create new supply
- `PUT /api/supplies/{id}` - Update supply
- `DELETE /api/supplies/{id}` - Delete supply

#### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/{id}/download` - Download document
- `DELETE /api/documents/{id}` - Delete document
- `GET /api/documents?entityType={type}&entityId={id}` - List documents by entity

#### Invoice Settings
- `GET /api/invoice-settings` - Get settings
- `PUT /api/invoice-settings` - Update settings
- `POST /api/invoice-settings/qr-upload` - Upload QR code

---

## Mock Data

The system comes with pre-loaded mock data for testing:

- **60 Rooms** (201-515 across floors 2-5)
- **42 Tenants** with English names
- **42 Active Leases**
- **420 Invoices** (10 per occupied room)
  - 300 PAID
  - 80 PENDING
  - 40 OVERDUE (with debt accumulation)
- **300 Maintenance Records**
  - 4 scheduled for today
  - 3 scheduled for next 3 days
- **10 Supply Items**
  - 2 low stock (Light Bulb: 2, Faucet: 1)
  - 8 normal stock

### Clearing Mock Data

To reload fresh mock data:
```bash
# Delete MySQL pod
kubectl delete pod -l app=mysql -n doomed-apt

# Wait for MySQL to restart
kubectl wait --for=condition=ready pod -l app=mysql -n doomed-apt --timeout=60s

# Restart backend
kubectl rollout restart deployment/backend-deployment -n doomed-apt
```

---

## Project Structure

```
front+backshoyt/
├── Backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/.../apartmentinvoice/
│   │   │   │   ├── controller/      # REST endpoints
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── repository/      # Data access
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   ├── security/        # JWT & security config
│   │   │   │   └── config/          # DataLoader, CORS
│   │   │   └── resources/
│   │   │       ├── application.yaml # Configuration
│   │   │       └── templates/       # PDF templates
│   │   └── test/                    # Integration tests
│   ├── k8s/                         # Kubernetes manifests
│   ├── build.gradle                 # Gradle build file
│   ├── Dockerfile                   # Backend Docker image
│   └── Jenkinsfile                  # CI/CD pipeline
├── Frontend/
│   └── app/
│       ├── src/
│       │   ├── components/          # React components
│       │   │   ├── Home/           # Main dashboard
│       │   │   ├── LoginPage/      # Authentication
│       │   │   ├── RoomList/       # Room management
│       │   │   ├── Invoice/        # Invoice features
│       │   │   ├── Lease/          # Lease management
│       │   │   ├── Maintenance/    # Maintenance tracking
│       │   │   ├── SupplyInventory/ # Supply management
│       │   │   └── Common/         # Shared components
│       │   ├── api/                # API client functions
│       │   └── App.js              # Root component
│       ├── public/                 # Static assets
│       ├── k8s/                    # Kubernetes manifests
│       ├── package.json            # NPM dependencies
│       ├── Dockerfile              # Frontend Docker image
│       └── Jenkinsfile             # CI/CD pipeline
├── docker-compose.yml              # Local development
├── CLAUDE.md                       # Project documentation for AI
└── README.md                       # This file
```
---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. View application logs: `kubectl logs <pod-name> -n doomed-apt`
3. Check Kubernetes events: `kubectl get events -n doomed-apt --sort-by='.lastTimestamp'`

---

**Last Updated:** 2025-10-29
**Current Version:** Backend v.1.4, Frontend v.1.3

---------------------------------------------------------------------------------------------

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
   REACT_APP_API=https://apt.krentiz.dev/api
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
      - REACT_APP_API_BASE=https://apt.krentiz.dev/api
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
