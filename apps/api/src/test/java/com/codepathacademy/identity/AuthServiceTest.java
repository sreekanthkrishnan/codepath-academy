package com.codepathacademy.identity;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import jakarta.servlet.http.HttpSession;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
  @Mock UserRepository users; @Mock RoleRepository roles; @Mock PasswordEncoder encoder; @Mock HttpSession session;
  @InjectMocks AuthService service;
  @Test void registrationRejectsDuplicateEmail() {
    when(users.findByEmailIgnoreCase("learner@example.com")).thenReturn(Optional.of(mock(AppUser.class)));
    assertThrows(IllegalArgumentException.class, () -> service.register("learner@example.com", "correct-horse-battery", "Learner", session));
    verify(users, never()).save(any());
  }
}
