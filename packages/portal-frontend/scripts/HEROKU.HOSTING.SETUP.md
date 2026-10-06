# Heroku Hosting Setup

This guide walks through the complete setup process for deploying `portal-frontend` to Heroku, including buildpacks configuration, environment variables, domain setup, and CI/CD pipeline integration.

## Create Heroku App

Create a new app on Heroku with your desired app name:

```bash
<app_name>  # e.g. mlspin-portal-dev
```

## Add Buildpacks

Configure the necessary buildpacks for the monorepo structure:

```bash
./packages/portal-frontend/scripts/set-heroku-buildpacks.sh <app_name>
```

This will add the following buildpacks required for `portal-frontend` build:

- `heroku-buildpack-monorepo`
- `heroku/nodejs`

## Environment Variables

### Copy from Existing App

Copy environment variables from an existing `portal-frontend` Heroku app:

```bash
./portal-backend/scripts/internal/duplicate_heroku_config.sh --src <existing_app_name> --target <app_name>
```

> **Good to know:** The `duplicate_heroku_config.sh` script is located in the `portal-backend` repository.

### Required Configuration

After copying, adjust the following mandatory environment variables:

- `NEXT_PUBLIC_APP_CONFIGURATION` - Must match your instance configuration name
- `NEXT_PUBLIC_APP_DOMAIN` - Required for OAuth redirects to work correctly
- `NEXT_PUBLIC_API_URL` - Must point to the correct `portal-backend` URL

## Domain Setup

### Add Domain to Heroku

1. Navigate to your Heroku app settings
2. Add your domain (e.g., `mlspin-portal-dev.condosportal.ca`)

### Configure DNS

Add a CNAME record in your DNS provider pointing to the DNS Target provided by Heroku:

```dns
mlspin-portal-dev.condosportal.ca CNAME floral-scorpion-lk8ro138dydc3od867f1234.herokudns.com
```

### Enable SSL Certificate

1. Navigate to the **SSL Certificates** section in your Heroku app settings
2. Click **Configure SSL**
3. Select **Automatic Certificate Management (ACM)**

> **Good to know:** SSL certificate provisioning typically takes 10-15 minutes after Heroku finds your CNAME record, but can take up to an hour. You can verify your CNAME record setup using the [DIG tool](https://toolbox.googleapps.com/apps/dig/#CNAME/). Allow time for DNS propagation.

## CI/CD Pipeline Setup

### Configure BitBucket Deployment Environment

1. Open [BitBucket Deployment Settings](https://bitbucket.org/repliers-client-work/smartmls-frontend/admin/pipelines/deployment-settings)

2. Select the appropriate environment type:
   - Test environments
   - Staging environments
   - Production environments

3. Click **Add environment** and create a new environment with a name matching your Heroku app name (e.g., `mlspin-portal-dev`)

4. Add the `HEROKU_APP_NAME` variable with a value equal to your Heroku app name

> **Good to know:** Make sure to **NOT** mark the `HEROKU_APP_NAME` variable as **Secured** so you can easily verify it.

5. Optionally add `BUILD_DOCUMENTATION` = `true` to also ship both docs sites under `/documentation` (built in the pipeline by `pnpm build:documentation`, since Heroku itself only sees `packages/portal-frontend`)

### Update Bitbucket Pipelines Configuration

#### Add Custom Pipeline

Inside the `pipelines.custom` section of `bitbucket-pipelines.yml`:

```yaml
pipelines:
  custom:
    <app_name>:
      - step: *npm-run-test
      - step:
          <<: *deploy_portal
          name: Deploy <app_name>
          deployment: <app_name>
```

#### Test the Pipeline

1. Push the updated `bitbucket-pipelines.yml` file to BitBucket
2. Navigate to [BitBucket Pipelines](https://bitbucket.org/repliers-client-work/smartmls-frontend/pipelines)
3. Click **Run Pipeline**
4. Select Branch: `master`
5. Select pipeline: `custom: <app_name>`
6. Click **Run**
7. Verify the pipeline completes successfully

#### Enable Automatic Deployment (Optional)

To enable automatic deployment on branch updates, add the following to `pipelines.branches.master.parallel`:

```yaml
pipelines:
  branches:
    master:
      - parallel:
          - step:
              condition:
                changesets:
                  includePaths:
                    - 'packages/portal-frontend/**'
                    - 'bitbucket-pipelines.yml'
              <<: *deploy_portal
              name: Deploy <app_name>
              deployment: <app_name>
```

This configuration will automatically deploy when changes are detected in `packages/portal-frontend/` or `bitbucket-pipelines.yml`.

## Backend CORS Configuration

To allow your `portal-frontend` app to access the API, configure CORS on the corresponding `portal-backend` app:

1. Navigate to your backend Heroku app settings (e.g., `mlspin-backend-dev`)
2. Go to **Settings** → **Config Vars**
3. Add your frontend domain to the `APP_CORS_DOMAIN` variable (e.g., `https://mlspin-portal-dev.condosportal.ca`)

   > **Important:** Do not include a trailing slash when adding the domain to `APP_CORS_DOMAIN`.

4. If `APP_CORS_DOMAIN` contains multiple domains, separate them by comma

5. Setup OAuth Client ID
   1. Go to GCP [API Credentials](https://console.cloud.google.com/apis/credentials?hl=en&project=<app_name>)

   2. Create OAuth 2.0 Client IDs for Web Application if not created yet - [How to create OAuth Client ID](https://support.google.com/googleapi/answer/6158849?hl=en)

   3. Inside OAuth Client ID settings
      - add Authorized JavaScript origins: `https://<your_domain>` (e.g. `https://mlspin-portal-dev.condosportal.ca`)
      - add Authorized redirect URIs: `https://<your_domain>/auth/google/processing` (e.g. `https://mlspin-portal-dev.condosportal.ca/auth/google/processing`)

   4. Now Single Sign On with Google shoudl work on `portal-frontend` app (provided you setup portal-backend OAuth correctly which is covered inside `portal-backend` Heroku setup instructions)

Enjoy your newly setup Heroku hosting for `<app_name>`!
