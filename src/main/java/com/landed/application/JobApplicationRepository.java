package com.landed.application;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID>, JpaSpecificationExecutor<JobApplication> {
    List<JobApplication> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<JobApplication> findByIdAndUserId(UUID id, UUID userId);
    int countByResumeVersionResumeId(UUID resumeId);

    @Query("""
            select a.resumeVersion.resume.id as resumeId, count(a) as applicationCount
            from JobApplication a
            where a.resumeVersion.resume.id in :resumeIds
            group by a.resumeVersion.resume.id
            """)
    List<ResumeApplicationCount> countByResumeIds(@Param("resumeIds") List<UUID> resumeIds);

    interface ResumeApplicationCount {
        UUID getResumeId();
        long getApplicationCount();
    }
}
