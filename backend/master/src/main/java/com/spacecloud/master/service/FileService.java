package com.spacecloud.master.service;

import com.spacecloud.master.entity.FileEntity;
import com.spacecloud.master.repository.FileRepository;
import com.spacecloud.master.dto.FileInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    public List<FileInfo> getFileInfoList() {
        List<FileEntity> files = fileRepository.findAll();
        List<FileInfo> response = files.stream()
                .map((file) -> new FileInfo(file.getId().toString(), file.getFileName(), file.getFileSize()))
                .toList();
        return response;
    }
}
