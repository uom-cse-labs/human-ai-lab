package lk.ac.mrt.cse.hai.api.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import lk.ac.mrt.cse.hai.api.config.HaiProperties;
import lk.ac.mrt.cse.hai.api.config.WebConfig;
import lk.ac.mrt.cse.hai.api.domain.contact.ContactOutcome;
import lk.ac.mrt.cse.hai.api.domain.contact.ContactService;
import lk.ac.mrt.cse.hai.api.security.CognitoAuthoritiesConverter;
import lk.ac.mrt.cse.hai.api.security.MethodSecurityConfig;
import lk.ac.mrt.cse.hai.api.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ContactController.class)
@Import({SecurityConfig.class, MethodSecurityConfig.class, CognitoAuthoritiesConverter.class, WebConfig.class})
@EnableConfigurationProperties(HaiProperties.class)
class ApiSecurityTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    ContactService contactService;

    private final CognitoAuthoritiesConverter converter = new CognitoAuthoritiesConverter();

    private JwtRequestPostProcessor userInGroups(String... groups) {
        return jwt().jwt(j -> j.claim("cognito:groups", List.of(groups))).authorities(converter::authorities);
    }

    @Test
    void contactFormIsPublic() throws Exception {
        when(contactService.submit(any())).thenReturn(ContactOutcome.SENT);

        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Asha\",\"email\":\"asha@example.com\",\"message\":\"Hello\"}"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void invalidContactMessageReturnsProblemDetails() throws Exception {
        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Asha\",\"email\":\"not-an-email\",\"message\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors.length()").value(2));
        verify(contactService, never()).submit(any());
    }

    @Test
    void adminApiNeedsAToken() throws Exception {
        mvc.perform(get("/api/content/news")).andExpect(status().isUnauthorized());
    }

    @Test
    void signedInUserWithoutAGroupIsForbidden() throws Exception {
        mvc.perform(get("/api/content/news").with(userInGroups())).andExpect(status().isForbidden());
    }

    @Test
    void unknownGroupsGrantNothing() throws Exception {
        mvc.perform(get("/api/content/news").with(userInGroups("superuser"))).andExpect(status().isForbidden());
    }

    @Test
    void editorsAndAdminsPassTheSecurityLayer() throws Exception {
        // No content controller exists yet, so an authorised request reaches MVC and gets 404.
        mvc.perform(get("/api/content/news").with(userInGroups("editor"))).andExpect(status().isNotFound());
        mvc.perform(get("/api/content/news").with(userInGroups("admin"))).andExpect(status().isNotFound());
    }
}
