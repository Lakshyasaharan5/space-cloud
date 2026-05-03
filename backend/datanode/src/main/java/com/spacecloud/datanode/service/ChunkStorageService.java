package com.spacecloud.datanode.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class ChunkStorageService {

    private final Path basePath;
    private final int ownIndex;
    private final List<String> peers;
    private final RestClient restClient;

    public ChunkStorageService(
            @Value("${storage.path:data}") String storagePath,
            @Value("${datanode.index}") int ownIndex,
            @Value("${datanode.peers}") List<String> peers) {
        this.basePath = Paths.get(storagePath);
        this.ownIndex = ownIndex;
        this.peers = peers;
        this.restClient = RestClient.create();
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

    public void replicateChunk(String fileId, int chunkIndex) {
        String replicaUrl = peers.get((ownIndex + 1) % peers.size());
        Path chunkPath = basePath.resolve(fileId).resolve(String.valueOf(chunkIndex));

        try {
            byte[] data = Files.readAllBytes(chunkPath);
            restClient.put()
                    .uri(replicaUrl + "/chunks/{fileId}/{chunkIndex}?forwarded=true", fileId, chunkIndex)
                    .body(data)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.out.println("Replication failed: " + e.getStackTrace());
        }
    }

    public void deleteFile(String fileId) throws IOException {
        Path dir = basePath.resolve(fileId);
        System.out.println("Deleting: " + fileId);
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