package com.spacecloud.master.controller;

import com.spacecloud.master.dto.UploadInitRequest;
import com.spacecloud.master.dto.UploadInitResponse;
import com.spacecloud.master.service.ChunkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MasterController {

    @Autowired
    private ChunkService chunkService;

    @PostMapping("/upload/init")
    public UploadInitResponse getChunkMapping(@RequestBody UploadInitRequest fileInfo) {
        return chunkService.createChunkMapping(fileInfo);
    }

    @GetMapping("/health")
    public String health() {
        return "Master is up";
    }
}
