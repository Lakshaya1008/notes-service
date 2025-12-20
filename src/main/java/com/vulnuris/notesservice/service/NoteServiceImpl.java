package com.vulnuris.notesservice.service;

import com.vulnuris.notesservice.exception.ResourceNotFoundException;
import com.vulnuris.notesservice.exception.SubscriptionLimitExceededException;
import com.vulnuris.notesservice.model.Note;
import com.vulnuris.notesservice.model.SubscriptionPlan;
import com.vulnuris.notesservice.model.Tenant;
import com.vulnuris.notesservice.repository.NoteRepository;
import com.vulnuris.notesservice.repository.TenantRepository;
import com.vulnuris.notesservice.tenant.TenantContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final TenantRepository tenantRepository;

    public NoteServiceImpl(NoteRepository noteRepository, TenantRepository tenantRepository) {
        this.noteRepository = noteRepository;
        this.tenantRepository = tenantRepository;
    }

    @Override
    public Note createNote(Note note) {
        // Get the authenticated user ID from SecurityContext
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Get the tenant ID from TenantContext (set by JwtAuthFilter)
        Long tenantId = TenantContext.getTenantId();

        // Fetch tenant to check subscription plan
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Invalid tenant"));

        // Enforce subscription limits for FREE plan (per-user limit)
        if (tenant.getSubscriptionPlan() == SubscriptionPlan.FREE) {
            long noteCount = noteRepository.countByTenantIdAndCreatedBy(tenantId, userId);
            if (noteCount >= 3) {
                throw new SubscriptionLimitExceededException(
                    "Note limit reached. FREE plan allows maximum 3 notes per user. Upgrade to PRO for unlimited notes."
                );
            }
        }

        // Set the createdBy and tenantId fields
        note.setCreatedBy(userId);
        note.setTenantId(tenantId);

        // Timestamps are automatically set by @PrePersist in Note entity
        return noteRepository.save(note);
    }

    @Override
    public List<Note> getAllNotes() {
        Long tenantId = TenantContext.getTenantId();
        return noteRepository.findByTenantId(tenantId);
    }

    @Override
    public Note getNoteById(Long id) {
        Long tenantId = TenantContext.getTenantId();
        return noteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));
    }

    @Override
    public Note updateNote(Long id, Note updatedNote) {
        Note existingNote = getNoteById(id);
        existingNote.setTitle(updatedNote.getTitle());
        existingNote.setContent(updatedNote.getContent());
        // updatedAt is automatically set by @PreUpdate in Note entity
        return noteRepository.save(existingNote);
    }

    @Override
    public void deleteNote(Long id) {
        Note note = getNoteById(id);
        noteRepository.delete(note);
    }
}
