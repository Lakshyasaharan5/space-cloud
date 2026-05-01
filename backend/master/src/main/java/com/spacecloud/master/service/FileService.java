package com.spacecloud.master.service;

import com.spacecloud.master.entity.FileEntity;
import com.spacecloud.master.grpc.DeleteGrpcClient;
import com.spacecloud.master.repository.ChunkRepository;
import com.spacecloud.master.repository.FileRepository;
import com.spacecloud.master.dto.FileInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private ChunkRepository chunkRepository;

    @Autowired
    private DeleteGrpcClient deleteGrpcClient;

    public List<FileInfo> getFileInfoList() {
        return fileRepository.findAllByDeletedFalse().stream()
                .map(file -> new FileInfo(file.getId().toString(), file.getFileName(), file.getFileSize()))
                .toList();
    }

    @Transactional
    public void softDelete(UUID fileId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));

        // Hide from listing immediately
        file.setDeleted(true);
        fileRepository.save(file);

        // Drop chunk metadata so download is no longer possible
        chunkRepository.deleteByFile(file);
    }

    @Async
    public void deleteFromDatanodesAndCleanup(UUID fileId) {
        // Blocking gRPC calls — each datanode deletes its physical chunks
        deleteGrpcClient.deleteFileOnAll(fileId.toString());

        // All datanodes confirmed; remove the file row itself
        fileRepository.deleteById(fileId);
    }
}
