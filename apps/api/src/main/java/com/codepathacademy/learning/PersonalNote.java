package com.codepathacademy.learning;

import com.codepathacademy.curriculum.CurriculumClass;
import com.codepathacademy.curriculum.Topic;
import com.codepathacademy.identity.AppUser;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "personal_notes")
public class PersonalNote {
  @Id @GeneratedValue private UUID id;
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private AppUser user;
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "class_id") private CurriculumClass curriculumClass;
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "topic_id") private Topic topic;
  @Column(name = "source_key") private String sourceKey;
  @Column(nullable = false) private String title;
  @Column(nullable = false) private String body;
  @Column(name = "body_en") private String bodyEn;
  @Column(name = "body_ml") private String bodyMl;
  @Version private long version;
  @Column(name = "created_at", nullable = false) private Instant createdAt = Instant.now();
  @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();
  @Column(name = "deleted_at") private Instant deletedAt;
  protected PersonalNote() {}
  PersonalNote(AppUser user, CurriculumClass curriculumClass, Topic topic, String title, String body, String bodyEn, String bodyMl, String sourceKey) { this.user=user; this.curriculumClass=curriculumClass; this.topic=topic; this.title=title; this.body=body; this.bodyEn=bodyEn; this.bodyMl=bodyMl; this.sourceKey=sourceKey; }
  void update(CurriculumClass curriculumClass, Topic topic, String title, String body, String bodyEn, String bodyMl) { this.curriculumClass=curriculumClass; this.topic=topic; this.title=title; this.body=body; this.bodyEn=bodyEn; this.bodyMl=bodyMl; this.updatedAt=Instant.now(); }
  void delete() { deletedAt=Instant.now(); updatedAt=deletedAt; }
  public UUID getId(){ return id; } public AppUser getUser(){ return user; } public CurriculumClass getCurriculumClass(){ return curriculumClass; } public Topic getTopic(){ return topic; } public String getTitle(){ return title; } public String getBody(){ return body; } public String getBodyEn(){ return bodyEn; } public String getBodyMl(){ return bodyMl; } public long getVersion(){ return version; } public Instant getCreatedAt(){ return createdAt; } public Instant getUpdatedAt(){ return updatedAt; } public Instant getDeletedAt(){ return deletedAt; }
  public String getSourceKey(){ return sourceKey; }
}
