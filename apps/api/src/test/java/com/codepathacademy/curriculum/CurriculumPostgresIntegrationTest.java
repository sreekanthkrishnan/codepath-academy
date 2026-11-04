package com.codepathacademy.curriculum;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashSet;
import java.util.UUID;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tag("integration")
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class CurriculumPostgresIntegrationTest {
  @Container
  static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine")
      .withDatabaseName("codepath_test").withUsername("codepath").withPassword("test-only");

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry properties) {
    properties.add("spring.datasource.url", postgres::getJdbcUrl);
    properties.add("spring.datasource.username", postgres::getUsername);
    properties.add("spring.datasource.password", postgres::getPassword);
  }

  @Autowired CurriculumProgramRepository programs;
  @Autowired CurriculumWeekRepository weeks;
  @Autowired CurriculumClassRepository classes;
  @Autowired TopicRepository topics;
  @Autowired ClassTopicRepository classTopics;
  @Autowired LessonContentRepository lessons;
  @Autowired CurriculumSeedService seed;
  @Autowired CurriculumService curriculum;
  @Autowired ContentService content;
  @Autowired MockMvc mvc;

  @Test
  void flywaySeedAndJsonbContentAreCompleteAndRepeatSafe() {
    assertEquals(1, programs.count());
    assertEquals(40, weeks.count());
    assertEquals(200, classes.count());
    assertEquals(200, topics.count());
    assertEquals(200, lessons.count());
    assertEquals(200, classTopics.count());
    assertEquals(200, new HashSet<>(classes.findAll().stream().map(CurriculumClass::getCode).toList()).size());

    var first = classes.findByCode("CPA-W01-C01").orElseThrow();
    var stored = lessons.findByCurriculumClassId(first.getId()).orElseThrow();
    assertTrue(stored.getContentBlocks().contains("introduction"));
    var lesson = content.classLesson(first.getId(), "ml-IN");
    assertEquals("DRAFT", lesson.publicationState());
    assertTrue(lesson.fallback());
    assertEquals("en-IN", lesson.actualContentLocale());
    assertEquals(4, lesson.blocks().size());
    assertEquals("introduction", lesson.blocks().getFirst().get("type").asText());

    var originalId = first.getId();
    seed.seed();
    assertEquals(200, classes.count());
    assertEquals(200, topics.count());
    assertEquals(200, lessons.count());
    assertEquals(200, classTopics.count());
    assertEquals(originalId, classes.findByCode("CPA-W01-C01").orElseThrow().getId());
  }

  @Test
  void localizedCurriculumIsOrderedAndMissingResourcesRemainMissing() {
    var program = programs.findByCode("CPA-BACKEND-40").orElseThrow();
    var response = curriculum.curriculum(program.getId(), "ml-IN");
    assertEquals(40, response.weeks().size());
    assertEquals(1, response.weeks().getFirst().weekNumber());
    assertEquals(5, response.weeks().getFirst().classes().size());
    assertEquals("CPA-W01-C01", response.weeks().getFirst().classes().getFirst().code());
    assertFalse(response.weeks().getFirst().classes().getFirst().title().malayalamFallback());
    assertThrows(java.util.NoSuchElementException.class, () -> content.topic(UUID.randomUUID(), "en-IN"));
    assertThrows(java.util.NoSuchElementException.class, () -> content.lesson(UUID.randomUUID(), "en-IN"));
  }

  @Test
  void readOnlyCurriculumEndpointsArePublicWithoutOpeningAdminRoutes() throws Exception {
    var first = classes.findByCode("CPA-W01-C01").orElseThrow();
    var topic = classTopics.findByCurriculumClassIdOrderBySortOrder(first.getId()).getFirst().getTopic();
    mvc.perform(get("/api/v1/classes/{id}/lessons", first.getId())).andExpect(status().isOk());
    mvc.perform(get("/api/v1/topics/{id}", topic.getId())).andExpect(status().isOk());
    mvc.perform(get("/api/v1/admin/curriculum")).andExpect(status().isForbidden());
  }
}
