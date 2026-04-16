package com.spacecloud.master.dto;

import lombok.Data;

@Data
public class UploadInitRequest {
    private String fileName;
    private long fileSize;
    private String clientUploadId;
}
