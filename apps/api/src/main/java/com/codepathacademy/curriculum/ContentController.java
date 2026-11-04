package com.codepathacademy.curriculum;
import java.util.*; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") public class ContentController {
 private final ContentService service; public ContentController(ContentService service){this.service=service;}
 @GetMapping("/classes/{id}/topics") List<ContentService.TopicView> classTopics(@PathVariable UUID id,@RequestParam(defaultValue="en-IN") String locale){return service.classTopics(id,locale);}
 @GetMapping("/topics/{id}") ContentService.TopicView topic(@PathVariable UUID id,@RequestParam(defaultValue="en-IN") String locale){return service.topic(id,locale);}
 @GetMapping("/topics/{id}/prerequisites") List<ContentService.TopicView> prerequisites(@PathVariable UUID id,@RequestParam(defaultValue="en-IN") String locale){return service.prerequisites(id,locale);}
 @GetMapping("/lessons/{id}") ContentService.LessonView lesson(@PathVariable UUID id,@RequestParam(defaultValue="en-IN") String locale){return service.lesson(id,locale);}
 @GetMapping("/lessons/{id}/content") ContentService.LessonView lessonContent(@PathVariable UUID id,@RequestParam(defaultValue="en-IN") String locale){return service.lesson(id,locale);}
 @GetMapping("/classes/{id}/lessons") ContentService.LessonView classLesson(@PathVariable UUID id,@RequestParam(defaultValue="en-IN") String locale){return service.classLesson(id,locale);}
 @GetMapping("/lessons/{id}/references") List<Object> references(@PathVariable UUID id){service.lesson(id,"en-IN");return List.of();}
}
