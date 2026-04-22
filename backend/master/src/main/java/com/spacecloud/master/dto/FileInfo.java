package com.spacecloud.master.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FileInfo {
    private String fileId;
    private String fileName;
    private long fileSize;
}
