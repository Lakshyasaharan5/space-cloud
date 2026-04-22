package com.spacecloud.master.dto;

import lombok.Data;

import java.util.List;

@Data
public class ChunkMapResponse {
    private String fileId;
    private int totalChunks;
    private List<String> datanodes;
    private List<ChunkInfo> chunks;
}