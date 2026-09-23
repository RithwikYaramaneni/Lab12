pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
        DOCKER_HUB_CRED = 'docker-hub-credentials'
        DOCKER_IMAGE    = 'rithwik8/node-blue-green'
        BUILD_TAG       = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                sh 'git status'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${BUILD_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${BUILD_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CRED}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh "docker push ${DOCKER_IMAGE}:${BUILD_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Deploy to Blue/Green Environment') {
            steps {
                script {
                    sh 'docker compose up -d nginx'

                    def activeEnv = sh(
                        script: "docker ps --format '{{.Names}}' | grep app_blue || true",
                        returnStdout: true
                    ).trim()

                    if (activeEnv == "app_blue") {
                        echo "Active environment is BLUE. Deploying to GREEN..."
                        sh 'docker compose up -d app_green'
                        sh "sed -i '' 's/app_blue:3000/app_green:3000/g' nginx.conf"
                        sh 'docker exec nginx_proxy nginx -s reload'
                        echo "Traffic routed to GREEN environment."
                    } else {
                        echo "Active environment is GREEN. Deploying to BLUE..."
                        sh 'docker compose up -d app_blue'
                        sh "sed -i '' 's/app_green:3000/app_blue:3000/g' nginx.conf"
                        sh 'docker exec nginx_proxy nginx -s reload'
                        echo "Traffic routed to BLUE environment."
                    }
                }
            }
        }

        stage('Health Check & Verification') {
            steps {
                sh 'curl -f http://localhost:80 || exit 1'
            }
        }
    }

    post {
        success {
            echo "Blue-Green Deployment completed successfully with zero downtime!"
        }
        failure {
            echo "Deployment failed. Review logs for details."
        }
    }
}