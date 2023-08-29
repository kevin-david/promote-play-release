import * as core from '@actions/core'
import * as fs from 'fs'
import { auth, androidpublisher_v3, androidpublisher } from '@googleapis/androidpublisher'

let serviceAccountFile = './serviceAccountJson.json'

async function run(): Promise<void> {
  try {
    // Code initially taken from https://github.com/boswelja/promote-play-beta-action

    const packageName = core.getInput('package-name', { required: true })
    const rawServiceAccountJson = core.getInput('service-account-json-raw', {
      required: true
    })
    const inAppUpdatePriority = parseInt(core.getInput('inapp-update-priority'))
    const userFraction = parseFloat(core.getInput('user-fraction'))
    const fromTrack = core.getInput('from-track')
    const toTrack = core.getInput('to-track')

    core.debug(
      'Writing service account JSON to file, setting env variable so auth can find it'
    )
    await fs.promises.writeFile(serviceAccountFile, rawServiceAccountJson, {
      encoding: 'utf8'
    })

    serviceAccountFile = await fs.promises.realpath(serviceAccountFile)
    core.exportVariable('GOOGLE_APPLICATION_CREDENTIALS', serviceAccountFile)

    core.debug('Authenticating: creating auth client')
    const authClient = new auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/androidpublisher']
    })

    const publisher: androidpublisher_v3.Androidpublisher = androidpublisher('v3')
    core.info('Creating a new app edit')
    const appEdit = await publisher.edits.insert({
      packageName: packageName,
      auth: auth
    })

    const appEditId = appEdit.data.id
    if (!appEditId) {
      throw new Error(`appEditId is not defined. Data: ${appEdit.data}`)
    }

    core.info(`Getting current ${fromTrack} info`)
    const sourceTrack = await publisher.edits.tracks.get({
      auth: auth,
      packageName,
      editId: appEditId,
      track: fromTrack
    })

    core.debug(`Mapping ${fromTrack} releases to target releases`)
    core.debug(
      `Applying new fraction ${userFraction}, new priority ${inAppUpdatePriority}`
    )

    const sourceReleases = sourceTrack.data.releases
    if (!sourceReleases) {
      throw new Error(
        `sourceReleases is not defined. Data: ${sourceTrack.data}`
      )
    }

    const toTrackReleases = sourceReleases.map(release => {
      release.inAppUpdatePriority = inAppUpdatePriority

      if (userFraction === 1.0) {
        // Assume this release is completed, and fully roll it out
        release.status = 'completed'
      } else {
        // See https://developers.google.com/android-publisher/api-ref/rest/v3/edits.tracks#status
        // The API requires us to explicitly set this for some reason
        // Otherwise, you get an error: `Error: Release status must be specified.`
        release.userFraction = userFraction
        release.status = 'inProgress'
      }

      return release
    })

    core.info(`Switching ${fromTrack} release to ${toTrack}`)
    await publisher.edits.tracks.update({
      auth: auth,
      editId: appEditId,
      track: toTrack,
      packageName,
      requestBody: {
        track: toTrack,
        releases: toTrackReleases
      }
    })

    core.info('Committing changes')
    const commitResult = await publisher.edits.commit({
      auth: auth,
      editId: appEditId,
      packageName
    })

    // Check commit was successful
    if (!commitResult.data.id) {
      throw new Error(
        `Error ${commitResult.status}: ${commitResult.statusText}`
      )
    }

    core.info(`Successfully promoted release to ${toTrack}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export async function cleanup(): Promise<void> {
  await fs.promises.unlink(serviceAccountFile)
}

run()
