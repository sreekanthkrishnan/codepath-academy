package com.codepathacademy.identity;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/auth")
public class AuthController {
  private final AuthService service;
  public AuthController(AuthService service) { this.service = service; }
  @PostMapping("/register") ResponseEntity<AuthService.UserView> register(@Valid @RequestBody RegistrationRequest request, HttpServletRequest servletRequest) { servletRequest.getSession(); servletRequest.changeSessionId(); return ResponseEntity.status(HttpStatus.CREATED).body(service.register(request.email(), request.password(), request.displayName(), servletRequest.getSession())); }
  @PostMapping("/login") AuthService.UserView login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) { servletRequest.getSession(); servletRequest.changeSessionId(); return service.login(request.email(), request.password(), servletRequest.getSession()); }
  @GetMapping("/me") AuthService.UserView me(@AuthenticationPrincipal String userId) { return service.current(userId); }
  @GetMapping("/csrf") Map<String, String> csrf(CsrfToken token) { return Map.of("headerName", token.getHeaderName(), "token", token.getToken()); }
  @PostMapping("/logout") ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) { var session=request.getSession(false); if(session!=null) session.invalidate(); return ResponseEntity.noContent().build(); }
  public record RegistrationRequest(@Email @NotBlank String email, @NotBlank @Size(min=12,max=128) String password, @NotBlank @Size(max=120) String displayName) {}
  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
}
