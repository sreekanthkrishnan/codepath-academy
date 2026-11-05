package com.codepathacademy.learning;

import com.codepathacademy.curriculum.CurriculumClass;
import com.codepathacademy.curriculum.Topic;
import com.codepathacademy.identity.AppUser;
import com.codepathacademy.identity.UserRepository;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional public class ProgressService {
 private final ClassProgressRepository classes; private final TopicProgressRepository topics; private final UserRepository users; private final EntityManager entities;
 public ProgressService(ClassProgressRepository classes,TopicProgressRepository topics,UserRepository users,EntityManager entities){this.classes=classes;this.topics=topics;this.users=users;this.entities=entities;}
 @Transactional(readOnly=true) public Overview overview(String userId){var classItems=classes.findByUserId(user(userId).getId()).stream().map(this::view).toList();var topicItems=topics.findByUserId(user(userId).getId()).stream().map(this::view).toList();return new Overview(classItems,topicItems,classItems.stream().filter(x->x.state()!=ProgressState.NOT_STARTED).count(),classItems.stream().filter(x->x.state()==ProgressState.MASTERED).count());}
 @Transactional(readOnly=true) public View classProgress(String userId,UUID id){return classes.findByUserIdAndCurriculumClassId(user(userId).getId(),id).map(this::view).orElse(new View(id,ProgressState.NOT_STARTED,0,null));}
 @Transactional(readOnly=true) public View topicProgress(String userId,UUID id){return topics.findByUserIdAndTopicId(user(userId).getId(),id).map(this::view).orElse(new View(id,ProgressState.NOT_STARTED,0,null));}
 public View setClass(String userId,UUID id,ProgressState state,long version){var user=user(userId); var current=classes.findByUserIdAndCurriculumClassId(user.getId(),id);if(current.isPresent()){if(current.get().getVersion()!=version)throw new NotesService.ConflictException("This progress changed in another session. Refresh before saving.");transition(current.get().getState(),state);current.get().update(state);return view(classes.saveAndFlush(current.get()));}transition(ProgressState.NOT_STARTED,state);return view(classes.save(new ClassProgress(user,requireClass(id),state)));}
 public View setTopic(String userId,UUID id,ProgressState state,long version){var user=user(userId); var current=topics.findByUserIdAndTopicId(user.getId(),id);if(current.isPresent()){if(current.get().getVersion()!=version)throw new NotesService.ConflictException("This progress changed in another session. Refresh before saving.");transition(current.get().getState(),state);current.get().update(state);return view(topics.saveAndFlush(current.get()));}transition(ProgressState.NOT_STARTED,state);return view(topics.save(new TopicProgress(user,requireTopic(id),state)));}
 private void transition(ProgressState before,ProgressState after){if(before==after)return;if(after.ordinal()<before.ordinal())return;if(before==ProgressState.NOT_STARTED&&after==ProgressState.STUDIED)return;if(after.ordinal()!=before.ordinal()+1)throw new IllegalArgumentException("Invalid progress transition");}
 private AppUser user(String id){return users.findById(UUID.fromString(id)).orElseThrow(()->new NoSuchElementException("User not found"));} private CurriculumClass requireClass(UUID id){return Optional.ofNullable(entities.find(CurriculumClass.class,id)).orElseThrow(()->new NoSuchElementException("Class not found"));}private Topic requireTopic(UUID id){return Optional.ofNullable(entities.find(Topic.class,id)).orElseThrow(()->new NoSuchElementException("Topic not found"));}
 private View view(ClassProgress p){return new View(p.getClassId(),p.getState(),p.getVersion(),p.getUpdatedAt());}private View view(TopicProgress p){return new View(p.getTopicId(),p.getState(),p.getVersion(),p.getUpdatedAt());}
 public record View(UUID id,ProgressState state,long version,Instant updatedAt){} public record Overview(List<View> classes,List<View> topics,long startedClasses,long masteredClasses){}
}
