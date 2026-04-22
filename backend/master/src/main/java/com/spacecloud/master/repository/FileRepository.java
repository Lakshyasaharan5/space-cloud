package com.spacecloud.master.repository;

import com.spacecloud.master.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FileRepository extends JpaRepository<FileEntity, String> {
    @Override
    Optional<FileEntity> findById(String s);
}