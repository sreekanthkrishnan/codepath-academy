package com.codepathacademy.identity;

import com.codepathacademy.security.SessionAuthenticationFilter;
import jakarta.servlet.http.HttpSession;
import java.util.Set;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository users; private final RoleRepository roles; private final PasswordEncoder passwordEncoder;
  public AuthService(UserRepository users, RoleRepository roles, PasswordEncoder passwordEncoder) { this.users=users; this.roles=roles; this.passwordEncoder=passwordEncoder; }
  @Transactional
  public UserView register(String email, String password, String displayName, HttpSession session) {
    String normalized = email.trim().toLowerCase(java.util.Locale.ROOT);
    if (users.findByEmailIgnoreCase(normalized).isPresent()) throw new IllegalArgumentException("An account already exists for this email");
    var user = new AppUser(normalized, passwordEncoder.encode(password), displayName.trim());
    user.getRoles().add(roles.findByCode("STUDENT").orElseThrow(() -> new IllegalStateException("STUDENT role is missing")));
    users.save(user); session.setAttribute(SessionAuthenticationFilter.USER_SESSION_KEY, user.getId().toString()); return view(user);
  }
  public UserView login(String email, String password, HttpSession session) {
    var user = users.findByEmailIgnoreCase(email.trim()).orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
    if (!passwordEncoder.matches(password, user.getPasswordHash())) throw new IllegalArgumentException("Invalid email or password");
    session.setAttribute(SessionAuthenticationFilter.USER_SESSION_KEY, user.getId().toString()); return view(user);
  }
  public UserView current(String userId) { return users.findById(java.util.UUID.fromString(userId)).map(this::view).orElseThrow(() -> new IllegalArgumentException("User session is no longer valid")); }
  private UserView view(AppUser user) { return new UserView(user.getId().toString(), user.getEmail(), user.getDisplayName(), user.getRoles().stream().map(Role::getCode).collect(java.util.stream.Collectors.toUnmodifiableSet())); }
  public record UserView(String id, String email, String displayName, Set<String> roles) {}
}
