package com.codepathacademy.curriculum;
import jakarta.persistence.*; import java.util.*;
@Entity @Table(name="topics") public class Topic {
 @Id @GeneratedValue private UUID id; @Column(nullable=false,unique=true) private String code; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="parent_topic_id") private Topic parent; @Column(name="title_en") private String titleEn; @Column(name="title_ml") private String titleMl; @Column(name="description_en") private String descriptionEn; @Column(name="description_ml") private String descriptionMl; @Column(name="sort_order") private int sortOrder; private String difficulty; @Column(name="estimated_minutes") private int estimatedMinutes;
 protected Topic(){} public Topic(String code,String en,String ml,int sortOrder){this.code=code;titleEn=en;titleMl=ml;this.sortOrder=sortOrder;difficulty="BEGINNER";estimatedMinutes=35;} public UUID getId(){return id;} public String getCode(){return code;} public String getTitleEn(){return titleEn;} public String getTitleMl(){return titleMl;} public String getDescriptionEn(){return descriptionEn;} public String getDescriptionMl(){return descriptionMl;} public Topic getParent(){return parent;}
}
