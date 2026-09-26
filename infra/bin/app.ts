import { App } from 'aws-cdk-lib'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '../config/index.ts'
import { addPlatform } from '../lib/platform.ts'

// Usage: npx cdk synth -c env=staging   (build the API first: services/content-api ./gradlew build)
const app = new App()
const config = loadConfig(app.node.tryGetContext('env') ?? 'staging')
const apiArtifactPath = app.node.tryGetContext('apiArtifact')
  ?? fileURLToPath(new URL('../../services/content-api/build/distributions/content-api.zip', import.meta.url))

addPlatform(app, config, { apiArtifactPath })
