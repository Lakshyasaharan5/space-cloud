package com.spacecloud.datanode.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class ChunkStorageService {

    private final Path basePath;

    public ChunkStorageService(@Value("${storage.path:data}") String storagePath) {
        this.basePath = Paths.get(storagePath);
    }

    public String storeChunk(String fileId, int chunkIndex, HttpServletRequest request) throws IOException {
        InputStream inputStream = request.getInputStream();

        Path dir = basePath.resolve(fileId);
        Files.createDirectories(dir);

        Path filePath = dir.resolve(String.valueOf(chunkIndex));

        Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        return "Ok";
    }

    public ResponseEntity<?> getChunk(String fileId, int chunkIndex) throws IOException {

        Path filePath = basePath.resolve(fileId).resolve(String.valueOf(chunkIndex));

        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        InputStream inputStream = Files.newInputStream(filePath);

        return ResponseEntity.ok()
                .header("Content-Type", "application/octet-stream")
                .body(new InputStreamResource(inputStream));
    }

    public void deleteFile(String fileId) throws IOException {
        Path dir = basePath.resolve(fileId);
        System.out.println(fileId);
        if (!Files.exists(dir)) {
            return; // idempotent
        }

        Files.walk(dir)
                .sorted((a, b) -> b.compareTo(a)) // delete children first
                .forEach(path -> {
                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException e) {
                        // ignore for now
                    }
                });
    }
}