package com.spacecloud.master.service;

import com.spacecloud.master.dto.ChunkMapResponse;
import com.spacecloud.master.entity.FileEntity;
import com.spacecloud.master.grpc.DeleteGrpcClient;
import com.spacecloud.master.kakfa.Producer;
import com.spacecloud.master.repository.ChunkRepository;
import com.spacecloud.master.repository.FileRepository;
import com.spacecloud.master.dto.FileInfo;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileService {

    private FileRepository fileRepository;
    private ChunkRepository chunkRepository;
    private DeleteGrpcClient deleteGrpcClient;
    private RestClient restClient;
    private Producer producer;
    private ChunkService chunkService;

    public FileService(FileRepository fileRepository, ChunkRepository chunkRepository, DeleteGrpcClient deleteGrpcClient, Producer producer, ChunkService chunkService) {
        this.fileRepository = fileRepository;
        this.chunkRepository = chunkRepository;
        this.deleteGrpcClient = deleteGrpcClient;
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:3001")
                .build();
        this.producer = producer;
        this.chunkService = chunkService;
    }

    public List<FileInfo> getFileInfoList() {
        return fileRepository.findAllByDeletedFalse().stream()
                .map(file -> new FileInfo(file.getId().toString(), file.getFileName(), file.getFileSize()))
                .toList();
    }

    @Transactional
    public void softDelete(UUID fileId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));

        // Hide from listing immediately
        file.setDeleted(true);
        fileRepository.save(file);

        // Drop chunk metadata so download is no longer possible
        chunkRepository.deleteByFile(file);
    }

    @Async
    public void deleteFromDatanodesAndCleanup(UUID fileId) {
        // Blocking gRPC calls — each datanode deletes its physical chunks
        deleteGrpcClient.deleteFileOnAll(fileId.toString());

        // All datanodes confirmed; remove the file row itself
        fileRepository.deleteById(fileId);
    }

    public void publishFileEmbeddingKafkaEvent(UUID fileId) {
        ChunkMapResponse event = chunkService.getChunkMapping(fileId);
        System.out.println("Embedding event: " + event.toString());
        producer.sendEmbedEvent(event);
    }

    public List<FileInfo> search(String q) {
        List<Map<String, Object>> results = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", q)
                        .build())
                .retrieve()
                .body(List.class);

        if (results == null || results.isEmpty()) {
            return List.of();
        }

        List<UUID> fileIds = results.stream()
                .map(result -> UUID.fromString((String) result.get("fileId")))
                .toList();

        Map<UUID, FileEntity> filesById = fileRepository.findAllById(fileIds).stream()
                .filter(file -> !file.isDeleted())
                .collect(Collectors.toMap(FileEntity::getId, file -> file));

        return fileIds.stream()
                .map(filesById::get)
                .filter(Objects::nonNull)
                .map(file -> new FileInfo(
                        file.getId().toString(),
                        file.getFileName(),
                        file.getFileSize()
                ))
                .toList();
    }
}
