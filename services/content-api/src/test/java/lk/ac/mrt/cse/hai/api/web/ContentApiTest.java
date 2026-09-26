package lk.ac.mrt.cse.hai.api.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import lk.ac.mrt.cse.hai.api.config.HaiProperties;
import lk.ac.mrt.cse.hai.api.config.WebConfig;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentService;
import lk.ac.mrt.cse.hai.api.domain.content.ContentStatus;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;
import lk.ac.mrt.cse.hai.api.domain.content.VersionConflictException;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishService;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishValidationException;
import lk.ac.mrt.cse.hai.api.domain.publishing.Release;
import lk.ac.mrt.cse.hai.api.domain.shared.Page;
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
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest({ContentController.class, ReleasesController.class})
@Import({SecurityConfig.class, MethodSecurityConfig.class, CognitoAuthoritiesConverter.class, WebConfig.class})
@EnableConfigurationProperties(HaiProperties.class)
@TestPropertySource(properties = "hai.storage=test")
class ContentApiTest {

    private static final String BODY = """
            {"slug":"open-day","title":"Open day","fields":{"date":"2026-10-01"}}""";

    @Autowired
    MockMvc mvc;

    @MockitoBean
    ContentService contents;

    @MockitoBean
    PublishService publishing;

    private final CognitoAuthoritiesConverter converter = new CognitoAuthoritiesConverter();

    private JwtRequestPostProcessor as(String group) {
        return jwt().jwt(j -> j.claim("cognito:groups", List.of(group)).claim("username", group + "-user"))
                .authorities(converter::authorities);
    }

    private static ContentItem item(int version) {
        return new ContentItem("n_1", ContentType.NEWS, "open-day", "Open day", null, null, Map.of("date", "2026-10-01"),
                List.of(), ContentStatus.PUBLISHED, version, 1, "editor-user", Instant.parse("2026-10-01T10:00:00Z"));
    }

    @Test
    void editorsListContentByContractTypeName() throws Exception {
        when(contents.list(ContentType.NEWS, null, 25)).thenReturn(new Page<>(List.of(item(2)), null));

        mvc.perform(get("/api/content/news").with(as("editor")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].status").value("published"))
                .andExpect(jsonPath("$.items[0].version").value(2))
                .andExpect(jsonPath("$.items[0].publishedVersion").value(1));
    }

    @Test
    void savingWithoutAVersionIsRejected() throws Exception {
        mvc.perform(put("/api/content/news/n_1").with(as("editor")).contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isPreconditionRequired())
                .andExpect(jsonPath("$.code").value("PRECONDITION_REQUIRED"));
    }

    @Test
    void aStaleSaveReturnsConflict() throws Exception {
        when(contents.update(eq(ContentType.NEWS), eq("n_1"), any(), eq(1), eq("editor-user")))
                .thenThrow(new VersionConflictException(item(2)));

        mvc.perform(put("/api/content/news/n_1").with(as("editor")).header("If-Match", "1")
                        .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("VERSION_CONFLICT"));
    }

    @Test
    void editorsCannotPublishOrRollBack() throws Exception {
        mvc.perform(post("/api/publish").with(as("editor")).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("admin role")));
        mvc.perform(post("/api/releases/r1/restore").with(as("editor"))).andExpect(status().isForbidden());
        mvc.perform(post("/api/content/news/n_1/unpublish").with(as("editor"))).andExpect(status().isForbidden());
    }

    @Test
    void adminsPublish() throws Exception {
        when(publishing.publish("Launch", "admin-user"))
                .thenReturn(new Release("2026-10-02T09-15-00Z", "admin-user", Instant.parse("2026-10-02T09:15:00Z"), "Launch"));

        mvc.perform(post("/api/publish").with(as("admin")).contentType(MediaType.APPLICATION_JSON).content("{\"note\":\"Launch\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.isCurrent").value(true))
                .andExpect(jsonPath("$.publishedBy").value("admin-user"));
    }

    @Test
    void publishingInvalidContentExplainsWhatToFix() throws Exception {
        when(publishing.publish(any(), anyString())).thenThrow(new PublishValidationException(
                List.of(new PublishValidationException.Problem("news/n_1.date", "\"Open day\" needs a date (YYYY-MM-DD)."))));

        mvc.perform(post("/api/publish").with(as("admin")).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.errors[0].field").value("news/n_1.date"));
    }

    @Test
    void unknownContentTypesAreNotFound() throws Exception {
        mvc.perform(get("/api/content/widgets").with(as("editor"))).andExpect(status().isNotFound());
    }

}
