package lk.ac.mrt.cse.hai.api.security;

import lk.ac.mrt.cse.hai.api.config.HaiProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Cloudflare: sign-in is Cloudflare Access in front of the dashboard Worker, which forwards the signed
 * {@code Cf-Access-Jwt-Assertion} header. The token is checked here too (signature, issuer, audience), so the
 * API never relies on the Worker alone. Roles come from {@link AccessAuthoritiesConverter}.
 */
@Configuration
@Profile("cloudflare")
public class AccessSecurityConfig {

    static final String NOT_CONFIGURED = "not-configured";
    private static final String ACCESS_HEADER = "Cf-Access-Jwt-Assertion";
    private static final Logger log = LoggerFactory.getLogger(AccessSecurityConfig.class);

    @Bean
    SecurityFilterChain api(HttpSecurity http, AccessAuthoritiesConverter authoritiesConverter) throws Exception {
        return http
                .csrf(csrf -> csrf.disable()) // the Access token is a header, never read from cookies here
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
                        .requestMatchers(HttpMethod.GET, "/internal/ready").permitAll()
                        .requestMatchers("/api/**").hasRole("EDITOR")
                        .anyRequest().denyAll())
                .oauth2ResourceServer(rs -> rs
                        .bearerTokenResolver(accessTokenResolver())
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(authoritiesConverter))
                        .accessDeniedHandler(new ProblemAccessDeniedHandler()))
                .exceptionHandling(e -> e.accessDeniedHandler(new ProblemAccessDeniedHandler()))
                .build();
    }

    /** Reads the Access token from its own header instead of {@code Authorization: Bearer}. */
    static BearerTokenResolver accessTokenResolver() {
        return request -> {
            String token = request.getHeader(ACCESS_HEADER);
            return token == null || token.isBlank() ? null : token;
        };
    }

    /**
     * Access signs tokens with keys published at {@code <team domain>/cdn-cgi/access/certs}; they are fetched
     * lazily and cached. Until the Access application is set up, every token is refused.
     */
    @Bean
    JwtDecoder jwtDecoder(HaiProperties properties) {
        if (NOT_CONFIGURED.equals(properties.clientId()) || properties.issuerUri().contains(NOT_CONFIGURED)) {
            log.warn("Cloudflare Access is not configured (ACCESS_TEAM_DOMAIN, ACCESS_AUD): the dashboard API refuses every request");
            return token -> {
                throw new BadJwtException("Cloudflare Access is not configured");
            };
        }
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withJwkSetUri(properties.issuerUri() + "/cdn-cgi/access/certs")
                .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(properties.issuerUri()),
                new JwtClaimValidator<Object>("aud", aud -> aud instanceof java.util.Collection<?> list
                        ? list.contains(properties.clientId())
                        : properties.clientId().equals(aud))));
        return decoder;
    }
}
