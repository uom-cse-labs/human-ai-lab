package lk.ac.mrt.cse.hai.api.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import lk.ac.mrt.cse.hai.api.config.HaiProperties;
import lk.ac.mrt.cse.hai.api.config.WebConfig;
import lk.ac.mrt.cse.hai.api.domain.contact.ContactOutcome;
import lk.ac.mrt.cse.hai.api.domain.contact.ContactService;
import lk.ac.mrt.cse.hai.api.security.AccessAuthoritiesConverter;
import lk.ac.mrt.cse.hai.api.security.AccessSecurityConfig;
import lk.ac.mrt.cse.hai.api.security.MethodSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/** Cloudflare profile: Cloudflare Access tokens, roles from ADMIN_EMAILS. */
@WebMvcTest({SessionController.class, ContactController.class})
@Import({AccessSecurityConfig.class, AccessAuthoritiesConverter.class, MethodSecurityConfig.class, WebConfig.class})
@EnableConfigurationProperties(HaiProperties.class)
@ActiveProfiles("cloudflare")
@TestPropertySource(properties = {
        "hai.issuer-uri=https://hai-lab.cloudflareaccess.com",
        "hai.client-id=test-aud",
        "hai.admin-emails=Director@Example.org, second@example.org"})
class AccessSecurityTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    AccessAuthoritiesConverter converter;

    @MockitoBean
    ContactService contactService;

    private JwtRequestPostProcessor signedIn(String email) {
        return jwt().jwt(j -> j.claim("email", email)).authorities(converter::authorities);
    }

    @Test
    void dashboardApiNeedsAnAccessToken() throws Exception {
        mvc.perform(get("/api/session")).andExpect(status().isUnauthorized());
    }

    @Test
    void forgedAccessHeaderIsRejected() throws Exception {
        mvc.perform(get("/api/session").header("Cf-Access-Jwt-Assertion", "not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void anyoneAccessLetsInIsAnEditor() throws Exception {
        mvc.perform(get("/api/session").with(signedIn("asha@example.org")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("asha@example.org"))
                .andExpect(jsonPath("$.role").value("editor"));
    }

    @Test
    void adminEmailsAreAdminsIgnoringCase() throws Exception {
        mvc.perform(get("/api/session").with(signedIn("director@example.org")))
                .andExpect(jsonPath("$.role").value("admin"));
        mvc.perform(get("/api/session").with(signedIn("second@example.org")))
                .andExpect(jsonPath("$.role").value("admin"));
    }

    @Test
    void tokensWithoutAnEmailGrantNothing() throws Exception {
        mvc.perform(get("/api/session").with(jwt().authorities(converter::authorities)))
                .andExpect(status().isForbidden());
    }

    @Test
    void contactFormStaysPublic() throws Exception {
        when(contactService.submit(any())).thenReturn(ContactOutcome.SENT);
        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Asha\",\"email\":\"asha@example.com\",\"message\":\"Hello\"}"))
                .andExpect(status().isAccepted());
    }
}
