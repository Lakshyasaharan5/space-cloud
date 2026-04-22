package com.spacecloud.master.service;

import com.spacecloud.master.dto.ChunkInfo;
import com.spacecloud.master.dto.UploadInitRequest;
import com.spacecloud.master.dto.UploadInitResponse;
import com.spacecloud.master.entity.ChunkEntity;
import com.spacecloud.master.entity.FileEntity;
import com.spacecloud.master.repository.ChunkRepository;
import com.spacecloud.master.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChunkService {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private ChunkRepository chunkRepository;

    @Transactional
    public UploadInitResponse createChunkMapping(UploadInitRequest request) {

        final int CHUNK_SIZE = 1024 * 1024; //1mb
        int totalChunks = (int) Math.ceil((double) request.getFileSize() / CHUNK_SIZE);
        List<String> datanodes = List.of(
                "http://localhost:8081",
                "http://localhost:8082",
                "http://localhost:8083"
        );

        // store file metadata
        FileEntity file = new FileEntity();
        file.setFileName(request.getFileName());
        file.setCreatedAt(LocalDateTime.now().toString());
        file.setFileSize(request.getFileSize());
        file.setChunkSize(CHUNK_SIZE);
        file.setTotalChunks(totalChunks);
        file = fileRepository.save(file);

        List<ChunkInfo> chunks = new ArrayList<>();
        List<ChunkEntity> chunkEntities = new ArrayList<>();

        int n = datanodes.size();
        int replicationFactor = 2; // total copies = 1 primary + 1 replica

        for (int i = 0; i < totalChunks; i++) {
            int primaryIndex = i % n;

            ChunkInfo chunk = new ChunkInfo();
            chunk.setChunkIndex(i);
            chunk.setPrimary(primaryIndex);

            long chunkSize = CHUNK_SIZE;
            if (i == totalChunks - 1) {
                chunkSize = request.getFileSize() - ((long) i * CHUNK_SIZE);
            }
            chunk.setChunkSize(chunkSize);

            List<Integer> replicas = new ArrayList<>();
            for (int r = 1; r < replicationFactor; r++) {
                int replicaIndex = (primaryIndex + r) % n;
                replicas.add(replicaIndex);
            }

            chunk.setReplicas(replicas);
            chunks.add(chunk);

            // chunk metadata
            ChunkEntity entity = new ChunkEntity();
            entity.setFile(file);
            entity.setChunkIndex(i);
            entity.setPrimaryNode(primaryIndex);
            String replicaStr = replicas.stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
            entity.setReplicaNodes(replicaStr);
            chunkEntities.add(entity);
        }

        chunkRepository.saveAll(chunkEntities);

        UploadInitResponse response = new UploadInitResponse();
        response.setFileId(file.getId().toString());
        response.setDatanodes(datanodes);
        response.setTotalChunks(totalChunks);
        response.setChunks(chunks);

        return response;
    }
}