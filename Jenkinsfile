pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = "851218292096"
        AWS_REGION = "ap-south-1"
        ECR_REPO = "game-theory-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        GITOPS_REPO = "https://github.com/SanjayR14/game-theory-gitops.git"
    }

    tools {
        nodejs "Node18"
    }

    stages {

        stage('Checkout Source') {
            steps {
                git branch: 'main',
                url: 'https://github.com/SanjayR14/game-theory-backend.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                trivy image \
                --scanners vuln \
                --severity HIGH,CRITICAL \
                node-app:${IMAGE_TAG} || true
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t node-app:${IMAGE_TAG} .
                '''
            }
        }

        stage('Login to Amazon ECR') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-creds'
                ]]) {
                    sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS \
                    --password-stdin \
                    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
                    '''
                }
            }
        }

        stage('Push Image to ECR') {
            steps {
                sh '''
                docker tag node-app:${IMAGE_TAG} \
                $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:${IMAGE_TAG}

                docker push \
                $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:${IMAGE_TAG}
                '''
            }
        }

        stage('Update GitOps Repository') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-pat',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {

                    sh '''
                    rm -rf gitops

                    git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/SanjayR14/game-theory-gitops.git gitops

                    cd gitops

                    sed -i "s|image:.*|image: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:${IMAGE_TAG}|" deployment.yaml

                    git config user.email "jenkins@example.com"
                    git config user.name "Jenkins"

                    git add deployment.yaml
                    git commit -m "Update image to ${IMAGE_TAG}" || true
                    git push origin main
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Deployment completed successfully!"
        }

        failure {
            echo "Pipeline failed!"
        }
    }
}
