package com.spacecloud.datanode.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class ChunkStorageService {

    public String storeChunk(String fileId, int chunkIndex, HttpServletRequest request) throws IOException {
        InputStream inputStream = request.getInputStream();

        Path dir = Paths.get("data", fileId);
        Files.createDirectories(dir);

        Path filePath = dir.resolve(String.valueOf(chunkIndex));

        Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        return "Ok";
    }
}
