package com.project.plant_parent.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StorageService {
    /**
     * 파일을 저장 하고 저장된 파일의 이름 반환
     * 로컬 개발 환경: UUID + 원본 파일명 ("abc-123_photo.jpg")
     * S3 : S3 오브젝트 키 ("uploads/abc-123_photo.jpg")
     */
    String saveFile(MultipartFile file) throws IOException;

    /**
     * 파일 키(식별자)를 이용해서 파일 URL 반환
     * 로컬 개발 환경: "/images/abc-123_photo.jpg"
     * S3 : S3 오브젝트 URL ("https://bucket.s3.amazonaws.com/abc-123_photo.jpg")
     */
    String getFileUrl(String fileName);

    void deleteFile(String fileName);


    void deleteByUrl(String imageUrl);
}
