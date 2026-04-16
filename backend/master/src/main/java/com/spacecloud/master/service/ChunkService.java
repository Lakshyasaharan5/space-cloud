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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChunkService {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private ChunkRepository chunkRepository;

    public UploadInitResponse createChunkMapping(UploadInitRequest request) {
        FileEntity existing = fileRepository.findByClientUploadId(request.getClientUploadId());

        if (existing != null) {
            List<ChunkEntity> existingChunks = chunkRepository.findByFileId(existing.getClientUploadId());

            // rebuild response
            List<ChunkInfo> chunks = existingChunks.stream().map(c -> {
                ChunkInfo info = new ChunkInfo();
                info.setChunkIndex(c.getChunkIndex());
                info.setPrimary(c.getPrimaryNode());

                List<Integer> replicas = Arrays.stream(c.getReplicaNodes().split(","))
                        .map(Integer::parseInt)
                        .toList();

                info.setReplicas(replicas);
                return info;
            }).toList();

            UploadInitResponse response = new UploadInitResponse();
            response.setFileId(existing.getClientUploadId());
            response.setDatanodes(List.of(
                    "http://localhost:8081",
                    "http://localhost:8082",
                    "http://localhost:8083"
            ));
            response.setTotalChunks(existing.getTotalChunks());
            response.setChunks(chunks);

            return response;
        }

        final int CHUNK_SIZE = 1024 * 1024; //1mb
        int totalChunks = (int) Math.ceil((double) request.getFileSize() / CHUNK_SIZE);
        List<String> datanodes = List.of(
                "http://localhost:8081",
                "http://localhost:8082",
                "http://localhost:8083"
        );

        // frontend should send it so if user hits the api multiple times
        // we shouldn't duplicate
        String fileId = UUID.randomUUID().toString();

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
            entity.setFileId(fileId);
            entity.setChunkIndex(i);
            entity.setPrimaryNode(primaryIndex);
            String replicaStr = replicas.stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
            entity.setReplicaNodes(replicaStr);
            chunkEntities.add(entity);
        }

        UploadInitResponse response = new UploadInitResponse();
        response.setFileId(fileId);
        response.setDatanodes(datanodes);
        response.setTotalChunks(totalChunks);
        response.setChunks(chunks);

        // store metadata
        FileEntity file = new FileEntity();
        file.setFileName(request.getFileName());
        file.setCreatedAt(LocalDateTime.now().toString());
        file.setClientUploadId(request.getClientUploadId());
        file.setFileSize(request.getFileSize());
        file.setChunkSize(CHUNK_SIZE);
        file.setTotalChunks(totalChunks);
        fileRepository.save(file);
        chunkRepository.saveAll(chunkEntities);
        return response;
    }
}