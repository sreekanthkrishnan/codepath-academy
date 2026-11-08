package com.codepathacademy.learning;
import java.util.*;import org.springframework.data.jpa.repository.JpaRepository;
interface LearningDataImportRepository extends JpaRepository<LearningDataImport,UUID>{Optional<LearningDataImport> findByUserIdAndImportKey(UUID userId,String importKey);Optional<LearningDataImport> findByUserIdAndFingerprint(UUID userId,String fingerprint);Optional<LearningDataImport> findByIdAndUserId(UUID id,UUID userId);}
