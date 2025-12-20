package com.vulnuris.notesservice.repository;

import com.vulnuris.notesservice.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    // Returns all notes for a specific tenant
    List<Note> findByTenantId(Long tenantId);

    // Returns a note only if it belongs to the specified tenant
    Optional<Note> findByIdAndTenantId(Long id, Long tenantId);

    // Counts notes for a specific tenant (used for subscription limit enforcement - per tenant)
    long countByTenantId(Long tenantId);

    // Counts notes for a specific user within a tenant (used for per-user subscription limits)
    long countByTenantIdAndCreatedBy(Long tenantId, Long createdBy);
}
