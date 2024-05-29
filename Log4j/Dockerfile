FROM openjdk:8-jdk-alpine
ARG JAR_FILE=log4j-demo-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} log4j.jar
ENV JAVA_OPTS = "-Dsun.net.spi.nameservice.provider.1=dns,sun"
ENTRYPOINT ["java", "$JAVA_OPTS", "-jar", "/log4j.jar"]
