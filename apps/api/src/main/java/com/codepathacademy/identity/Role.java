package com.codepathacademy.identity;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name = "roles")
public class Role {
  @Id private UUID id;
  @Column(nullable = false, unique = true) private String code;
  protected Role() {}
  public UUID getId() { return id; }
  public String getCode() { return code; }
}
