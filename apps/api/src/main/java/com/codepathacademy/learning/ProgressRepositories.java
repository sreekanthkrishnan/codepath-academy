package com.codepathacademy.learning;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
interface ClassProgressRepository extends JpaRepository<ClassProgress,UUID>{ Optional<ClassProgress> findByUserIdAndCurriculumClassId(UUID userId,UUID classId); List<ClassProgress> findByUserId(UUID userId); }
interface TopicProgressRepository extends JpaRepository<TopicProgress,UUID>{ Optional<TopicProgress> findByUserIdAndTopicId(UUID userId,UUID topicId); List<TopicProgress> findByUserId(UUID userId); }
