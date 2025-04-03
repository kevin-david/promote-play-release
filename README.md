# Promote Play Release Action

A GitHub Action that promotes Android app releases between different tracks on Google Play (e.g., from beta to production). This action is particularly useful when combined with the [upload-google-play](https://github.com/r0adkll/upload-google-play) action to create a complete CI/CD pipeline for your Android app.

## Features

- Promote releases between any Google Play tracks (e.g., internal testing → beta → production)
- Configure in-app update priority for promoted releases
- Control staged rollout percentage
- Simple integration with GitHub Actions workflows
- Support for both raw JSON and file-based service account credentials

## Prerequisites

1. A Google Play Console account with appropriate permissions
2. A Google Play service account with the following permissions:
   - `androidpublisher` API access
   - Appropriate app-level permissions in Play Console
3. The service account JSON key file

## Setup

1. Create a service account in the Google Play Console:
   - Go to Setup → API access
   - Create a new service account or select an existing one
   - Download the JSON key file

2. Add the service account JSON as a GitHub secret:
   - Go to your repository settings
   - Navigate to Secrets and Variables → Actions
   - Create a new secret named `GOOGLE_PLAY_SERVICE_ACCOUNT` with the contents of your JSON key file

## Usage

### Basic Example (Using Raw JSON)

```yaml
name: Promote to Production
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to promote'
        required: true

jobs:
  promote:
    runs-on: ubuntu-latest
    steps:
      - name: Promote to Production
        uses: kevin-david/promote-play-release@v1
        with:
          service-account-json-raw: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          package-name: 'com.example.app'
          from-track: 'beta'
          to-track: 'production'
```

### Basic Example (Using File-based Credentials)

```yaml
name: Promote to Production
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to promote'
        required: true

jobs:
  promote:
    runs-on: ubuntu-latest
    steps:
      - id: auth
        name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: <<project-identity>>
          service_account: <<service-account>>

      - name: Promote to Production
        uses: kevin-david/promote-play-release@v1
        with:
          service-account-json-file: ${{ steps.auth.outputs.credentials_file_path }}
          package-name: 'com.example.app'
          from-track: 'beta'
          to-track: 'production'
```

### Complete CI/CD Pipeline Example

```yaml
name: Android Release Pipeline
on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          
      - name: Build Release Bundle
        run: ./gradlew bundleRelease
        
      - name: Upload to Internal Testing
        uses: r0adkll/upload-google-play@v2
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          packageName: com.example.app
          releaseFiles: app/build/outputs/bundle/release/app-release.aab
          track: internal
          status: completed
          
      - name: Promote to Beta
        uses: kevin-david/promote-play-release@v1
        with:
          service-account-json-raw: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          package-name: com.example.app
          from-track: internal
          to-track: beta
          user-fraction: 0.5  # 50% staged rollout
          inapp-update-priority: 3
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `service-account-json-raw` | No* | - | The raw JSON text of the service account private key |
| `service-account-json-file` | No* | - | Path to the service account JSON file (e.g., from google-github-actions/auth) |
| `package-name` | Yes | - | The package name (Application ID) of your Android app |
| `from-track` | No | `beta` | The source track to promote from |
| `to-track` | No | `production` | The target track to promote to |
| `inapp-update-priority` | No | `0` | In-app update priority (0-5, where 5 is highest) |
| `user-fraction` | No | `1.0` | Percentage of users to receive the update (0.0-1.0) |

\* Either `service-account-json-raw` or `service-account-json-file` must be provided. If both are provided, `service-account-json-file` takes precedence.

## Track Types

Google Play offers several release tracks. Here are the common ones in order of increasing visibility:

1. `internal` - Internal testing track
2. `alpha` - Closed testing track
3. `beta` - Open testing track
4. `production` - Production track

## Best Practices

1. **Staged Rollouts**: Use `user-fraction` for gradual rollouts to production to catch issues early
2. **Update Priority**: Set appropriate `inapp-update-priority` based on your release's importance
3. **Track Progression**: Follow a logical progression: internal → alpha → beta → production
4. **Automation**: Integrate this action into your CI/CD pipeline for automated releases
5. **Authentication**: Consider using `google-github-actions/auth` with `service-account-json-file` for better security practices

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
