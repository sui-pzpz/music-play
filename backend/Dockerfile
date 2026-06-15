# ---- 构建阶段 ----
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /build

# 先复制 pom.xml 和 Maven wrapper，利用 Docker 缓存依赖层
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw.cmd .

# 安装 Maven（使用 wrapper 需要 bash，alpine 没有，直接用系统 maven）
RUN apk add --no-cache maven

# 下载依赖（缓存层，只要 pom.xml 不变就不会重新下载）
RUN mvn dependency:go-offline -B

# 复制源码并构建
COPY src src
RUN mvn package -DskipTests -B

# ---- 运行阶段 ----
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /build/target/music-play-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]