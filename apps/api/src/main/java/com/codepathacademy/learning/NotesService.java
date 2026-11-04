package com.codepathacademy.learning;

import com.codepathacademy.curriculum.CurriculumClass;
import com.codepathacademy.curriculum.Topic;
import com.codepathacademy.identity.AppUser;
import com.codepathacademy.identity.UserRepository;
import jakarta.persistence.EntityManager;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotesService {
  private final PersonalNoteRepository notes; private final UserRepository users;
  private final EntityManager entities;
  public NotesService(PersonalNoteRepository notes, UserRepository users, EntityManager entities) { this.notes=notes; this.users=users; this.entities=entities; }
  @Transactional(readOnly = true) public List<View> list(String userId, UUID classId, UUID topicId, String query) { return notes.findByUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(user(userId).getId()).stream().filter(n -> classId == null || (n.getCurriculumClass()!=null && classId.equals(n.getCurriculumClass().getId()))).filter(n -> topicId == null || (n.getTopic()!=null && topicId.equals(n.getTopic().getId()))).filter(n -> query == null || query.isBlank() || (n.getTitle()+"\n"+n.getBody()).toLowerCase(Locale.ROOT).contains(query.toLowerCase(Locale.ROOT))).map(this::view).toList(); }
  @Transactional(readOnly = true) public View get(String userId, UUID id) { return view(owned(userId,id)); }
  public View create(String userId, Command command) { var note = new PersonalNote(user(userId), clazz(command.classId()), topic(command.topicId()), title(command.title()), body(command), command.bodyEn(), command.bodyMl(), null); return view(notes.save(note)); }
  public View update(String userId, UUID id, Command command) { var note=owned(userId,id); if(note.getVersion()!=command.version()) throw new ConflictException("This note changed in another session. Refresh before saving."); note.update(clazz(command.classId()), topic(command.topicId()), title(command.title()), body(command), command.bodyEn(), command.bodyMl()); return view(notes.saveAndFlush(note)); }
  public void delete(String userId, UUID id, long version) { var note=owned(userId,id); if(note.getVersion()!=version) throw new ConflictException("This note changed in another session. Refresh before deleting."); note.delete(); notes.saveAndFlush(note); }
  private AppUser user(String id){ return users.findById(UUID.fromString(id)).orElseThrow(() -> new NoSuchElementException("User not found")); }
  private PersonalNote owned(String userId, UUID id){ return notes.findByIdAndUserIdAndDeletedAtIsNull(id,user(userId).getId()).orElseThrow(() -> new NoSuchElementException("Note not found")); }
  private CurriculumClass clazz(UUID id){ return id == null ? null : Optional.ofNullable(entities.find(CurriculumClass.class,id)).orElseThrow(() -> new NoSuchElementException("Class not found")); }
  private Topic topic(UUID id){ return id == null ? null : Optional.ofNullable(entities.find(Topic.class,id)).orElseThrow(() -> new NoSuchElementException("Topic not found")); }
  private String title(String title){ return title == null || title.isBlank() ? "Untitled note" : title.trim(); }
  private String body(Command command){ return command.body() == null ? Optional.ofNullable(command.bodyEn()).orElse(Optional.ofNullable(command.bodyMl()).orElse("")) : command.body(); }
  private View view(PersonalNote n){ return new View(n.getId(), n.getCurriculumClass()==null?null:n.getCurriculumClass().getId(), n.getTopic()==null?null:n.getTopic().getId(), n.getTitle(), n.getBody(), n.getBodyEn(), n.getBodyMl(), n.getVersion(), n.getCreatedAt(), n.getUpdatedAt()); }
  public record Command(UUID classId, UUID topicId, String title, String body, String bodyEn, String bodyMl, long version) {}
  public record View(UUID id, UUID classId, UUID topicId, String title, String body, String bodyEn, String bodyMl, long version, java.time.Instant createdAt, java.time.Instant updatedAt) {}
  public static class ConflictException extends RuntimeException { public ConflictException(String message){ super(message); } }
}
