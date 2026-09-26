package lk.ac.mrt.cse.hai.api.config;

import lk.ac.mrt.cse.hai.api.contract.model.ContentType;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /** Every controller is served under /api, matching the CloudFront behaviours and the contract's server URL. */
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix("/api", HandlerTypePredicate.forBasePackage("lk.ac.mrt.cse.hai.api.web"));
    }

    /** Path values use the contract's spelling ("news", "page-section"), not Java enum names. */
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(String.class, ContentType.class, ContentType::fromValue);
    }
}
