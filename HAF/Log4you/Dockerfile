FROM openjdk:8-jre-alpine

WORKDIR /app

COPY log4j-demo-0.0.1-SNAPSHOT.jar /app/myapp.jar

RUN echo "FLAG{sample_flag}" > /flag.txt

RUN chmod 444 /flag.txt
RUN chmod 444 /app/myapp.jar

CMD ["java", "-jar", "/app/myapp.jar"]