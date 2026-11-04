package com.codepathacademy.common;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.codepathacademy.learning.NotesService;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<ApiError> badRequest(IllegalArgumentException ex) { return error(HttpStatus.BAD_REQUEST, ex.getMessage(), Map.of()); }
  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex) {
    Map<String, String> fields = ex.getBindingResult().getFieldErrors().stream().collect(java.util.stream.Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage, (first, ignored) -> first));
    return error(HttpStatus.BAD_REQUEST, "Validation failed", fields);
  }
  @ExceptionHandler(java.util.NoSuchElementException.class)
  ResponseEntity<ApiError> notFound(java.util.NoSuchElementException ex) { return error(HttpStatus.NOT_FOUND, ex.getMessage(), Map.of()); }
  @ExceptionHandler(NotesService.ConflictException.class)
  ResponseEntity<ApiError> conflict(NotesService.ConflictException ex) { return error(HttpStatus.CONFLICT, ex.getMessage(), Map.of()); }
  private ResponseEntity<ApiError> error(HttpStatus status, String message, Map<String, String> details) {
    return ResponseEntity.status(status).body(new ApiError(Instant.now(), status.value(), message, details));
  }
  public record ApiError(Instant timestamp, int status, String message, Map<String, String> details) {}
}
