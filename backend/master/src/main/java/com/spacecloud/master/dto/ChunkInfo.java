package com.spacecloud.master.dto;

import lombok.Data;

import java.util.List;

@Data
public class ChunkInfo {
    private int chunkIndex;
    private long chunkSize;
    private int primary;
    private List<Integer> replicas;
}