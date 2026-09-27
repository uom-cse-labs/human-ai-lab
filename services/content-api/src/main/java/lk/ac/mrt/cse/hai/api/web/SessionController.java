package lk.ac.mrt.cse.hai.api.web;

import lk.ac.mrt.cse.hai.api.contract.api.SessionApi;
import lk.ac.mrt.cse.hai.api.contract.model.Role;
import lk.ac.mrt.cse.hai.api.contract.model.Session;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;

/** Who is signed in, so the dashboard hides actions the API would refuse. */
@RestController
@PreAuthorize("hasRole('EDITOR')")
public class SessionController implements SessionApi {

    @Override
    public ResponseEntity<Session> getSession() {
        boolean admin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        return ResponseEntity.ok(new Session().name(CurrentUser.name()).role(admin ? Role.ADMIN : Role.EDITOR));
    }
}
