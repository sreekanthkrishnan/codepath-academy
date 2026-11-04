package com.codepathacademy.curriculum;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
interface CurriculumProgramRepository extends JpaRepository<CurriculumProgram,UUID>{Optional<CurriculumProgram> findByCode(String code);}
interface CurriculumWeekRepository extends JpaRepository<CurriculumWeek,UUID>{Optional<CurriculumWeek> findByCode(String code); List<CurriculumWeek> findByProgramIdOrderByWeekNumber(UUID id);}
interface CurriculumClassRepository extends JpaRepository<CurriculumClass,UUID>{Optional<CurriculumClass> findByCode(String code); List<CurriculumClass> findByWeekIdOrderByClassNumber(UUID id); List<CurriculumClass> findByWeekIdInOrderByWeekIdAscClassNumberAsc(Collection<UUID> ids);}
