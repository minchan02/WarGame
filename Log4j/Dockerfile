FROM openjdk:8-jdk-alpine
ARG JAR_FILE=log4j-demo-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} log4j.jar
ENTRYPOINT ["java", "-jar", "/log4j.jar"]
