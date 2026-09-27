package lk.ac.mrt.cse.hai.api.security;

import java.util.Collection;
import java.util.List;
import lk.ac.mrt.cse.hai.api.config.HaiProperties;
import org.springframework.context.annotation.Profile;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * Cloudflare Access decides who may sign in at all (its application policy). Everyone it lets in is an editor;
 * the emails listed in {@code hai.admin-emails} (ADMIN_EMAILS) are also admins.
 */
@Component
@Profile("cloudflare")
public class AccessAuthoritiesConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final HaiProperties properties;

    public AccessAuthoritiesConverter(HaiProperties properties) {
        this.properties = properties;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        return new JwtAuthenticationToken(jwt, authorities(jwt), email != null ? email : jwt.getSubject());
    }

    public Collection<GrantedAuthority> authorities(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            return List.of(); // service tokens carry no email: no dashboard access
        }
        return properties.isAdminEmail(email)
                ? List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_EDITOR"))
                : List.of(new SimpleGrantedAuthority("ROLE_EDITOR"));
    }
}
