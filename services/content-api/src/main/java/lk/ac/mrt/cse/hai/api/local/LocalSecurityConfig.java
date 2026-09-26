package lk.ac.mrt.cse.hai.api.local;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import lk.ac.mrt.cse.hai.api.security.ProblemAccessDeniedHandler;

/**
 * Local development only: stands in for Cognito sign-in. Every request is a local user whose role comes
 * from the {@code X-Local-Role} header ({@code admin} by default, or {@code editor}), so role rules can be
 * tried from the dashboard. Refuses to start inside AWS Lambda.
 */
@Configuration
@Profile("local")
public class LocalSecurityConfig {

    public LocalSecurityConfig() {
        if (System.getenv("AWS_LAMBDA_FUNCTION_NAME") != null) {
            throw new IllegalStateException("The local profile must never run in AWS Lambda");
        }
    }

    @Bean
    SecurityFilterChain localApi(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/content/**").permitAll()
                        .requestMatchers("/api/contact").permitAll()
                        .requestMatchers("/api/**").hasRole("EDITOR")
                        .anyRequest().denyAll())
                .addFilterBefore(new LocalUserFilter(), AuthorizationFilter.class)
                .exceptionHandling(e -> e.accessDeniedHandler(new ProblemAccessDeniedHandler()))
                .build();
    }

    static final class LocalUserFilter extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                throws ServletException, IOException {
            boolean editorOnly = "editor".equalsIgnoreCase(request.getHeader("X-Local-Role"));
            var roles = editorOnly
                    ? List.of(new SimpleGrantedAuthority("ROLE_EDITOR"))
                    : List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_EDITOR"));
            var user = new UsernamePasswordAuthenticationToken(editorOnly ? "local-editor" : "local-admin", null, roles);
            SecurityContextHolder.getContext().setAuthentication(user);
            try {
                chain.doFilter(request, response);
            } finally {
                SecurityContextHolder.clearContext();
            }
        }
    }
}
