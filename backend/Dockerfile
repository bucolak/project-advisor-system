# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Önce sadece pom.xml'i kopyala, bağımlılıkları cache'le
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Kaynak kodu kopyala ve build al
COPY src src
RUN mvn clean package -DskipTests -B

# ---- Run stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
