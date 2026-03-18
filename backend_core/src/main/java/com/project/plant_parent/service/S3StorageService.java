package com.project.plant_parent.service;

import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.exception.BusinessException;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

@Service
@Slf4j
@Profile("prod")
@RequiredArgsConstructor
public class S3StorageService implements StorageService{
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name:plant-parent-image-bucket}")
    private String bucketName;

    @Value("${aws.s3.region:ap-northeast-2}")
    private String region;

    private static final String S3_PREFIX = "uploads/";

    @Override
    public String saveFile(MultipartFile file) throws IOException {
        String uuid = UUID.randomUUID().toString();
        String originalName = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "-")
                : "file";
        String fileName = S3_PREFIX + uuid + "_" + originalName;

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putRequest,
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        log.info(">>> S3 파일 저장 성공: s3://{}/{}", bucketName, fileName);
        return fileName;
    }

    @Override
    public String getFileUrl(String fileName) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build());
        } catch (Exception e) {
            log.error(">>> S3 파일 삭제 실패: {}", fileName,e);
        }
    }

    @Override
    public void deleteByUrl(String imageUrl) {
        if(imageUrl == null || imageUrl.isBlank()) return;
        try{
            URI uri = URI.create(imageUrl);
            String fileName = uri.getPath().startsWith("/") ? uri.getPath().substring("/".length()) : uri.getPath();
            deleteFile(fileName);

        }catch (Exception e){
            log.error(">>> url에서 fileName 추출 실패: {}", imageUrl,e);
        }
    }

    @Override
    public Resource loadAsResource(String fileName) {
        String s3Key = S3_PREFIX + fileName;
        try{
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();
            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(request);
            byte[] data = objectBytes.asByteArray();
            log.info(">>> S3에서 파일 로드 성공: {}", s3Key);
            return new ByteArrayResource(data) {
                @Override
                public String getFilename() {
                    return fileName;
                }
            };
        } catch (Exception e) {
            log.error(">>> S3에서 파일 로드 실패 : {}", s3Key, e);
            throw new BusinessException(ErrorCode.GLOBAL_INVALID_INPUT);
        }
    }
}
