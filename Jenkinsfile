pipeline {
    agent any

    environment {
        DOCKER_HUB_CRED = 'docker-hub-credentials'
        DOCKER_IMAGE    = 'your-dockerhub-username/node-blue-green'
        BUILD_TAG       = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/your-username/blue-green-node-app.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE}:${BUILD_TAG}")
                    dockerImageTagLatest = docker.build("${DOCKER_IMAGE}:latest")
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKER_HUB_CRED}") {
                        dockerImage.push("${BUILD_TAG}")
                        dockerImageTagLatest.push("latest")
                    }
                }
            }
        }

        stage('Deploy to Blue/Green Environment') {
            steps {
                script {
                    // Check active container
                    def activeEnv = sh(
                        script: "docker ps --format '{{.Names}}' | grep app_blue || true",
                        returnStdout: true
                    ).trim()

                    if (activeEnv == "app_blue") {
                        echo "Active environment is BLUE. Deploying to GREEN..."
                        sh "docker compose up -d app_green"
                        
                        // Switch NGINX to Green
                        sh "sed -i 's/app_blue:3000/app_green:3000/g' nginx.conf"
                        sh "docker exec nginx_proxy nginx -s reload"
                        
                        echo "Traffic routed to GREEN environment."
                    } else {
                        echo "Active environment is GREEN. Deploying to BLUE..."
                        sh "docker compose up -d app_blue"
                        
                        // Switch NGINX to Blue
                        sh "sed -i 's/app_green:3000/app_blue:3000/g' nginx.conf"
                        sh "docker exec nginx_proxy nginx -s reload"
                        
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