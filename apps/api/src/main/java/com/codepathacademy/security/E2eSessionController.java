package com.codepathacademy.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/** Exists only in the isolated E2E profile; it is never packaged into a production profile. */
@Profile("e2e")
@RestController
class E2eSessionController {
  @PostMapping("/api/v1/__e2e/session/invalidate")
  ResponseEntity<Void> invalidate(HttpServletRequest request) {
    var session = request.getSession(false);
    if (session != null) session.invalidate();
    return ResponseEntity.noContent().build();
  }
}
