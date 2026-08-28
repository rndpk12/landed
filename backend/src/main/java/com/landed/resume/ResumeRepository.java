package com.landed.resume;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    Page<Resume> findByUserId(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"tags", "versions"})
    @Query("select distinct r from Resume r where r.id in :ids")
    List<Resume> findAllWithDetailsByIdIn(@Param("ids") List<UUID> ids);

    @EntityGraph(attributePaths = {"tags", "versions"})
    List<Resume> findDistinctByUserIdOrderByUpdatedAtDesc(UUID userId);

    @EntityGraph(attributePaths = {"tags", "versions"})
    Optional<Resume> findDistinctByIdAndUserId(UUID id, UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Resume r where r.id = :id and r.user.id = :userId")
    Optional<Resume> findOwnedForUpdate(@Param("id") UUID id, @Param("userId") UUID userId);
}
