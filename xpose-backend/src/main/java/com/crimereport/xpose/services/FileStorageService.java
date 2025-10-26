package com.crimereport.xpose.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.evidence.upload.dir}")
    private String evidenceUploadDir;

    public String storeEvidenceFile(MultipartFile file) throws IOException {

        Path evidenceDir = Paths.get(evidenceUploadDir);
        if (!Files.exists(evidenceDir)) {
            Files.createDirectories(evidenceDir);
        }


        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = evidenceDir.resolve(uniqueFileName);


        Files.copy(file.getInputStream(), filePath);

        return uniqueFileName;
    }
}