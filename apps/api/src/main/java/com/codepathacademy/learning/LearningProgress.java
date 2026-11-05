package com.codepathacademy.learning;

import com.codepathacademy.curriculum.CurriculumClass;
import com.codepathacademy.curriculum.Topic;
import com.codepathacademy.identity.AppUser;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="lesson_progress") class ClassProgress {
  @Id @GeneratedValue private UUID id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id") private AppUser user; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="class_id") private CurriculumClass curriculumClass; @Enumerated(EnumType.STRING) private ProgressState state; @Version private long version; @Column(name="updated_at") private Instant updatedAt=Instant.now(); protected ClassProgress(){} ClassProgress(AppUser u,CurriculumClass c,ProgressState s){user=u;curriculumClass=c;state=s;} void update(ProgressState next){state=next;updatedAt=Instant.now();} UUID getClassId(){return curriculumClass.getId();} ProgressState getState(){return state;} long getVersion(){return version;} Instant getUpdatedAt(){return updatedAt;}
}
@Entity @Table(name="topic_progress") class TopicProgress {
  @Id @GeneratedValue private UUID id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id") private AppUser user; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="topic_id") private Topic topic; @Enumerated(EnumType.STRING) private ProgressState state; @Version private long version; @Column(name="updated_at") private Instant updatedAt=Instant.now(); protected TopicProgress(){} TopicProgress(AppUser u,Topic t,ProgressState s){user=u;topic=t;state=s;} void update(ProgressState next){state=next;updatedAt=Instant.now();} UUID getTopicId(){return topic.getId();} ProgressState getState(){return state;} long getVersion(){return version;} Instant getUpdatedAt(){return updatedAt;}
}
