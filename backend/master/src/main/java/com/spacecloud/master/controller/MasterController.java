package com.spacecloud.master.controller;

import com.spacecloud.master.dto.FileInfo;
import com.spacecloud.master.dto.UploadInitRequest;
import com.spacecloud.master.dto.ChunkMapResponse;
import com.spacecloud.master.service.ChunkService;
import com.spacecloud.master.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class MasterController {

    @Autowired
    private ChunkService chunkService;

    @Autowired
    private FileService fileService;

    @PostMapping("/upload/init")
    public ChunkMapResponse getChunkMapping(@RequestBody UploadInitRequest fileInfo) {
        return chunkService.createChunkMapping(fileInfo);
    }

    @GetMapping("/download/{fileId}")
    public ChunkMapResponse getChunkMapping(@PathVariable UUID fileId) {
        return chunkService.getChunkMapping(fileId);
    }

    @GetMapping("/files")
    public List<FileInfo> getFiles() {
        return fileService.getFileInfoList();
    }

    @DeleteMapping("/delete/{fileId}")
    public String deleteFile(@PathVariable UUID fileId) {
        // Phase 1: mark deleted + drop chunk metadata (committed before gRPC)
        fileService.softDelete(fileId);

        // Phase 2: notify datanodes, then remove file row once they confirm
        fileService.deleteFromDatanodesAndCleanup(fileId);

        return "Deleted";
    }

    @GetMapping("/health")
    public String health() {
        return "Master is up";
    }
}
