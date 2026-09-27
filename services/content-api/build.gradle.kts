import org.openapitools.generator.gradle.plugin.tasks.GenerateTask

plugins {
    java
    id("org.springframework.boot") version "4.0.8"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.openapi.generator") version "7.25.0"
}

group = "lk.ac.mrt.cse.hai"
version = "0.1.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

configurations.all {
    // Lambda: the adapter provides the servlet container; the AWS SDK uses the URL-connection client.
    exclude(group = "org.springframework.boot", module = "spring-boot-starter-tomcat")
    exclude(group = "software.amazon.awssdk", module = "netty-nio-client")
    exclude(group = "software.amazon.awssdk", module = "apache-client")
    exclude(group = "software.amazon.awssdk", module = "apache5-client")
}

val tomcatForLocalRun: Configuration by configurations.creating

dependencies {
    implementation(platform("software.amazon.awssdk:bom:2.55.6"))

    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-security-oauth2-resource-server")
    implementation("com.amazonaws.serverless:aws-serverless-java-container-springboot4:3.0.2")
    implementation("com.amazonaws:aws-lambda-java-core:1.4.0")
    implementation("software.amazon.awssdk:sesv2")
    implementation("software.amazon.awssdk:s3") // Cloudflare R2 through its S3-compatible API
    implementation("software.amazon.awssdk:url-connection-client")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.springframework.boot:spring-boot-starter-security-test")
    testImplementation("com.tngtech.archunit:archunit-junit5:1.5.1")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

// ---------------------------------------------------------------------------
// Contract-first: Java interfaces and DTOs are generated from contracts/openapi.yaml.
// ---------------------------------------------------------------------------
val generatedDir = layout.buildDirectory.dir("generated/openapi")

tasks.named<GenerateTask>("openApiGenerate") {
    generatorName.set("spring")
    inputSpec.set(rootDir.resolve("../../contracts/openapi.yaml").canonicalPath)
    outputDir.set(generatedDir.get().asFile.path)
    apiPackage.set("lk.ac.mrt.cse.hai.api.contract.api")
    modelPackage.set("lk.ac.mrt.cse.hai.api.contract.model")
    globalProperties.set(mapOf("apis" to "", "models" to "", "supportingFiles" to "false"))
    configOptions.set(
        mapOf(
            "interfaceOnly" to "true",
            "skipDefaultInterface" to "true",
            "useTags" to "true",
            "useSpringBoot3" to "true",
            "useJakartaEe" to "true",
            "useBeanValidation" to "true",
            "openApiNullable" to "false",
            "documentationProvider" to "none",
            "annotationLibrary" to "none",
            "dateLibrary" to "java8",
            "hideGenerationTimestamp" to "true",
            "sourceFolder" to "",
        ),
    )
}

sourceSets {
    main {
        java.srcDir(generatedDir)
    }
}

tasks.compileJava {
    dependsOn("openApiGenerate")
}

// ---------------------------------------------------------------------------
// Lambda deployment package: classes + resources at the root, dependencies in lib/.
// ---------------------------------------------------------------------------
tasks.register<Zip>("buildZip") {
    group = "build"
    description = "Packages the Lambda deployment zip (build/distributions/content-api.zip)."
    archiveFileName.set("content-api.zip")
    from(tasks.compileJava)
    from(tasks.processResources)
    into("lib") {
        from(configurations.runtimeClasspath)
    }
}

tasks.build {
    dependsOn("buildZip")
}

// `./gradlew bootRun` for local development and the Cloudflare container need an embedded server,
// which the Lambda package excludes.
dependencies {
    tomcatForLocalRun("org.apache.tomcat.embed:tomcat-embed-core")
    tomcatForLocalRun("org.springframework.boot:spring-boot-tomcat")
}

// Cloudflare container image: one runnable jar, build/libs/content-api.jar (see Dockerfile).
tasks.bootJar {
    archiveFileName.set("content-api.jar")
    classpath(tomcatForLocalRun)
}

tasks.bootRun {
    classpath += tomcatForLocalRun
    systemProperty("spring.profiles.active", "local")
}

tasks.test {
    useJUnitPlatform()
    // Settings normally injected by CDK; tests never call AWS.
    systemProperty("COGNITO_ISSUER_URI", "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_test")
    systemProperty("COGNITO_CLIENT_ID", "test-client")
    systemProperty("MAIL_PROVIDER", "log")
    systemProperty("MAIL_FROM_ADDRESS", "no-reply@example.org")
    systemProperty("MAIL_TO_ADDRESS", "lab@example.org")
}
