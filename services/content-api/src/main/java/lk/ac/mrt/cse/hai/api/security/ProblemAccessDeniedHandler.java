package lk.ac.mrt.cse.hai.api.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

/** A signed-in user tried something their role doesn't allow: answer with problem details, not an empty 403. */
public class ProblemAccessDeniedHandler implements AccessDeniedHandler {

    static final String BODY = """
            {"type":"https://humanai.cse.mrt.ac.lk/problems/forbidden","title":"Forbidden","status":403,"code":"FORBIDDEN",\
            "detail":"Your role can't do this. Publishing, rolling back, hiding and deleting content need the admin role."}""";

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException denied) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.getOutputStream().write(BODY.getBytes(StandardCharsets.UTF_8));
    }
}
