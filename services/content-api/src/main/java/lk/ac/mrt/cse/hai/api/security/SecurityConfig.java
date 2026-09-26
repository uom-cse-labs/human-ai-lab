package lk.ac.mrt.cse.hai.api.security;

import lk.ac.mrt.cse.hai.api.config.HaiProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Replaces API Gateway's JWT authorizer (technical design §7.3): every request except the public
 * contact form needs a valid Cognito access token, and admin-only use cases check the role.
 */
@Configuration
@Profile("!local")
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http, CognitoAuthoritiesConverter authoritiesConverter) throws Exception {
        return http
                .csrf(csrf -> csrf.disable()) // bearer tokens only, no cookies
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
                        .requestMatchers("/api/**").hasRole("EDITOR")
                        .anyRequest().denyAll())
                .oauth2ResourceServer(rs -> rs
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(authoritiesConverter))
                        .accessDeniedHandler(new ProblemAccessDeniedHandler()))
                .exceptionHandling(e -> e.accessDeniedHandler(new ProblemAccessDeniedHandler()))
                .build();
    }

    /**
     * Signing keys are fetched lazily from Cognito's JWKS endpoint and cached, so start-up (and the
     * SnapStart snapshot) doesn't depend on the network.
     */
    @Bean
    JwtDecoder jwtDecoder(HaiProperties properties) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withJwkSetUri(properties.issuerUri() + "/.well-known/jwks.json")
                .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(properties.issuerUri()),
                new CognitoAccessTokenValidator(properties.clientId())));
        return decoder;
    }
}
