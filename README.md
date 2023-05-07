# Igbo API Editor Platform

The Igbo API Editor Platform is the admin platform used by our Igbo lexicographers to directly input word and example data into the [Igbo API](https://igboapi.com)

![](./docs/igbo_api_editor_platform.png)

The platform is deployed at [https://editor.igboapi.com](https://editor.igboapi.com/)


### Contributing

Contributions are always welcome. Please first join the Nkọwa okwu volunteer community before jumping in: [join here](https://nkowaokwu.com/volunteer) 


## Get Started

This is an open-source project that requires that you create your own Firebase account.

### Prerequisites

To run this project locally, the following tools need to be installed:

* [Node.js](https://nodejs.org/en/download/)
* [Yarn](https://classic.yarnpkg.com/en/docs/install)
* [MongoDB](https://docs.mongodb.com/manual/administration/install-community/)
* [Firebase](https://console.firebase.google.com/)

### Step 1: Set up the Igbo API Editor Platform

Clone the repo:

```bash
git clone https://github.com/ijemmao/igbo-api-admin.git
```

If you don't have Firebase globally install, run the following command:

```bash
npm install -g firebase firebase-cli
```

Install the Firebase project's dependencies:

```bash
cd functions/
yarn install
```

And then the regular project's dependencies:

```bash
cd ../
yarn install
```

Then log into your Firebase account by running:

```bash
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

Save the service accounts that you downloaded from Firebase as `prod-firebase-service-account.json` and `staging-firebase-service-account.json` in the top-level `/functions`.

Once you save those files in `/functions`, you're own Igbo API Editor Platform is ready to go!

### Step 4: Start the Backend API

The backend server responsible for data business logic relies on the Igbo API to be running locally.

Follow the instructions in the [Igbo API](https://github.com/ijemmao/igbo_api) and start 
the local development server. You should be able to interact with the API at 
[http://localhost:8080](http://localhost:8080)

### Step 5: Start the Platform's Dev Server

With API running, in another tab, start the dev project with:

```bash
yarn dev
```

You should now be able to access the editor platform at [http://localhost:3030](http://localhost:3030) 🎉

**Note**: This will spin up a local version of the Firebase project `igbo-api-admin-staging` which 
is used for development purposes. Only Firebase Functions are getting emulated, so that means
that any users that create accounts and log in are stored in the project real Authentication.

### Common Error

If you encounter this error - ```Error: Cannot find module '/root-path/igbo-api-admin/functions/index.js'. Please verify that the package.json has a valid "main" entry``` - build the project by running:

```bash
yarn build:dev
```

Then go back to step 5 above.

### Step 6: Account Login

You can login with the email `admin@example.com` and the password `password` to create a new admin account.

If you don't create this account you will see the following error message

![Screenshot from 2023-05-06 21-21-32](https://user-images.githubusercontent.com/16169291/236648564-ab43c67f-bced-4f6c-a886-165a3ec95861.png)

### Step 7: (Optional) Seeding the Database

You will need local data to see how the Igbo API Editor Platform works.

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

```bash
yarn build
```

Start the project:

```bash
yarn start
```

In another tab, start up a local instance of the Igbo API with:

```bash
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

```bash
yarn dev:cypress
```

Running `yarn dev:cypress` will start th development server with Cypress in mind, which will mock audio URIs and bypass approval minimums.

Run the Igbo API locally:

```bash
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

```bash
yarn cypress:run
```

[`http://localhost:8081`](http://localhost:8081) - The test result **Dashboard** to show all passing and failing tests


**All tests run against a built development project, make sure that you've built your project with `yarn build:dev` when testing.**

## Jest Testing

This project uses [Jest](https://jestjs.io) for unit frontend and backend tests.

To run both the frontend and backend tests, run:
```bash
yarn jest
```

To run just the frontend Jest tests, run:
```bash
yarn jest:frontend
```

To run jest the backend Jest tests, run:
```bash
yarn jest:backend
```
