package lk.ac.mrt.cse.hai.api.web;

import java.util.List;
import lk.ac.mrt.cse.hai.api.contract.model.FieldError;
import lk.ac.mrt.cse.hai.api.contract.model.Problem;
import lk.ac.mrt.cse.hai.api.domain.contact.MailDeliveryException;
import lk.ac.mrt.cse.hai.api.domain.content.ContentRuleException;
import lk.ac.mrt.cse.hai.api.domain.content.VersionConflictException;
import lk.ac.mrt.cse.hai.api.domain.media.MediaRuleException;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishInProgressException;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishValidationException;
import lk.ac.mrt.cse.hai.api.domain.shared.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/** Maps failures to RFC 9457 problem details with the stable codes defined in the contract. */
@RestControllerAdvice
public class ProblemHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Problem> invalid(MethodArgumentNotValidException e) {
        List<FieldError> errors = e.getBindingResult().getFieldErrors().stream()
                .map(f -> new FieldError().field(f.getField()).message(f.getDefaultMessage()))
                .toList();
        return respond(problem(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Some fields are missing or invalid.").errors(errors));
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    ResponseEntity<Problem> invalidParameters() {
        return respond(problem(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "A path or query parameter is invalid."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Problem> unreadable() {
        return respond(problem(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", "The request body is not valid JSON for this endpoint."));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<Problem> unknownPathValue() {
        return respond(problem(HttpStatus.NOT_FOUND, "NOT_FOUND", "There is no such content type."));
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    ResponseEntity<Problem> missingHeader(MissingRequestHeaderException e) {
        return respond(problem(HttpStatus.PRECONDITION_REQUIRED, "PRECONDITION_REQUIRED",
                "Send the version you edited in the " + e.getHeaderName() + " header."));
    }

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<Problem> notFound(NotFoundException e) {
        return respond(problem(HttpStatus.NOT_FOUND, "NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(VersionConflictException.class)
    ResponseEntity<Problem> conflict(VersionConflictException e) {
        return respond(problem(HttpStatus.CONFLICT, "VERSION_CONFLICT", e.getMessage()));
    }

    @ExceptionHandler(ContentRuleException.class)
    ResponseEntity<Problem> rule(ContentRuleException e) {
        return respond(problem(HttpStatus.CONFLICT, e.code(), e.getMessage()));
    }

    @ExceptionHandler(MediaRuleException.class)
    ResponseEntity<Problem> media(MediaRuleException e) {
        HttpStatus status = switch (e.code()) {
            case "UNSUPPORTED_MEDIA_TYPE" -> HttpStatus.UNSUPPORTED_MEDIA_TYPE;
            case "FILE_TOO_LARGE" -> HttpStatus.CONTENT_TOO_LARGE;
            default -> HttpStatus.CONFLICT;
        };
        return respond(problem(status, e.code(), e.getMessage()));
    }

    @ExceptionHandler(PublishInProgressException.class)
    ResponseEntity<Problem> publishing(PublishInProgressException e) {
        return respond(problem(HttpStatus.CONFLICT, "PUBLISH_IN_PROGRESS", e.getMessage()));
    }

    @ExceptionHandler(PublishValidationException.class)
    ResponseEntity<Problem> notPublishable(PublishValidationException e) {
        List<FieldError> errors = e.problems().stream()
                .map(p -> new FieldError().field(p.field()).message(p.message()))
                .toList();
        return respond(problem(HttpStatus.UNPROCESSABLE_CONTENT, "VALIDATION_FAILED",
                "Nothing was published. Fix these items and publish again.").errors(errors));
    }

    @ExceptionHandler(MailDeliveryException.class)
    ResponseEntity<Problem> mailFailed() {
        return respond(problem(HttpStatus.BAD_GATEWAY, "DELIVERY_FAILED", "The message could not be delivered. Please try again later."));
    }

    private static Problem problem(HttpStatus status, String code, String detail) {
        return new Problem()
                .type("https://humanai.cse.mrt.ac.lk/problems/" + code.toLowerCase().replace('_', '-'))
                .title(status.getReasonPhrase())
                .status(status.value())
                .code(code)
                .detail(detail);
    }

    private static ResponseEntity<Problem> respond(Problem problem) {
        return ResponseEntity.status(problem.getStatus()).contentType(MediaType.APPLICATION_PROBLEM_JSON).body(problem);
    }
}
