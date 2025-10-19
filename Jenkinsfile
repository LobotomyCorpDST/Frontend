pipeline {
  agent { label 'node' }   

  stages {
    stage('Checkout code') {
      steps {
        git branch: 'main', url: 'https://github.com/LobotomyCorpDST/Frontend.git'
      }
    }

    stage('Build') {
      steps {
        dir('app') {
          bat 'docker build . -t mmmmnl/lobotomy_but_front:v.1.0'
        }
      }
    }

    stage('List image') {
      steps { bat 'docker images' }
    }

    stage('Login Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-hub-creds',
                                          usernameVariable: 'DOCKERHUB_USERNAME',
                                          passwordVariable: 'DOCKERHUB_PASSWORD')]) {
          bat '''
            echo %DOCKERHUB_PASSWORD% | docker login -u %DOCKERHUB_USERNAME% --password-stdin
          '''
        }
      }
    }

    stage('Push image') {
      steps {
        bat 'docker push mmmmnl/lobotomy_but_front:v.1.0'
      }
    }

    stage('Deploy Frontend to K8s') {
      steps {
        withCredentials([
          file(credentialsId: 'kubeconfig-prod',   variable: 'KUBECONFIG_FILE'),
          file(credentialsId: 'frontend-env-file', variable: 'ENV_FILE')
        ]) {
          bat '''
            setlocal EnableDelayedExpansion

            rem === ตั้ง kubeconfig ===
            set KUBECONFIG=%KUBECONFIG_FILE%

            rem === โหลดตัวแปรจาก secret file (KEY=VALUE) ===
            for /f "usebackq tokens=* delims=" %%L in ("%ENV_FILE%") do (
              set "LINE=%%L"
              if not "!LINE!"=="" if /I not "!LINE:~0,1!"=="#" (
                for /f "tokens=1,2 delims==" %%A in ("!LINE!") do (
                  set "%%A=%%B"
                )
              )
            )

            rem === ค่าบังคับต้องมี ===
            if "%K8S_NAMESPACE%"==""  ( echo ERROR: K8S_NAMESPACE missing & exit /b 1 )
            if "%DEPLOY_NAME%"==""    ( echo ERROR: DEPLOY_NAME missing   & exit /b 1 )
            if "%CONTAINER_NAME%"=="" ( echo ERROR: CONTAINER_NAME missing & exit /b 1 )
            if "%IMAGE_REPO%"==""     ( echo ERROR: IMAGE_REPO missing    & exit /b 1 )

            rem === ใช้ TAG คงที่ตามขั้นตอน build/push (v.1.0) ===
            set "TAG=v.1.0"
            set "IMAGE=%IMAGE_REPO%:%TAG%"

            rem === apply manifests (รองรับกรณีมี kustomization.yaml) ===
            if exist app\\k8s\\kustomization.yaml (
              kubectl apply -n %K8S_NAMESPACE% -k app\\k8s\\
            ) else (
              kubectl apply -n %K8S_NAMESPACE% -f app\\k8s\\
            )

            rem === อัปเดต image ให้ตรงกับ tag ที่ push ไป ===
            kubectl -n %K8S_NAMESPACE% set image deploy/%DEPLOY_NAME% %CONTAINER_NAME%=%IMAGE%

            rem === ติดตามผล rollout ===
            kubectl -n %K8S_NAMESPACE% rollout status deploy/%DEPLOY_NAME% --timeout=180s

            endlocal
          '''
        }
      }
    }

    // เรียกให้ Backend pipeline ไปรัน Jenkinsfile ของตัวเอง
    stage('Trigger Backend pipeline') {
      steps {
        script {
          build job: 'APT-Backend-Pipeline', wait: true, propagate: true
        }
      }
    }
  }

  post {
    success {
      echo '✅ Frontend pipeline finished and Backend pipeline triggered.'
    }
    failure {
      echo '❌ Frontend pipeline failed.'
    }
  }
}
