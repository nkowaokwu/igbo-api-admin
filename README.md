# Igbo API Editor Platform

The Igbo API Editor Platform is the admin platform used by our translators and audio recorders 
to directly contribute to the [Igbo API](https://igboapi.com)

The platform is deployed at [https://editor.igboapi.com](https://editor.igboapi.com/)


### Volunteer Home base Website

This is a platform heavily used by our [volunteer translators and audio recorders](https://join.slack.com/t/igboapi/shared_invite/zt-p33cwdpw-LgoFkgIqV_~CwF64oQG5Hw) 
we have a [home base Notion page](https://editor.igboapi.com/gettingstarted) for Volunteers to get onboarded.

Click [here](./EDITORS.md) to read through the editor guidelines.


### Contributing

Contributions are always welcome. Before contributing please read the [Contribution Guide](https://github.com/ijemmao/igbo-api-admin/blob/main/CONTRIBUTING.md).


## Get Started

This is an open-source project that requires that you create your own Firebase account.

**Note:** This project requires at least Java JDK 1.8. You can download Java SE 15 [here](https://www.oracle.com/java/technologies/javase-downloads.html)

**Note**: If this is your first time running this project, you **must** request access 
to the Firebase project to start developing. Reach out to [@ijemmao](https://github.com/ijemmao).
to get access.

### Step 1: Set up the Igbo API Editor Platform

Clone the repo:

```
git clone https://github.com/ijemmao/igbo-api-admin.git
```

If you don't have Firebase globally install, run the following command:

```
npm install -g firebase firebase-cli
```

Install the Firebase project's dependencies:

```
cd functions/
yarn install
```

And then the regular project's dependencies:

```
cd ../
yarn install
```

Then log into your Firebase account by running:

```
npx firebase login
```

### Step 2: Create Firebase Projects

This project requires there to be a production and staging Firebase project to enable authentication, functions, and firestore.

Go to [Firebase](https://console.firebase.google.com) and creating two new projects:

* A production project
* A staging project

Once you've created your two new projects, go to the [`.firebaserc`]('./.firebaserc) in the root directory of the project,
and replace the `igbo-api-admin` and `igbo-api-admin-staging` with  your production project name in `"default"` 
and your staging project name in `"staging"`:

```json
{
  "projects": {
    "default": "<production_project_name>",
    "staging": "<staging_project_name>"
  }
}
```

### Step 3: Copy your Service Account Files

Now that you have your project aliased in `.firebaserc`, we want the project to start using those projects.

Within [`index.tsx`](./index.tsx), the following line of code looks for either your production or staging project service account:

```js
const productionServiceAccount = config?.runtime?.production_service_account;
const stagingServiceAccount = config?.runtime?.staging_service_account;
// ..
const serviceAccount = config?.runtime?.env === 'production' ? (() => {
  // ..
  return {
    projectId: productionServiceAccount?.project_id || localProductionServiceAccount.project_id,
    private_key: `${productionServiceAccount?.private_key || localProductionServiceAccount.private_key}`,
    client_email: productionServiceAccount?.client_email || localProductionServiceAccount.client_email,
  }
})() : (() => {
  // ..
  return {
    projectId: stagingServiceAccount?.project_id || localStagingServiceAccount.project_id,
    private_key: `${stagingServiceAccount?.private_key || localStagingServiceAccount.private_key}`,
    client_email: stagingServiceAccount?.client_email || localStagingServiceAccount.client_email,
  };
 })();
```

You want to save your `prod-firebase-service-account.json` and `staging-firebase-service-account.json` in `/functions`!

Once you save those files in `/functions`, you're own Igbo API Editor Platform is ready to go!

### Step 4: Start the Backend API

The backend server responsible for data business logic relies on the Igbo API to be running locally.

Follow the instructions in the [Igbo API](https://github.com/ijemmao/igbo_api) and start 
the local development server. You should be able to interact with the API at 
[http://localhost:8080](http://localhost:8080)

### Step 5: Start the Platform's Dev Server

With API running, in another tab, start the dev project with:

```
yarn dev
```

You should now be able to access the editor platform at [http://localhost:3030](http://localhost:3030) 🎉

**Note**: This will spin up a local version of the Firebase project `igbo-api-admin-staging` which 
is used for development purposes. Only Firebase Functions are getting emulated, so that means
that any users that create accounts and log in are stored in the project real Authentication.

If you encounter this error - ```Error: Cannot find module '/root-path/igbo-api-admin/functions/index.js'. Please verify that the package.json has a valid "main" entry``` - build the project by running:

```
yarn build:dev
```

Then go back to step 5 above.

**Login**: You can login with the email `admin@example.com` and the password `password`

If you would like to log in with your own Google or Facebook account, please reach out to Ijemma
so she can grant you access.

### Step 6: (Conditional) Seeding the Database

**For words and examples**, you will need to make a `POST` request to the following route:

```
/api/v1/test/populate
```

For example:

```
http://localhost:8080/api/v1/test/populate // POST
```

After about 20 seconds, if you see the `✅ Seeding successful.` message in your terminal,
then you have successfully populated your database!

## Build Production

If you would like to create a production build of the project, follow these steps.

Build the Firebase production project:

```
yarn build
```

Start the project:

```
yarn start
```

In another tab, start up a local instance of the Igbo API with:

```
cd igbo_api
yarn dev
```

**Note** This will spin up a local, production-style version of your Firebase project 
which can be used for production. It's not recommended to develop in this environment, but it 
is helpful to use for local testing purposes.

You should now be able to access the editor platform at [http://localhost:3030](http://localhost:3030)

## Cypress Testing

This project uses [Cypress](https://cypress.io) for frontend tests.

Start the frontend and backend server by running:

```
yarn dev:cypress
```

Running `yarn dev:cypress` will start th development server with Cypress in mind, which will mock audio URIs and bypass approval minimums.

Run the Igbo API locally:

```
cd igbo_api
yarn dev
```

### Option 1: Cypress Open Mode
If you would like to watch your Cypress tests run in browser, run:

```
yarn cypress:open
```

### Option 2: Cypress Headless Mode
If you want your Cypress tests to run in the terminal, run:

```
yarn cypress:run
```

[`http://localhost:8081`](http://localhost:8081) - The test result **Dashboard** to show all passing and failing tests


**All tests run against a built development project, make sure that you've built your project with `yarn build:dev` when testing.**

## Jest Testing

This project uses [Jest](https://jestjs.io) for unit frontend and backend tests.

To run both the frontend and backend tests, run:
```
yarn jest
```

To run just the frontend Jest tests, run:
```
yarn jest:frontend
```

To run jest the backend Jest tests, run:
```
yarn jest:backend
```
