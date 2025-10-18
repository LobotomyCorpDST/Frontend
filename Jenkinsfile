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
                    bat 'docker build . -t mmmmnl/lobotomy_but_front:v.0.0'
                }
            }
        }

        stage('List image') {
            steps {
                bat 'docker images'
            }
        }

        stage('Login Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD'
                    )
                ]) {
                    bat '''
                        docker logout
                        echo %DOCKERHUB_PASSWORD% | docker login -u %DOCKERHUB_USERNAME% --password-stdin
                    '''
                }
            }
        }

        stage('Push image') {
            steps {
                bat 'docker push mmmmnl/lobotomy_but_front:v.0.0'
            }
        }

        stage('Deploy to K8s') {
            steps {
                withCredentials([
                    file(credentialsId: 'frontend-env-file', variable: 'ENV_FILE'),
                    file(credentialsId: 'kubeconfig-prod',  variable: 'KUBECONFIG_FILE') 
                ]) {
                    bat """
                        REM --- Load env vars from secret file (รองรับ path ที่มีช่องว่าง) ---
                        for /f "usebackq tokens=1,* delims==" %%a in ("%ENV_FILE%") do set %%a=%%b

                        echo Loaded env: %K8S_NAMESPACE% %DEPLOY_NAME% %CONTAINER_NAME% %IMAGE_REPO%

                        REM --- Set kubeconfig ---
                        set KUBECONFIG=%KUBECONFIG_FILE%

                        REM --- Sanity checks ---
                        kubectl version --client
                        kubectl config current-context

                        REM --- Apply manifests ---
                        kubectl apply -n %K8S_NAMESPACE% -k app\\k8s\\

                        REM --- Compute TAG ---
                        for /f %%i in ('git rev-parse --short HEAD ^|^| echo %BUILD_NUMBER%') do set TAG=%%i
                        echo Using TAG=%TAG%

                        REM --- Set new image to the deployment ---
                        kubectl -n %K8S_NAMESPACE% set image deploy/%DEPLOY_NAME% %CONTAINER_NAME%=%IMAGE_REPO%:%TAG%

                        REM --- Wait rollout ---
                        kubectl -n %K8S_NAMESPACE% rollout status deploy/%DEPLOY_NAME% --timeout=600s
                    """
                }
            }
        }
    }
}
