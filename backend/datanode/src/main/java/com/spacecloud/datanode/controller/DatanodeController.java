package com.spacecloud.datanode.controller;

import com.spacecloud.datanode.service.ChunkStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
public class DatanodeController {

    @Autowired
    private ChunkStorageService chunkStorageService;

    @PutMapping("/chunks/{fileId}/{chunkIndex}")
    public String uploadChunk(@PathVariable String fileId, @PathVariable int chunkIndex, HttpServletRequest request) throws IOException {
        return chunkStorageService.storeChunk(fileId, chunkIndex, request);
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
