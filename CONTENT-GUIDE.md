# Content Authoring Guide

This guide covers how to write and publish content for the Human-AI Lab website — Lab Dispatches (news) and Research Projects.

## Where content lives

| Content type | Directory | Index file |
|---|---|---|
| Lab Dispatches (News) | `src/content/news/` | `src/content/news-index.gen.json` |
| Research Projects | `src/content/projects/` | `src/content/projects-index.gen.json` |

Each article/project is a single Markdown (`.md`) file. The index files are auto-generated — **do not edit them by hand**.

## Adding a new article

Create a new `.md` file in the appropriate directory with YAML frontmatter at the top.

### Frontmatter fields

#### Dispatches (news)

```yaml
---
title: "Your Article Title"
date: "MONTH DD, YYYY"
content: "A one-sentence summary shown on the listing page."
imageUrl: "https://images.unsplash.com/photo-xxxxxxxxxxxxx?auto=format&fit=crop&q=80&w=600"
share:
  twitter: https://twitter.com/HumanAILab/status/...
  linkedin: https://linkedin.com/posts/human-ai-lab/...
---
```

#### Projects

```yaml
---
title: "Your Project Title"
date: "MONTH DD, YYYY"
content: "A one-sentence summary shown on the listing page and featured card."
imageUrl: "https://images.unsplash.com/photo-xxxxxxxxxxxxx?auto=format&fit=crop&q=80&w=600"
order: 0
share:
  twitter: https://twitter.com/HumanAILab/status/...
  linkedin: https://linkedin.com/posts/human-ai-lab/...
---
```

#### Field reference

| Field | Type | Applies to | Required | Description |
|---|---|---|---|---|
| `title` | string | Both | Yes | Headline shown on listing cards and the detail page |
| `date` | string | Both | Yes | Display date in uppercase (e.g. `"JUNE 10, 2024"`). Used for sorting. |
| `content` | string | Both | Yes | Short summary (1 sentence). Appears on listing cards beneath the title. |
| `imageUrl` | string | Both | Yes | URL to the hero/banner image. Unsplash recommended. |
| `order` | number | Projects only | No | Lower values pin the project higher. A project with `order: 0` appears as the featured project. |
| `share.twitter` | string | Both | No | Full URL to the Twitter share/post for this item. |
| `share.linkedin` | string | Both | No | Full URL to the LinkedIn share/post for this item. |

### Body content

After the closing `---` of the frontmatter, write the full article body in Markdown. Use standard Markdown syntax — headings, lists, links, bold, italic, code blocks, etc. The body is rendered with `react-markdown`.

```markdown
---
title: "Example Article"
date: "JANUARY 1, 2024"
content: "A brief summary of the article."
imageUrl: "https://images.unsplash.com/photo-..."
---

## Section Heading

This is the full article content. You can use **bold**, _italic_, lists, and more.

### Sub-section

- Item one
- Item two
- Item three

[Link text](https://example.com)
```

## Naming convention

The filename determines the URL slug:

- `my-article.md` → `/news/my-article` or `/projects/my-article`
- `responsible-ai-workshop.md` → `/news/responsible-ai-workshop`

Use lowercase with hyphens. Choose a slug that is descriptive and unlikely to change.

## Regenerating the index

After adding, editing, or removing a content file, the JSON index must be regenerated. This happens automatically when you run the dev server or build:

```bash
npm run dev        # runs both index generators before starting
npm run build      # runs both index generators before building
```

You can also regenerate manually:

```bash
npm run generate-news-index      # news only
npm run generate-projects-index  # projects only
```

The index determines the sort order on the listing pages:
- **Projects**: sorted by `order` (ascending), then by `date` (descending)
- **Dispatches**: sorted by `date` (descending)

After regenerating, commit both the new `.md` file and the updated index JSON.

## Previewing changes

```bash
npm run dev
```

The dev server runs on `http://localhost:6014`. Changes to content files and the index take effect on the next page load (no server restart needed after index regeneration).

## Tips

- Use Unsplash for images with the query params `?auto=format&fit=crop&q=80&w=600` for consistent sizing
- Keep the `content` summary field to one sentence — it's used on listing cards and as a subtitle
- For projects, only set `order: 0` on the project you want featured; leave others without an `order` field
- The date format should be all-caps: `"JANUARY 15, 2024"` (not `"Jan 15, 2024"` or `"2024-01-15"`)
