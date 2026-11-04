package com.codepathacademy.curriculum;
import jakarta.persistence.*; import java.util.UUID;
@Entity @Table(name="learning_programs") public class CurriculumProgram {
 @Id @GeneratedValue private UUID id; @Column(nullable=false,unique=true) private String code; @Column(name="title_en",nullable=false) private String titleEn; @Column(name="title_ml") private String titleMl; @Column(name="description_en") private String descriptionEn; @Column(name="description_ml") private String descriptionMl; @Column(nullable=false) private String status;
 protected CurriculumProgram(){} public CurriculumProgram(String code,String en,String ml,String description){this.code=code;titleEn=en;titleMl=ml;descriptionEn=description;status="PUBLISHED";} public UUID getId(){return id;} public String getCode(){return code;} public String getTitleEn(){return titleEn;} public String getTitleMl(){return titleMl;} public String getDescriptionEn(){return descriptionEn;}
}
