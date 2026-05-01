package com.spacecloud.master.controller;

import com.spacecloud.master.dto.FileInfo;
import com.spacecloud.master.dto.UploadInitRequest;
import com.spacecloud.master.dto.ChunkMapResponse;
import com.spacecloud.master.grpc.DeleteGrpcClient;
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

    @Autowired
    private DeleteGrpcClient deleteGrpcClient;

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
    public String deleteFile(@PathVariable String fileId) {
        // TODO: mark file as deleted in DB (soft delete)

        new Thread(() -> deleteGrpcClient.deleteFileOnAll(fileId)).start();

        return "Delete triggered";
    }

    @GetMapping("/health")
    public String health() {
        return "Master is up";
    }
}
