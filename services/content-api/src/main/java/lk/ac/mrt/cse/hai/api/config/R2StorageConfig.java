package lk.ac.mrt.cse.hai.api.config;

import java.net.URI;
import java.nio.file.Path;
import lk.ac.mrt.cse.hai.api.adapters.file.FileMirror;
import lk.ac.mrt.cse.hai.api.adapters.r2.R2Mirror;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.checksums.RequestChecksumCalculation;
import software.amazon.awssdk.core.checksums.ResponseChecksumValidation;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * {@code hai.storage=r2}: the data folder is backed by an R2 bucket through R2's S3-compatible API.
 * Credentials are an R2 API token (access key id and secret), passed in by the dashboard Worker.
 */
@Configuration
@ConditionalOnProperty(prefix = "hai", name = "storage", havingValue = "r2")
public class R2StorageConfig {

    /** Created before the file adapters, so the data folder is restored before anything reads it. */
    @Bean
    FileMirror r2Mirror(
            @Value("${hai.data-dir}") String dataDir,
            @Value("${hai.r2.account-id}") String accountId,
            @Value("${hai.r2.access-key-id}") String accessKeyId,
            @Value("${hai.r2.secret-access-key}") String secretAccessKey,
            @Value("${hai.r2.bucket}") String bucket,
            @Value("${hai.r2.endpoint:}") String endpoint) {
        S3Client s3 = S3Client.builder()
                // The endpoint override is for trying the image against a local S3-compatible server (MinIO).
                .endpointOverride(URI.create(endpoint.isBlank() ? "https://" + accountId + ".r2.cloudflarestorage.com" : endpoint))
                .region(Region.of("auto"))
                .forcePathStyle(true)
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                .httpClient(UrlConnectionHttpClient.create())
                // R2 does not support every checksum mode newer AWS SDKs send by default.
                .requestChecksumCalculation(RequestChecksumCalculation.WHEN_REQUIRED)
                .responseChecksumValidation(ResponseChecksumValidation.WHEN_REQUIRED)
                .build();
        R2Mirror mirror = new R2Mirror(s3, bucket, Path.of(dataDir));
        mirror.restore();
        return mirror;
    }
}
