package lk.ac.mrt.cse.hai.api.web;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/** Name recorded as {@code updatedBy} / {@code publishedBy}: the Cognito username, else the principal name. */
final class CurrentUser {

    private CurrentUser() {}

    static String name() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt) {
            String username = jwt.getToken().getClaimAsString("username");
            return username != null ? username : jwt.getName();
        }
        return auth != null ? auth.getName() : "anonymous";
    }
}
