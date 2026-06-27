pipeline {
    agent any

    tools {
        nodejs "Node18"
    }

    environment {
        AWS_ACCOUNT_ID = "851218292096"
        AWS_REGION     = "ap-south-1"
        ECR_REPO       = "game-theory-backend"
        IMAGE_NAME     = "game-theory-backend"

        TERRAFORM_REPO = "https://github.com/SanjayR14/game-theory-terraform.git"
        GITOPS_REPO    = "https://github.com/SanjayR14/game-theory-gitops.git"
    }

    stages {

        stage('Checkout Backend') {
            steps {
                git branch: 'main',
                url: 'https://github.com/SanjayR14/game-theory-backend.git'
            }
        }

        stage('Checkout Terraform Repo') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-creds',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {

                    sh '''
                    rm -rf terraform

                    git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/SanjayR14/game-theory-terraform.git terraform
                    '''
                }
            }
        }

        stage('Terraform Init') {
            steps {
                dir('terraform') {
                    sh 'terraform init'
                }
            }
        }

        stage('Terraform Validate') {
            steps {
                dir('terraform') {
                    sh 'terraform validate'
                }
            }
        }

        stage('Terraform Plan') {
            steps {
                dir('terraform') {
                    sh 'terraform plan -out=tfplan'
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    sh 'terraform apply -auto-approve tfplan'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} .
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                trivy image \
                --severity HIGH,CRITICAL \
                --scanners vuln \
                ${IMAGE_NAME}:${BUILD_NUMBER}
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
                    aws ecr get-login-password --region ${AWS_REGION} | docker login \
                    --username AWS \
                    --password-stdin \
                    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    '''
                }
            }
        }

        stage('Push Image to Amazon ECR') {
            steps {
                sh '''
                docker tag ${IMAGE_NAME}:${BUILD_NUMBER} \
                ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${BUILD_NUMBER}

                docker push \
                ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Clone GitOps Repository') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-creds',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {

                    sh '''
                    rm -rf gitops

                    git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/SanjayR14/game-theory-gitops.git gitops
                    '''
                }
            }
        }

        stage('Update Deployment YAML') {
            steps {
                sh '''
                sed -i "s|image:.*|image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${BUILD_NUMBER}|" gitops/deployment.yaml
                '''
            }
        }

        stage('Push GitOps Changes') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-creds',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {

                    sh '''
                    cd gitops

                    git config user.email "jenkins@example.com"
                    git config user.name "Jenkins"

                    git add deployment.yaml

                    git commit -m "Update image to build ${BUILD_NUMBER}" || true

                    git push https://${GIT_USER}:${GIT_TOKEN}@github.com/SanjayR14/game-theory-gitops.git HEAD:main
                    '''
                }
            }
        }
    }

    post {

        success {

            echo "========================================"
            echo "Terraform Infrastructure Created"
            echo "Docker Image Built"
            echo "Trivy Scan Completed"
            echo "Image Pushed to Amazon ECR"
            echo "GitOps Repository Updated"
            echo "Argo CD will automatically deploy"
            echo "========================================"

        }

        failure {

            echo "========================================"
            echo "Pipeline Failed"
            echo "========================================"

        }

        always {

            sh 'docker image prune -f'

        }
    }
}
