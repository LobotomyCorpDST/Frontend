pipeline {
    agent { label 'node' }

    environment {
        K8S_NAMESPACE = 'doomed-apt'
        DEPLOY_NAME   = 'frontend-deployment'  
        CONTAINER_NAME= 'frontend'              
        IMAGE_REPO    = 'mmmmnl/lobotomy_but_front' 
    }


    
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
                withCredentials([usernamePassword(credentialsId: 'docker-hub-creds',
                                                 usernameVariable: 'DOCKERHUB_USERNAME',
                                                 passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                    bat '''
                        echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin
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
                withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KUBECONFIG_FILE')]) {
                bat '''
                    set -e
                    export KUBECONFIG="${KUBECONFIG_FILE}"

                    kubectl apply -n ${K8S_NAMESPACE} -f app/k8s/

                    TAG=$(git rev-parse --short HEAD || echo "${BUILD_NUMBER}")
                    kubectl -n ${K8S_NAMESPACE} rollout restart deploy/${DEPLOY_NAME}

                    kubectl -n ${K8S_NAMESPACE} rollout status deploy/${DEPLOY_NAME} --timeout=180s
                '''
                }
            }
        }

    }
}
