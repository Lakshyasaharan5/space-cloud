package com.spacecloud.master.repository;

import com.spacecloud.master.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileRepository extends JpaRepository<FileEntity, String> {
    FileEntity findByClientUploadId(String clientUploadId);
}