/**
 * The Content API's state: one SQLite-backed Durable Object holding drafts, the media library and the release
 * history, with release files and photos in R2. A single instance means version checks and the publish lock
 * are exact, as they were with the single Java instance.
 */
import { DurableObject } from 'cloudflare:workers'
import type { User } from './api/access.ts'
import { ContentService } from './api/content.ts'
import { CloudflareImageProcessor, OriginalSizeProcessor } from './api/images.ts'
import { MediaService } from './api/media.ts'
import { CONTENT_TYPES, hasUnpublishedChanges } from './api/model.ts'
import { PublishService } from './api/publishing.ts'
import { Router } from './api/router.ts'
import { IMPORT_USER, importSiteContent, type SeedBundle } from './api/seed.ts'
import { R2Files, SqlStore } from './api/store.ts'
import type { AdminEnv } from './env.ts'
import seed from './seed.gen.json'

const IMPORTED_TYPES = ['news', 'publication', 'theme', 'member'] as const

export class ContentStore extends DurableObject<AdminEnv> {
  private readonly store: SqlStore
  private readonly contents: ContentService
  private readonly publishing: PublishService
  private readonly router: Router
  private importing?: Promise<boolean>

  constructor(ctx: DurableObjectState, env: AdminEnv) {
    super(ctx, env)
    this.store = new SqlStore(ctx.storage.sql)
    const files = new R2Files(env.CONTENT)
    this.contents = new ContentService(this.store)
    this.publishing = new PublishService(this.store, files)
    const processor = env.IMAGES ? new CloudflareImageProcessor(env.IMAGES) : new OriginalSizeProcessor()
    this.router = new Router({ contents: this.contents, media: new MediaService(this.store, files, processor), publishing: this.publishing })
  }

  /** One /api request from a signed-in user. */
  async handle(request: Request, user: User): Promise<Response> {
    return this.router.handle(request, user)
  }

  /**
   * On a brand-new deployment, imports the website's built-in content and publishes it. Does nothing once
   * anything has been published. Returns whether a release exists.
   */
  async ensureContent(): Promise<boolean> {
    this.importing ??= this.importOnce().finally(() => {
      this.importing = undefined
    })
    return this.importing
  }

  private async importOnce(): Promise<boolean> {
    if (this.store.listReleases().length) {
      return true
    }
    // Only into an empty dashboard, so nothing someone created before the first publish is duplicated.
    if (IMPORTED_TYPES.some((type) => this.store.listItems(type).length)) {
      console.log('Not importing the site content: the dashboard already has content. Publish from the dashboard.')
      return false
    }
    const summary = importSiteContent(seed as SeedBundle, this.contents)
    // Never publish someone else's unfinished drafts along with the import.
    if (CONTENT_TYPES.some((type) => this.store.listItems(type).some((i) => hasUnpublishedChanges(i) && i.updatedBy !== IMPORT_USER))) {
      console.log(`Imported ${summary}. Not published: other drafts exist; publish from the dashboard.`)
      return false
    }
    await this.publishing.publish(`Imported ${summary} from the website's built-in content`, IMPORT_USER)
    console.log(`Imported ${summary} and published`)
    return true
  }
}
