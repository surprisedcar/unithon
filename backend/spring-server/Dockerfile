FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

COPY gradlew build.gradle settings.gradle ./
COPY gradle ./gradle
RUN sed -i 's/\r$//' gradlew \
    && chmod +x gradlew

COPY src ./src
RUN ./gradlew clean bootJar --no-daemon

FROM eclipse-temurin:21-jre-jammy AS runtime

RUN groupadd --system spring \
    && useradd --system --gid spring spring

WORKDIR /app
COPY --from=builder --chown=spring:spring /app/build/libs/health-absence-0.0.1-SNAPSHOT.jar app.jar

USER spring
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
