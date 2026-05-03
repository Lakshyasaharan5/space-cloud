package com.spacecloud.datanode.controller;

import com.spacecloud.datanode.service.ChunkStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;

@RestController
public class DatanodeController {

    @Autowired
    private ChunkStorageService chunkStorageService;

    @PutMapping("/chunks/{fileId}/{chunkIndex}")
    public String uploadChunk(
            @PathVariable String fileId,
            @PathVariable int chunkIndex,
            @RequestParam(defaultValue = "false") boolean forwarded,
            HttpServletRequest request) throws IOException {
        chunkStorageService.storeChunk(fileId, chunkIndex, request);
        if (!forwarded) {
            CompletableFuture.runAsync(() -> chunkStorageService.replicateChunk(fileId, chunkIndex));
        }
        return "Ok";
    }

    @GetMapping("/chunks/{fileId}/{chunkIndex}")
    public ResponseEntity<?> downloadChunk(@PathVariable String fileId, @PathVariable int chunkIndex) throws IOException {
        return chunkStorageService.getChunk(fileId, chunkIndex);
    }

    @GetMapping("health")
    public String healthCheck() {
        return "Datanode doing good!";
    }
}
