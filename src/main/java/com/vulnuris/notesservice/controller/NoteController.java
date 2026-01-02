package com.vulnuris.notesservice.controller;

import com.vulnuris.notesservice.model.Note;
import com.vulnuris.notesservice.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Note createNote(@Valid @RequestBody Note note) {
        return noteService.createNote(note);
    }

    @GetMapping
    public List<Note> getAllNotes() {
        return noteService.getAllNotes();
    }

    @GetMapping("/{id}")
    public Note getNoteById(@PathVariable Long id) {
        return noteService.getNoteById(id);
    }

    @PutMapping("/{id}")
    public Note updateNote(
            @PathVariable Long id,
            @Valid @RequestBody Note note
    ) {
        return noteService.updateNote(id, note);
    }

    /**
     * Delete a note. Restricted to ADMIN role only.
     *
     * Note: This demonstrates role-based authorization. In a real application,
     * you might allow users to delete their own notes, or implement more granular permissions.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
    }
}
