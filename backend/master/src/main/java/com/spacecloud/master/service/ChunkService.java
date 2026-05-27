package com.spacecloud.master.service;

import com.spacecloud.master.dto.ChunkInfo;
import com.spacecloud.master.dto.UploadInitRequest;
import com.spacecloud.master.dto.ChunkMapResponse;
import com.spacecloud.master.entity.ChunkEntity;
import com.spacecloud.master.entity.FileEntity;
import com.spacecloud.master.repository.ChunkRepository;
import com.spacecloud.master.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChunkService {

    final int CHUNK_SIZE = 1024 * 1024; //1mb
    final List<String> datanodes = List.of(
            "http://localhost:8081",
            "http://localhost:8082",
            "http://localhost:8083"
    );

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private ChunkRepository chunkRepository;

    @Transactional
    public ChunkMapResponse createChunkMapping(UploadInitRequest request) {

        int totalChunks = (int) Math.ceil((double) request.getFileSize() / CHUNK_SIZE);

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
            /*
            this is fine for initial placement but when someone deletes a file then
            size of datanodes might get imbalanced so better approach is to keep track
            of each datanode's usedBytes and then store the new chunks to the least occupied
            */
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

        ChunkMapResponse response = new ChunkMapResponse();
        response.setFileId(file.getId().toString());
        response.setDatanodes(datanodes);
        response.setTotalChunks(totalChunks);
        response.setChunks(chunks);

        return response;
    }

    public ChunkMapResponse getChunkMapping(UUID fileId) {
        FileEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        List<ChunkEntity> chunkEntities = chunkRepository.findByFile(fileEntity);
        List<ChunkInfo> chunks = new ArrayList<>();
        int totalChunks = chunkEntities.size();
        for (int i = 0; i < totalChunks; i++) {
            ChunkEntity chunkEntity = chunkEntities.get(i);
            ChunkInfo chunk = new ChunkInfo();
            chunk.setChunkIndex(chunkEntity.getChunkIndex());
            chunk.setPrimary(chunkEntity.getPrimaryNode());

            long chunkSize = CHUNK_SIZE;
            if (i == totalChunks - 1) {
                chunkSize = fileEntity.getFileSize() - ((long) i * CHUNK_SIZE);
            }
            chunk.setChunkSize(chunkSize);

            List<Integer> replicas = Arrays.stream(chunkEntity.getReplicaNodes().split(","))
                            .map(value -> Integer.parseInt(value))
                            .toList();
            chunk.setReplicas(replicas);

            chunks.add(chunk);
        }
        ChunkMapResponse response = new ChunkMapResponse();
        response.setFileId(fileId.toString());
        response.setTotalChunks(totalChunks);
        response.setDatanodes(datanodes);
        response.setChunks(chunks);
        return response;
    }
}