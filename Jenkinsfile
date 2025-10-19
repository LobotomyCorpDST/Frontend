pipeline {
  agent { label 'node' }

  stages {
    stage('Load env from secret file') {
      steps {
        withCredentials([file(credentialsId: 'frontend-env-file', variable: 'ENV_FILE')]) {
          bat '''
            setlocal EnableDelayedExpansion
            for /f "usebackq tokens=* delims=" %%L in ("%ENV_FILE%") do (
              set "LINE=%%L"
              rem ข้ามบรรทัดว่าง/คอมเมนต์
              if not "!LINE!"=="" if /I not "!LINE:~0,1!"=="#" (
                for /f "tokens=1,2 delims==" %%A in ("!LINE!") do (
                  set "%%A=%%B"
                )
              )
            )

            rem ===== ตรวจ/ตั้งค่า fallback =====
            rem ถ้า IMAGE_TAG ว่าง ให้ fallback เป็น git short sha หรือ BUILD_NUMBER
            set "TAG=%IMAGE_TAG%"
            if "%TAG%"=="" (
              for /f "usebackq" %%i in (`git rev-parse --short=7 HEAD 2^>NUL`) do set TAG=%%i
            )
            if "%TAG%"=="" set TAG=%BUILD_NUMBER%

            rem กรองอักขระต้องห้ามใน tag
            set "TAG=%TAG:/=-%"
            set "TAG=%TAG::=-%"
            set "TAG=%TAG: =%"
            set "TAG=%TAG:^&=-%"
            set "TAG=%TAG:|=-%"
            set "TAG=%TAG:(=%"
            set "TAG=%TAG:)=%"

            if "%K8S_NAMESPACE%"=="" set K8S_NAMESPACE=doomed-apt
            if "%DEPLOY_NAME%"==""  set DEPLOY_NAME=frontend-deployment
            if "%CONTAINER_NAME%"=="" set CONTAINER_NAME=frontend
            if "%IMAGE_REPO%"=="" set IMAGE_REPO=mmmmnl/lobotomy_but_front

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

            rem ส่งค่าออกเป็นไฟล์เพื่อใช้ในขั้นต่อไป
            > image.env echo IMAGE=%IMAGE%
            >> image.env echo TAG=%TAG%
            >> image.env echo K8S_NAMESPACE=%K8S_NAMESPACE%
            >> image.env echo DEPLOY_NAME=%DEPLOY_NAME%
            >> image.env echo CONTAINER_NAME=%CONTAINER_NAME%
            endlocal
          '''
          script {
            def m = readProperties file: 'image.env'
            env.IMAGE          = m.IMAGE
            env.TAG            = m.TAG
            env.K8S_NAMESPACE  = m.K8S_NAMESPACE
            env.DEPLOY_NAME    = m.DEPLOY_NAME
            env.CONTAINER_NAME = m.CONTAINER_NAME
          }
        }
      }
    }

    stage('Docker build & push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
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

            rem ถ้ามี kustomization ของ frontend ให้ใช้ -k, ไม่งั้น -f รายไฟล์
            if exist k8s\\frontend\\kustomization.yaml (
              kubectl apply -n %K8S_NAMESPACE% -k k8s\\frontend\\
            ) else (
              if exist k8s\\frontend\\frontend-deployment.yaml kubectl apply -n %K8S_NAMESPACE% -f k8s\\frontend\\frontend-deployment.yaml
              if exist k8s\\frontend\\frontend-service-nodeport.yaml kubectl apply -n %K8S_NAMESPACE% -f k8s\\frontend\\frontend-service-nodeport.yaml
            )

            rem อัปเดต image ให้ตรงกับที่ push แล้ว
            kubectl -n %K8S_NAMESPACE% set image deploy/%DEPLOY_NAME% %CONTAINER_NAME%=%IMAGE%

            kubectl -n %K8S_NAMESPACE% rollout status deploy/%DEPLOY_NAME% --timeout=180s
            kubectl -n %K8S_NAMESPACE% get svc frontend -o wide
          '''
        }
      }
    }
  }
}
