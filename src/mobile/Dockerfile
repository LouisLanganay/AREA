FROM openjdk:11-jdk

RUN apt-get update && apt-get install -y nodejs npm && npm install -g react-native-cli

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["bash", "-c", "cd android && ./gradlew assembleDebug && cp app/build/outputs/apk/debug/app-debug.apk /app/shared/client.apk"]
