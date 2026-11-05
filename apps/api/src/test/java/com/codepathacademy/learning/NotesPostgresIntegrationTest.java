package com.codepathacademy.learning;

import static org.junit.jupiter.api.Assertions.*;

import com.codepathacademy.curriculum.CurriculumClass;
import com.codepathacademy.identity.AppUser;
import com.codepathacademy.identity.UserRepository;
import jakarta.persistence.EntityManager;
import java.util.UUID;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Tag("integration")
@Testcontainers
@SpringBootTest
class NotesPostgresIntegrationTest {
  @Container static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine").withDatabaseName("notes_test").withUsername("codepath").withPassword("test-only");
  @DynamicPropertySource static void properties(DynamicPropertyRegistry registry) { registry.add("spring.datasource.url", postgres::getJdbcUrl); registry.add("spring.datasource.username", postgres::getUsername); registry.add("spring.datasource.password", postgres::getPassword); }
  @Autowired NotesService notes;
  @Autowired ProgressService progress;
  @Autowired UserRepository users;
  @Autowired EntityManager entities;

  @Test
  void notesAreOwnedVersionedAndSoftDeleted() {
    var firstUser = users.save(new AppUser("first@example.com", "not-used", "First"));
    var secondUser = users.save(new AppUser("second@example.com", "not-used", "Second"));
    UUID classId = entities.createQuery("select c.id from CurriculumClass c order by c.code", UUID.class).setMaxResults(1).getSingleResult();
    var created = notes.create(firstUser.getId().toString(), new NotesService.Command(classId, null, "Unicode", "English and മലയാളം", "English", "മലയാളം", 0));
    assertEquals("English and മലയാളം", notes.get(firstUser.getId().toString(), created.id()).body());
    assertThrows(java.util.NoSuchElementException.class, () -> notes.get(secondUser.getId().toString(), created.id()));
    var updated = notes.update(firstUser.getId().toString(), created.id(), new NotesService.Command(classId, null, "Updated", "Changed", "Changed", null, created.version()));
    assertTrue(updated.version() > created.version());
    assertThrows(NotesService.ConflictException.class, () -> notes.update(firstUser.getId().toString(), created.id(), new NotesService.Command(classId, null, "Stale", "stale", null, null, created.version())));
    notes.delete(firstUser.getId().toString(), created.id(), updated.version());
    assertTrue(notes.list(firstUser.getId().toString(), classId, null, null).isEmpty());
  }

  @Test
  void progressIsIsolatedAndRejectsSkippedMastery() {
    var firstUser = users.save(new AppUser("progress-first@example.com", "not-used", "First"));
    var secondUser = users.save(new AppUser("progress-second@example.com", "not-used", "Second"));
    UUID classId = entities.createQuery("select c.id from CurriculumClass c order by c.code", UUID.class).setMaxResults(1).getSingleResult();
    assertThrows(IllegalArgumentException.class, () -> progress.setClass(firstUser.getId().toString(), classId, ProgressState.MASTERED, 0));
    var studied = progress.setClass(firstUser.getId().toString(), classId, ProgressState.STUDIED, 0);
    assertEquals(ProgressState.STUDIED, studied.state());
    assertEquals(ProgressState.NOT_STARTED, progress.classProgress(secondUser.getId().toString(), classId).state());
    progress.setClass(firstUser.getId().toString(), classId, ProgressState.NOT_STARTED, studied.version());
    assertThrows(NotesService.ConflictException.class, () -> progress.setClass(firstUser.getId().toString(), classId, ProgressState.STUDIED, studied.version()));
  }
}
