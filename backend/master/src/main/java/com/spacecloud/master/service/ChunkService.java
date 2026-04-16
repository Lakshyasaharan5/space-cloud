package com.spacecloud.master.service;

import com.spacecloud.master.dto.ChunkInfo;
import com.spacecloud.master.dto.UploadInitRequest;
import com.spacecloud.master.dto.UploadInitResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ChunkService {

    public UploadInitResponse createChunkMapping(UploadInitRequest request) {

        final int CHUNK_SIZE = 1024 * 1024; //1mb
        int totalChunks = (int) Math.ceil((double) request.getFileSize() / CHUNK_SIZE);
        List<String> datanodes = List.of(
                "http://localhost:8081",
                "http://localhost:8082",
                "http://localhost:8083"
        );

        String fileId = UUID.randomUUID().toString();

        List<ChunkInfo> chunks = new ArrayList<>();

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
        }

        UploadInitResponse response = new UploadInitResponse();
        response.setFileId(fileId);
        response.setDatanodes(datanodes);
        response.setTotalChunks(totalChunks);
        response.setChunks(chunks);

        return response;
    }
}