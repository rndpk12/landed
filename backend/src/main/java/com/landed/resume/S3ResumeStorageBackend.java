package com.landed.resume;

import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.net.URI;

@Component
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
class S3ResumeStorageBackend implements ResumeStorageBackend {
    private final S3Client client;
    private final String bucket;
    private final String prefix;

    S3ResumeStorageBackend(
            @Value("${app.storage.s3.bucket}") String bucket,
            @Value("${app.storage.s3.region:auto}") String region,
            @Value("${app.storage.s3.endpoint:}") String endpoint,
            @Value("${app.storage.s3.access-key:}") String accessKey,
            @Value("${app.storage.s3.secret-key:}") String secretKey,
            @Value("${app.storage.s3.prefix:resumes/}") String prefix,
            @Value("${app.storage.s3.path-style-access:false}") boolean pathStyleAccess) {
        this.bucket = requireValue(bucket, "S3 resume bucket");
        this.prefix = normalizePrefix(prefix);

        var builder = S3Client.builder()
                .region(Region.of(region))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(pathStyleAccess)
                        .build());
        if (StringUtils.hasText(endpoint)) {
            builder.endpointOverride(URI.create(endpoint.trim()));
        }
        if (StringUtils.hasText(accessKey) || StringUtils.hasText(secretKey)) {
            builder.credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(
                    requireValue(accessKey, "S3 access key"),
                    requireValue(secretKey, "S3 secret key"))));
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }
        this.client = builder.build();
    }

    @Override
    public void store(String key, byte[] bytes, String contentType) {
        client.putObject(PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(objectKey(key))
                        .contentType(contentType)
                        .build(),
                RequestBody.fromBytes(bytes));
    }

    @Override
    public Resource load(String key) {
        ResponseInputStream<GetObjectResponse> stream = client.getObject(GetObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey(key))
                .build());
        return new InputStreamResource(stream);
    }

    @Override
    public void delete(String key) {
        client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey(key))
                .build());
    }

    @PreDestroy
    void close() {
        client.close();
    }

    private String objectKey(String key) {
        return prefix + key;
    }

    private String normalizePrefix(String value) {
        if (!StringUtils.hasText(value)) return "";
        String normalized = value.trim().replaceAll("^/+", "");
        return normalized.endsWith("/") ? normalized : normalized + "/";
    }

    private String requireValue(String value, String label) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException(label + " is required when app.storage.type=s3");
        }
        return value.trim();
    }
}
