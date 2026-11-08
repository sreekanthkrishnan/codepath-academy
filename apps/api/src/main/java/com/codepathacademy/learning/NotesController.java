package com.codepathacademy.learning;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notes")
public class NotesController {
  private final NotesService notes;
  public NotesController(NotesService notes){ this.notes=notes; }
  @GetMapping List<NotesService.View> list(@AuthenticationPrincipal String userId, @RequestParam(required=false) UUID classId, @RequestParam(required=false) UUID topicId, @RequestParam(required=false) @Size(max=120) String q){ return notes.list(userId,classId,topicId,q); }
  @GetMapping("/{id}") NotesService.View get(@AuthenticationPrincipal String userId,@PathVariable UUID id){ return notes.get(userId,id); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) NotesService.View create(@AuthenticationPrincipal String userId,@Valid @RequestBody Request request){ return notes.create(userId,request.command()); }
  @PatchMapping("/{id}") NotesService.View update(@AuthenticationPrincipal String userId,@PathVariable UUID id,@Valid @RequestBody Request request){ return notes.update(userId,id,request.command()); }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void delete(@AuthenticationPrincipal String userId,@PathVariable UUID id,@RequestParam long version){ notes.delete(userId,id,version); }
  public record Request(UUID classId, UUID topicId, @Size(max=255) String title, @Size(max=50000) String body, @Size(max=50000) String bodyEn, @Size(max=50000) String bodyMl, long version, @Size(max=64) String clientKey) { NotesService.Command command(){ return new NotesService.Command(classId,topicId,title,body,bodyEn,bodyMl,version,clientKey); } }
}
