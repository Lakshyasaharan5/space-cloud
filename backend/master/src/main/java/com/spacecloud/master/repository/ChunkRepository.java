package com.spacecloud.master.repository;

import com.spacecloud.master.entity.ChunkEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChunkRepository extends JpaRepository<ChunkEntity, Long> {
    List<ChunkEntity> findByFileId(String fileId);
}