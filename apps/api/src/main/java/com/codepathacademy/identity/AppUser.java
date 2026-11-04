package com.codepathacademy.identity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
@Entity @Table(name = "app_users")
public class AppUser {
  @Id @GeneratedValue private UUID id;
  @Column(nullable = false, unique = true) private String email;
  @Column(name = "password_hash", nullable = false) private String passwordHash;
  @Column(name = "display_name", nullable = false) private String displayName;
  @Column(nullable = false) private boolean enabled = true;
  @Version private long version;
  @Column(name = "created_at", nullable = false) private Instant createdAt = Instant.now();
  @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();
  @ManyToMany(fetch = FetchType.EAGER) @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id")) private Set<Role> roles = new HashSet<>();
  protected AppUser() {}
  public AppUser(String email, String passwordHash, String displayName) { this.email=email; this.passwordHash=passwordHash; this.displayName=displayName; }
  @PreUpdate void touched() { updatedAt = Instant.now(); }
  public UUID getId(){return id;} public String getEmail(){return email;} public String getPasswordHash(){return passwordHash;} public String getDisplayName(){return displayName;} public boolean isEnabled(){return enabled;} public Set<Role> getRoles(){return roles;}
}
