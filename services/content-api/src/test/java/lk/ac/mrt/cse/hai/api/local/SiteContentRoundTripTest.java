package lk.ac.mrt.cse.hai.api.local;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Path;
import java.time.Clock;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import lk.ac.mrt.cse.hai.api.adapters.release.ReleaseFiles;
import lk.ac.mrt.cse.hai.api.domain.content.ContentService;
import lk.ac.mrt.cse.hai.api.domain.content.InMemoryContentRepository;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishService;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishServiceTest;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

/**
 * Imports the website's real built-in content, publishes it, and checks the release files match the
 * website's original data exactly. This is what lets the website switch to releases with no visible change.
 */
class SiteContentRoundTripTest {

    private static final Path SITE = Path.of("../../apps/web/src");
    private static final ObjectMapper JSON = JsonMapper.builder().build();
    private static Map<String, JsonNode> published;

    @BeforeAll
    static void importAndPublish() throws Exception {
        var repository = new InMemoryContentRepository();
        var store = new PublishServiceTest.RecordingStore();
        var contents = new ContentService(repository, Clock.systemUTC());
        var publishing = new PublishService(repository, store, new PublishServiceTest.MemoryLog(),
                new PublishServiceTest.SwitchLock(), Clock.systemUTC());
        new LocalSeeder(contents, publishing, JSON, SITE.toString()).run(null);
        published = new java.util.HashMap<>();
        ObjectMapper writer = ReleaseFiles.writer(JSON);
        ReleaseFiles.of(store.lastSnapshot).forEach((name, file) -> published.put(name, writer.valueToTree(file)));
    }

    @Test
    void publicationsMatchTheWebsite() {
        assertThat(published.get("publications.json").get("items")).isEqualTo(read("content/publications.json"));
    }

    @Test
    void researchThemesMatchTheWebsite() {
        assertThat(published.get("themes.json").get("items")).isEqualTo(read("content/themes.json"));
    }

    @Test
    void peopleMatchTheWebsite() {
        JsonNode original = read("data.json");
        java.util.Set<String> ids = new java.util.HashSet<>();
        for (String group : Set.of("teamMembers", "foundingRAs", "researchAssistants", "studentResearchers", "alumni")) {
            JsonNode expected = original.get(group).deepCopy();
            JsonNode actual = published.get("members.json").get(group).deepCopy();
            // Ids are internal (React keys), and the original data has a duplicate, so every person gets a
            // unique id; everything visitors see must match exactly.
            for (int i = 0; i < actual.size(); i++) {
                assertThat(ids.add(actual.get(i).get("id").asText())).as("unique id").isTrue();
                ((ObjectNode) actual.get(i)).remove("id");
                if (expected.get(i).has("id")) {
                    ((ObjectNode) expected.get(i)).remove("id");
                }
            }
            for (int i = 0; i < expected.size(); i++) {
                for (String field : expected.get(i).propertyNames()) {
                    assertThat(actual.get(i).get(field)).as(group + "[" + i + "]." + field).isEqualTo(expected.get(i).get(field));
                }
            }
            assertThat(actual).as(group).isEqualTo(expected);
        }
    }

    @Test
    void newsKeepsEveryArticle() {
        JsonNode news = published.get("news.json").get("items");
        assertThat(news).hasSize(3);
        Iterator<JsonNode> items = news.iterator();
        String previous = "9999-12-31";
        while (items.hasNext()) {
            String date = items.next().get("date").asText();
            assertThat(date).isLessThanOrEqualTo(previous);
            previous = date;
        }
    }

    private static JsonNode read(String relative) {
        return JSON.readTree(SITE.resolve(relative).toFile());
    }
}
