FROM openjdk:8-jdk-alpine

RUN adduser -D -h /home/user user

ARG JAR_FILE=log4j-demo-0.0.1-SNAPSHOT.jar

WORKDIR /app

COPY ${JAR_FILE} /app/log4j.jar

RUN echo "FLAG{i_w2nt_t0_wri5te_1og_y0ur_n8me}" > /flag.txt

RUN chown user:user /app/log4j.jar
RUN chmod 444 /flag.txt

USER user

EXPOSE 8088

ENTRYPOINT ["java", "-jar", "/app/log4j.jar"]