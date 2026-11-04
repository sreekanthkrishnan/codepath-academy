package com.codepathacademy.security;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
  @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, SessionAuthenticationFilter sessionAuthenticationFilter) throws Exception {
    var csrf = CookieCsrfTokenRepository.withHttpOnlyFalse();
    csrf.setCookieCustomizer(cookie -> cookie.path("/"));
    return http
      .cors(Customizer.withDefaults())
      .csrf(c -> c.csrfTokenRepository(csrf).ignoringRequestMatchers("/api/v1/auth/register", "/api/v1/auth/login"))
      .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
      .authorizeHttpRequests(a -> a
        .requestMatchers("/actuator/health", "/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/csrf").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/v1/programs/**", "/api/v1/weeks/**", "/api/v1/classes/**", "/api/v1/lessons/**").permitAll()
        .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "CONTENT_EDITOR", "INSTRUCTOR")
        .anyRequest().authenticated())
      .logout(l -> l.logoutUrl("/api/v1/auth/logout").deleteCookies("JSESSIONID", "XSRF-TOKEN"))
      .addFilterBefore(sessionAuthenticationFilter, AnonymousAuthenticationFilter.class)
      .build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origins}") List<String> allowedOrigins) {
    var config = new CorsConfiguration();
    config.setAllowedOrigins(allowedOrigins);
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN"));
    config.setAllowCredentials(true);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
  }
}
