package com.codepathacademy.curriculum;
import jakarta.persistence.*; import java.util.UUID;
@Entity @Table(name="curriculum_weeks") public class CurriculumWeek {
 @Id @GeneratedValue private UUID id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="program_id") private CurriculumProgram program; @Column(nullable=false,unique=true) private String code; @Column(name="week_number") private int weekNumber; @Column(name="title_en") private String titleEn; @Column(name="title_ml") private String titleMl; @Column(name="sort_order") private int sortOrder;
 protected CurriculumWeek(){} public CurriculumWeek(CurriculumProgram p,String code,int number,String en){program=p;this.code=code;weekNumber=number;titleEn=en;sortOrder=number;} public UUID getId(){return id;} public String getCode(){return code;} public int getWeekNumber(){return weekNumber;} public String getTitleEn(){return titleEn;} public String getTitleMl(){return titleMl;}
}
