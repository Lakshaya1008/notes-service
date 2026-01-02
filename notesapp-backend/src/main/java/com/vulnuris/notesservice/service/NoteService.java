package com.vulnuris.notesservice.service;

import com.vulnuris.notesservice.model.Note;

import java.util.List;

public interface NoteService {

    Note createNote(Note note);

    List<Note> getAllNotes();

    Note getNoteById(Long id);

    Note updateNote(Long id, Note note);

    void deleteNote(Long id);
}
