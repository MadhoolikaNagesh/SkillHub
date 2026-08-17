FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY gradlew build.gradle settings.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew

RUN ./gradlew dependencies --no-daemon || true

COPY src ./src
RUN ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 9000

ENV PORT=9000

ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
