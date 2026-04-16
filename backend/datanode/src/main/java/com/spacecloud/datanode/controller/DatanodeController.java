package com.spacecloud.datanode.controller;

import com.spacecloud.datanode.service.ChunkStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@RestController
@RequestMapping("/datanode")
public class DatanodeController {

    @Autowired
    private ChunkStorageService chunkStorageService;

    @PutMapping("/chunks/{fileId}/{chunkIndex}")
    public String uploadChunk(@PathVariable String fileId, @PathVariable int chunkIndex, HttpServletRequest request) throws IOException {
        return chunkStorageService.storeChunk(fileId, chunkIndex, request);
    }

    @GetMapping("health")
    public String healthCheck() {
        return "Datanode doing good!";
    }
}
