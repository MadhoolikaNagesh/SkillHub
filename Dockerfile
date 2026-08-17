# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/vite.config.js ./
COPY frontend/postcss.config.js ./
COPY frontend/tailwind.config.js ./

RUN npm run build

# Stage 2: Build Spring Boot Backend with embedded static frontend
FROM eclipse-temurin:21-jdk-alpine AS backend-builder
WORKDIR /app/backend

# Copy Gradle wrapper & build configuration files
COPY backend/gradlew backend/build.gradle backend/settings.gradle ./
COPY backend/gradle ./gradle
RUN chmod +x gradlew

# Pre-fetch Gradle dependencies
RUN ./gradlew dependencies --no-daemon || true

# Copy static frontend assets into Spring Boot resources/static
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static/

# Copy backend source code and package executable bootJar
COPY backend/src ./src
RUN ./gradlew bootJar -x test --no-daemon

# Stage 3: Lightweight Production JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built JAR from Stage 2
COPY --from=backend-builder /app/backend/build/libs/*.jar app.jar

EXPOSE 8080

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
