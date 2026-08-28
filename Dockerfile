FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace

COPY backend/pom.xml .

RUN mvn -B -q dependency:go-offline

COPY backend/src ./src

RUN mvn -B -q clean package -DskipTests


FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S landed && adduser -S landed -G landed

WORKDIR /app

COPY --from=build /workspace/target/landed-api-*.jar app.jar

USER landed

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-8080}/actuator/health >/dev/null || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=65.0", "-XX:+ExitOnOutOfMemoryError", "-jar", "/app/app.jar"]