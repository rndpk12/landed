package com.landed.common.exception;

import com.landed.common.error.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ApiError> notFound(ResourceNotFoundException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(ConflictException.class)
    ResponseEntity<ApiError> conflict(ConflictException exception, HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(BadRequestException.class)
    ResponseEntity<ApiError> badRequest(BadRequestException exception, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(UnprocessableEntityException.class)
    ResponseEntity<ApiError> unprocessable(UnprocessableEntityException exception, HttpServletRequest request) {
        return error(HttpStatus.UNPROCESSABLE_ENTITY, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<ApiError> badCredentials(HttpServletRequest request) {
        return error(HttpStatus.UNAUTHORIZED, "Invalid email or password", request, Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(fieldError ->
                fields.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage()));
        return error(HttpStatus.BAD_REQUEST, "Validation failed", request, fields);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiError> constraintViolation(ConstraintViolationException exception, HttpServletRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(violation ->
                fields.put(violation.getPropertyPath().toString(), violation.getMessage()));
        return error(HttpStatus.BAD_REQUEST, "Validation failed", request, fields);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    ResponseEntity<ApiError> malformedRequest(Exception exception, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, "Malformed request", request, Map.of());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> unexpected(Exception exception, HttpServletRequest request) {
        log.error("Unhandled request error", exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request, Map.of());
    }

    private ResponseEntity<ApiError> error(HttpStatus status, String message, HttpServletRequest request,
                                           Map<String, String> fieldErrors) {
        ApiError body = new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), message,
                request.getRequestURI(), fieldErrors);
        return ResponseEntity.status(status).body(body);
    }
}
