package com.codepathacademy.learning;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

interface PersonalNoteRepository extends JpaRepository<PersonalNote, UUID> {
  List<PersonalNote> findByUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(UUID userId);
  Optional<PersonalNote> findByIdAndUserIdAndDeletedAtIsNull(UUID id, UUID userId);
}
