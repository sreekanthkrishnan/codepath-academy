package com.codepathacademy.security;

import com.codepathacademy.identity.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {
  public static final String USER_SESSION_KEY = "codepath.user-id";
  private final UserRepository users;
  public SessionAuthenticationFilter(UserRepository users) { this.users = users; }
  @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
    var session = request.getSession(false);
    if (session != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      Object value = session.getAttribute(USER_SESSION_KEY);
      if (value instanceof String userId) {
        users.findById(java.util.UUID.fromString(userId)).filter(user -> user.isEnabled()).ifPresent(user -> {
          var authorities = user.getRoles().stream().map(role -> new SimpleGrantedAuthority("ROLE_" + role.getCode())).toList();
          var authentication = new UsernamePasswordAuthenticationToken(user.getId().toString(), null, authorities);
          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authentication);
        });
      }
    }
    chain.doFilter(request, response);
  }
}
