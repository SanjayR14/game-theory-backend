pipeline {
    agent any

    tools {
        nodejs "Node18"
    }
    stages {

        stage('Hello') {
            steps {
                echo 'Pipeline Started...'
            }
        }

        stage('Git') {
            steps {
                git branch: 'main',
                url: 'https://github.com/SanjayR14/game-theory-backend'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo 'No tests configured'
            }
        }

        stage('SonarQube Scan') {
            steps {
                echo 'SonarQube Scan'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t node-app:v1 .'
            }
        }

       stage('Trivy Scan') {
        steps {
            sh '''
            trivy image \
              --scanners vuln \
              --severity HIGH,CRITICAL \
              node-app:v1
            '''
        }
    }

      stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    '''
                }
            }
        }
        stage('Docker Push') {
            steps {
                sh '''
                docker tag node-app:v1 sanjuhu/node-app:v1
                docker push sanjuhu/node-app:v1
                '''
            }
        }
    }
}
