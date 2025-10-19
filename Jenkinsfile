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
                    sh 'docker build . -t mmmmnl/lobotomy_but_front:v.0.0'
                }
            }
        }
        stage('List image') {
            steps {
                sh 'docker images'
            }
        }
        stage('Login Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-creds',
                                                 usernameVariable: 'DOCKERHUB_USERNAME',
                                                 passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                    sh '''
                        echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin
                    '''
                }
            }
        }
        stage('Push image') {
            steps {
                sh 'docker push mmmmnl/lobotomy_but_front:v.1.0'
            }
        }

        stage('Deploy to K8s') {
            steps {
                withCredentials([
                file(credentialsId: 'kubeconfig-prod',   variable: 'KUBECONFIG_FILE'),
                file(credentialsId: 'frontend-env-file', variable: 'ENV_FILE')
                ]) {
                sh '''
                    set -euo pipefail

                    # ใช้ kubeconfig ที่ส่งมาเป็นไฟล์
                    export KUBECONFIG="${KUBECONFIG_FILE}"

                    # โหลดตัวแปรจาก secret file (รูปแบบ KEY=VALUE)
                    # set -a ทำให้ตัวแปรที่ถูก "source" ถูก export กลายเป็น env ทันที
                    set -a
                    . "${ENV_FILE}"
                    set +a

                    # ตรวจว่า key สำคัญมีครบ
                    : "${K8S_NAMESPACE:?K8S_NAMESPACE missing in secret file}"
                    : "${DEPLOY_NAME:?DEPLOY_NAME missing in secret file}"
                    : "${CONTAINER_NAME:?CONTAINER_NAME missing in secret file}"
                    : "${IMAGE_REPO:?IMAGE_REPO missing in secret file}"
                    # IMAGE_TAG จะมีหรือไม่มีก็ได้ ถ้าไม่มีก็ fallback เป็น commit/BUILD_NUMBER
                    IMAGE_TAG="${IMAGE_TAG:-}"

                    # Apply manifests
                    kubectl apply -n "${K8S_NAMESPACE}" -f app/k8s/

                    # กำหนด image ให้ตรง tag ที่กำหนดใน secret file
                    if [ -n "${IMAGE_TAG}" ]; then
                    IMAGE="${IMAGE_REPO}:${IMAGE_TAG}"
                    else
                    TAG="$(git rev-parse --short HEAD 2>/dev/null || echo "${BUILD_NUMBER}")"
                    IMAGE="${IMAGE_REPO}:${TAG}"
                    fi

                    kubectl -n "${K8S_NAMESPACE}" set image "deploy/${DEPLOY_NAME}" "${CONTAINER_NAME}=${IMAGE}"

                    # ติดตามผล rollout
                    kubectl -n "${K8S_NAMESPACE}" rollout status "deploy/${DEPLOY_NAME}" --timeout=180s
                '''
                }
            }
        }


    }
}
