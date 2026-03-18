package com.project.plant_parent.service;

import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
@Profile("local")
public class LocalStorageService implements StorageService{
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public String saveFile(MultipartFile image) throws IOException {

        // 파일명 중복 방지를 위한 UUID 생성
        String uuid = UUID.randomUUID().toString();
        String filename = uuid + "_" + image.getOriginalFilename();

        // 저장한 경로가 없을경우 파일 생성
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        File directory = uploadPath.toFile();

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 실제 파일을 해당 경로에 저장
        File saveFile  = new File(directory, filename);


        try {
            image.transferTo(saveFile);
            log.info(">>> 파일 저장 성공: {}", saveFile.getAbsolutePath());
            return filename;
        } catch (IOException e) {
            log.info(">>> 파일 저장중 오류 발생: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public String getFileUrl(String fileKey) {
        return "/images/" + fileKey;
    }

    @Override
    public void deleteFile(String fileName) {
        Path filePath = Paths.get(uploadDir, fileName);
        try{
            boolean result = Files.deleteIfExists(filePath);
            if(result) log.info("파일 삭제 성공:{}", fileName);
            else log.warn("삭제할 파일이 존재하지 않습니다. : {}", fileName);
        } catch (IOException e) {
            log.error("파일 삭제 중 오류 발생:{}",fileName, e);
        }
    }

    @Override
    public void deleteByUrl(String imageUrl) {
        if (imageUrl != null && imageUrl.startsWith("/images/")) {
            String fileName = imageUrl.substring("/images/".length());
            deleteFile(fileName);
        }
    }

    @Override
    public Resource loadAsResource(String fileName) {
        Path path = Paths.get(uploadDir, fileName);
        File file = path.toFile();

        if (!file.exists()) {
            log.error(">>> 파일명 : {}", fileName);
            throw new BusinessException(ErrorCode.GLOBAL_FILE_NOT_FOUND);
        }

        return new FileSystemResource(path.toFile());
    }
}
