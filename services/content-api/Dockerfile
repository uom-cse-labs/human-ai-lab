# Content API container for Cloudflare Containers (see cloudflare/README.md).
# Build context: the repository root (set by image_build_context in cloudflare/admin/wrangler.jsonc).

# Java bytecode is platform-independent, so compile natively on the build machine (fast on Apple silicon too)
# and only the runtime image is linux/amd64, which Cloudflare requires.
FROM --platform=$BUILDPLATFORM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY contracts contracts
COPY services/content-api services/content-api
WORKDIR /src/services/content-api
RUN --mount=type=cache,target=/root/.gradle ./gradlew bootJar --no-daemon --console=plain -q

FROM eclipse-temurin:21-jre
RUN useradd --system --uid 10001 api && mkdir /data && chown api /data
WORKDIR /app
COPY --from=build /src/services/content-api/build/libs/content-api.jar content-api.jar
# The website's built-in content, imported once on the very first start (hai.seed-dir).
COPY apps/web/src/content seed/content
COPY apps/web/src/data.json seed/data.json
USER api
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=cloudflare \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:TieredStopAtLevel=1 -XX:+UseSerialGC"
ENTRYPOINT ["java", "-jar", "/app/content-api.jar"]
