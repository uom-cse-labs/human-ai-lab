package lk.ac.mrt.cse.hai.api.security;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/** Maps the {@code cognito:groups} claim (editor, admin) to Spring roles; other groups are ignored. */
@Component
public class CognitoAuthoritiesConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final Set<String> KNOWN_GROUPS = Set.of("editor", "admin");

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        return new JwtAuthenticationToken(jwt, authorities(jwt), jwt.getSubject());
    }

    public Collection<GrantedAuthority> authorities(Jwt jwt) {
        List<String> groups = jwt.getClaimAsStringList("cognito:groups");
        return (groups == null ? List.<String>of() : groups).stream()
                .filter(KNOWN_GROUPS::contains)
                .<GrantedAuthority>map(g -> new SimpleGrantedAuthority("ROLE_" + g.toUpperCase()))
                .toList();
    }
}
