package com.codepathacademy.curriculum;
import java.util.*; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") public class CurriculumController {
 private final CurriculumService service; public CurriculumController(CurriculumService service){this.service=service;}
 @GetMapping("/programs") List<CurriculumService.ProgramView> programs(@RequestParam(defaultValue="en-IN") String locale){return service.programs(locale);}
 @GetMapping("/programs/{id}") CurriculumService.ProgramView program(@PathVariable UUID id,@RequestParam(defaultValue="en-IN") String locale){return service.program(id,locale);}
 @GetMapping("/programs/{id}/curriculum") CurriculumService.CurriculumView curriculum(@PathVariable UUID id,@RequestParam(defaultValue="en-IN") String locale){return service.curriculum(id,locale);}
 @GetMapping("/weeks/{id}") CurriculumService.WeekView week(@PathVariable UUID id,@RequestParam(defaultValue="en-IN") String locale){return service.week(id,locale);}
 @GetMapping("/classes/{id}") CurriculumService.ClassView clazz(@PathVariable UUID id,@RequestParam(defaultValue="en-IN") String locale){return service.clazz(id,locale);}
}
