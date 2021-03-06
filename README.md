Typescript fork of https://github.com/boswelja/promote-play-beta-action

# promote-play-beta-action
Promote the latest open testing release from one track to another on Google Play. Likely used in conjunction with the https://github.com/r0adkll/upload-google-play/ Action for a CD pipeline to Google Play.

## Inputs

### `service-account-json-raw`

**Required:** The raw json text of the service account private key to authorize the upload request.

### `package-name`

**Required:** The package name, or Application Id, of the app you are editing.

### `inapp-update-priority`

In-app update priority of the release. All newly added APKs in the release will be considered at this priority. Can take values in the range [0, 5], with 5 the highest priority. Defaults to 0.

### `user-fraction`

Portion of users who should get the staged version of the app. Accepts values between 0.0 and 1.0 (exclusive-inclusive).

Setting this to 1.0 will mark the release as `completed` - see docs [here](https://developers.google.com/android-publisher/api-ref/rest/v3/edits.tracks#status).

### `from-track`

The source track to promote from. Defaults to beta.

### `to-track`

The target track to promote to. Defaults to production.
