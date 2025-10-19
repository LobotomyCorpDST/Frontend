pipeline {
  agent { label 'node' }   // Windows agent ที่มี git + docker + kubectl

  options { timestamps() }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Load env from secret file') {
      steps {
        withCredentials([file(credentialsId: 'frontend-env-file', variable: 'ENV_FILE')]) {
          bat '''
            setlocal EnableDelayedExpansion

            rem ===== Load KEY=VALUE จาก secret file =====
            for /f "usebackq tokens=* delims=" %%L in ("%ENV_FILE%") do (
              set "LINE=%%L"
              if not "!LINE!"=="" if /I not "!LINE:~0,1!"=="#" (
                for /f "tokens=1,2 delims==" %%A in ("!LINE!") do (
                  set "%%A=%%B"
                )
              )
            )

            rem ===== สร้าง TAG (fallback เมื่อ IMAGE_TAG ว่าง) =====
            set "TAG=%IMAGE_TAG%"
            if "%TAG%"=="" (
              for /f "usebackq" %%i in (`git rev-parse --short=7 HEAD 2^>NUL`) do set TAG=%%i
            )
            if "%TAG%"=="" set TAG=%BUILD_NUMBER%

            rem ===== Sanitize TAG กันอักขระต้องห้าม =====
            set "TAG=%TAG:/=-%"
            set "TAG=%TAG::=-%"
            set "TAG=%TAG: =%"
            set "TAG=%TAG:^&=-%"
            set "TAG=%TAG:|=-%"
            set "TAG=%TAG:(=%"
            set "TAG=%TAG:)=%"

            rem ===== ค่าพื้นฐาน ถ้าว่าง =====
            if "%K8S_NAMESPACE%"==""   set K8S_NAMESPACE=doomed-apt
            if "%DEPLOY_NAME%"==""     set DEPLOY_NAME=frontend-deployment
            if "%CONTAINER_NAME%"==""  set CONTAINER_NAME=frontend
            if "%IMAGE_REPO%"==""      set IMAGE_REPO=mmmmnl/lobotomy_but_front
            if "%K8S_DIR%"==""         set K8S_DIR=k8s\\frontend

            if "%TAG%"=="" (
              echo ERROR: TAG is empty. Aborting.
              exit /b 1
            )

            set "IMAGE=%IMAGE_REPO%:%TAG%"

            echo Using:
            echo   K8S_NAMESPACE=%K8S_NAMESPACE%
            echo   DEPLOY_NAME=%DEPLOY_NAME%
            echo   CONTAINER_NAME=%CONTAINER_NAME%
            echo   IMAGE=%IMAGE%
            echo   K8S_DIR=%K8S_DIR%

            > image.env echo IMAGE=%IMAGE%
            >> image.env echo TAG=%TAG%
            >> image.env echo K8S_NAMESPACE=%K8S_NAMESPACE%
            >> image.env echo DEPLOY_NAME=%DEPLOY_NAME%
            >> image.env echo CONTAINER_NAME=%CONTAINER_NAME%
            >> image.env echo K8S_DIR=%K8S_DIR%

            endlocal
          '''
          script {
            def txt = readFile('image.env')
            def kv = [:]
            txt.readLines()
              .findAll { it && it.contains('=') }
              .each { line ->
                def parts = line.split('=', 2)
                kv[parts[0]] = parts.size() > 1 ? parts[1] : ''
              }
            env.IMAGE          = kv.IMAGE
            env.TAG            = kv.TAG
            env.K8S_NAMESPACE  = kv.K8S_NAMESPACE
            env.DEPLOY_NAME    = kv.DEPLOY_NAME
            env.CONTAINER_NAME = kv.CONTAINER_NAME
            env.K8S_DIR        = kv.K8S_DIR
          }
        }
      }
    }

    stage('Docker build & push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-hub-creds',
                                                usernameVariable: 'DOCKERHUB_USERNAME',
                                                passwordVariable: 'DOCKERHUB_PASSWORD')]) {
          bat '''
            if "%IMAGE%"=="" ( echo IMAGE empty & exit /b 1 )
            echo Building %IMAGE%
            docker build -t %IMAGE% .

            echo %DH_PASS% | docker login -u %DH_USER% --password-stdin
            docker push %IMAGE%
            docker logout
          '''
        }
      }
    }

    stage('Deploy Frontend') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KUBECONFIG_FILE')]) {
          bat '''
            set KUBECONFIG=%KUBECONFIG_FILE%

            rem ----- apply manifests -----
            if exist %K8S_DIR%\\kustomization.yaml (
              kubectl apply -n %K8S_NAMESPACE% -k %K8S_DIR%\\
            ) else (
              if exist %K8S_DIR%\\frontend-deployment.yaml      kubectl apply -n %K8S_NAMESPACE% -f %K8S_DIR%\\frontend-deployment.yaml
              if exist %K8S_DIR%\\frontend-service-nodeport.yaml kubectl apply -n %K8S_NAMESPACE% -f %K8S_DIR%\\frontend-service-nodeport.yaml
            )

            rem ----- update image -----
            kubectl -n %K8S_NAMESPACE% set image deploy/%DEPLOY_NAME% %CONTAINER_NAME%=%IMAGE%
            kubectl -n %K8S_NAMESPACE% rollout status deploy/%DEPLOY_NAME% --timeout=180s
            kubectl -n %K8S_NAMESPACE% get svc frontend -o wide
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ Deployment successful: ${env.IMAGE}"
    }
    failure {
      echo "❌ Pipeline failed."
    }
  }
}
