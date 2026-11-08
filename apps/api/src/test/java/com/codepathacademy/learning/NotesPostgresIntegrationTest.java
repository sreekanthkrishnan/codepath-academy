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
  @Autowired LearningDataImportService imports;
  @Autowired UserRepository users;
  @Autowired EntityManager entities;

  @Test
  void notesAreOwnedVersionedAndSoftDeleted() {
    var firstUser = users.save(new AppUser("first@example.com", "not-used", "First"));
    var secondUser = users.save(new AppUser("second@example.com", "not-used", "Second"));
    UUID classId = entities.createQuery("select c.id from CurriculumClass c order by c.code", UUID.class).setMaxResults(1).getSingleResult();
    var created = notes.create(firstUser.getId().toString(), new NotesService.Command(classId, null, "Unicode", "English and മലയാളം", "English", "മലയാളം", 0, null));
    assertEquals("English and മലയാളം", notes.get(firstUser.getId().toString(), created.id()).body());
    assertThrows(java.util.NoSuchElementException.class, () -> notes.get(secondUser.getId().toString(), created.id()));
    var updated = notes.update(firstUser.getId().toString(), created.id(), new NotesService.Command(classId, null, "Updated", "Changed", "Changed", null, created.version(), null));
    assertTrue(updated.version() > created.version());
    assertThrows(NotesService.ConflictException.class, () -> notes.update(firstUser.getId().toString(), created.id(), new NotesService.Command(classId, null, "Stale", "stale", null, null, created.version(), null)));
    notes.delete(firstUser.getId().toString(), created.id(), updated.version());
    assertTrue(notes.list(firstUser.getId().toString(), classId, null, null).isEmpty());
  }

  @Test
  void clientDraftKeyMakesCreationRetrySafe() {
    var user = users.save(new AppUser("retry@example.com", "not-used", "Retry"));
    UUID classId = entities.createQuery("select c.id from CurriculumClass c order by c.code", UUID.class).setMaxResults(1).getSingleResult();
    var command = new NotesService.Command(classId, null, "Draft", "മലയാളം", null, "മലയാളം", 0, "draft-retry-1");
    var first = notes.create(user.getId().toString(), command);
    assertEquals(first.id(), notes.create(user.getId().toString(), command).id());
    assertEquals(1, notes.list(user.getId().toString(), classId, null, null).size());
    assertThrows(NotesService.ConflictException.class, () -> notes.create(user.getId().toString(), new NotesService.Command(classId, null, "Draft", "changed", null, null, 0, "draft-retry-1")));
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

  @Test
  void topicProgressIsPersistedOwnedAndVersioned() {
    var firstUser = users.save(new AppUser("topic-first@example.com", "not-used", "First"));
    var secondUser = users.save(new AppUser("topic-second@example.com", "not-used", "Second"));
    UUID topicId = entities.createQuery("select t.id from Topic t order by t.code", UUID.class).setMaxResults(1).getSingleResult();

    assertEquals(ProgressState.NOT_STARTED, progress.topicProgress(firstUser.getId().toString(), topicId).state());
    assertThrows(IllegalArgumentException.class, () -> progress.setTopic(firstUser.getId().toString(), topicId, ProgressState.MASTERED, 0));

    var studied = progress.setTopic(firstUser.getId().toString(), topicId, ProgressState.STUDIED, 0);
    assertEquals(ProgressState.STUDIED, studied.state());
    assertNotNull(studied.updatedAt());
    assertEquals(ProgressState.STUDIED, progress.topicProgress(firstUser.getId().toString(), topicId).state());
    assertEquals(ProgressState.NOT_STARTED, progress.topicProgress(secondUser.getId().toString(), topicId).state());

    var practiced = progress.setTopic(firstUser.getId().toString(), topicId, ProgressState.PRACTICED, studied.version());
    assertTrue(practiced.version() > studied.version());
    assertThrows(NotesService.ConflictException.class, () -> progress.setTopic(firstUser.getId().toString(), topicId, ProgressState.ASSESSED, studied.version()));
    assertThrows(java.util.NoSuchElementException.class, () -> progress.setTopic(firstUser.getId().toString(), UUID.randomUUID(), ProgressState.STUDIED, 0));
    assertEquals(ProgressState.PRACTICED, progress.topicProgress(firstUser.getId().toString(), topicId).state());
  }

  @Test
  void legacyImportIsPreviewedIdempotentAndDoesNotOverwriteServerNotes() {
    var user = users.save(new AppUser("import@example.com", "not-used", "Importer"));
    var payload = new LearningDataImportService.Payload(1, "2026-11-05T00:00:00Z", "codepath-academy-client", new LearningDataImportService.Data("both", java.util.List.of(11, 999), java.util.Map.of("1-1", "മലയാളം note", "bad-key", "keep locally")));
    var preview = imports.preview(user.getId().toString(), payload);
    assertEquals(2, preview.eligible());
    assertEquals(2, preview.unmapped());
    var imported = imports.importData(user.getId().toString(), "migration-key-0001", payload);
    assertFalse(imported.alreadyImported());
    assertTrue(imports.importData(user.getId().toString(), "migration-key-0001", payload).alreadyImported());
    var changed = new LearningDataImportService.Payload(1, "2026-11-05T00:00:00Z", "codepath-academy-client", new LearningDataImportService.Data("both", java.util.List.of(), java.util.Map.of()));
    assertThrows(NotesService.ConflictException.class, () -> imports.importData(user.getId().toString(), "migration-key-0001", changed));
  }
}
