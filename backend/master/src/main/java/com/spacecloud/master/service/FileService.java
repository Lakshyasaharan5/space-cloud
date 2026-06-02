package com.spacecloud.master.service;

import com.spacecloud.master.entity.FileEntity;
import com.spacecloud.master.grpc.DeleteGrpcClient;
import com.spacecloud.master.repository.ChunkRepository;
import com.spacecloud.master.repository.FileRepository;
import com.spacecloud.master.dto.FileInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.UUID;

@Service
public class FileService {

    private FileRepository fileRepository;
    private ChunkRepository chunkRepository;
    private DeleteGrpcClient deleteGrpcClient;
    private RestClient restClient;

    public FileService(FileRepository fileRepository, ChunkRepository chunkRepository, DeleteGrpcClient deleteGrpcClient) {
        this.fileRepository = fileRepository;
        this.chunkRepository = chunkRepository;
        this.deleteGrpcClient = deleteGrpcClient;
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:3001")
                .build();
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
        System.out.println("Start file embedding kafka");
    }

    public void search() {
        System.out.println("Searching for files");
        String res = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", "Where is my anime?")
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(String.class);
        System.out.println(res);
    }
}
