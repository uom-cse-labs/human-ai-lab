package lk.ac.mrt.cse.hai.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * {@code @PreAuthorize} role checks, active in every profile. Class-based proxies are required: controllers
 * implement generated interfaces, and an interface proxy would hide {@code @RestController} from Spring MVC.
 */
@Configuration
@EnableMethodSecurity(proxyTargetClass = true)
public class MethodSecurityConfig {

    /** Admins can do everything editors can. */
    @Bean
    static RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.withDefaultRolePrefix().role("ADMIN").implies("EDITOR").build();
    }
}
