<<<<<<< HEAD
# Build stage
FROM maven:3-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn -f /app/pom.xml clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.war backend.war
EXPOSE 8080
ENTRYPOINT ["java","-jar","backend.war"]
=======
# Build stage
FROM maven:3-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn -f /app/pom.xml clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.war backend.war
EXPOSE 8080
ENTRYPOINT ["java","-jar","backend.war"]
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
