# Word Reminder

<p>
<img alt="Version" src="https://img.shields.io/badge/version-1.1.3-blue.svg?cacheSeconds=2592000" />
<a href="https://github.com/OptimisticTrousers/word-reminder/actions?query=workflow%3Apipeline"><img alt="Coverage Status" src="https://img.shields.io/badge/coverage-97%25-success" /></a>
</p>

## Table of Contents

- [Word Reminder](#word-reminder)
  - [Table of Contents](#table-of-contents)
  - [Motivation](#motivation)
  - [Screenshots](#screenshots)
  - [Introduction](#introduction)
  - [Technologies](#technologies)
  - [Features](#features)
  - [Download](#download)
    - [Requirements](#requirements)
    - [Mobile App](#mobile-app)
    - [Extension](#extension)
    - [Source](#source)
  - [Creation/Updating Options](#creationupdating-options)
    - [User Word Options](#user-word-options)
    - [Word Reminder Attributes](#word-reminder-attributes)
    - [Auto Word Reminder Attributes](#auto-word-reminder-attributes)
  - [Tips](#tips)
  - [Format of CSV File](#format-of-csv-file)
  - [Extension Permissions](#extension-permissions)
    - [contextMenus justification](#contextmenus-justification)
    - [notifications justification](#notifications-justification)
    - [storage justification](#storage-justification)
    - [Host permission justification](#host-permission-justification)
  - [Mobile App Permissions](#mobile-app-permissions)
    - [Debugging extension storage API](#debugging-extension-storage-api)
      - [For Chromium browsers (Chrome, Edge, Brave)](#for-chromium-browsers-chrome-edge-brave)
      - [For Firefox](#for-firefox)
  - [Creating Words using cURL](#creating-words-using-curl)
    - [Creating a word](#creating-a-word)
  - [Setup Local Browser Extension](#setup-local-browser-extension)
  - [Setup Local Mobile App](#setup-local-mobile-app)
  - [How to load the extension locally](#how-to-load-the-extension-locally)
      - [Chrome](#chrome)
      - [Firefox](#firefox)
      - [Edge](#edge)
  - [Contribute](#contribute)
  - [Delete Account](#delete-account)
  - [Next Steps](#next-steps)
  - [Known Bugs](#known-bugs)
  - [Support](#support)
  - [License](#license)

## Motivation

Have you ever read a book, article, or any other form of written content and discovered unfamiliar words in it? You probably looked up the word afterward to get a definition or image. However, unless this is a common or recurring word, you'll likely forget what the word means a few days or weeks later. The inspiration for this came after reading Cormac McCarthy's _Blood Meridian_, which has a sleuth of esoteric and archaic words on every page that make following along with the story challenging. I wanted something that made it easy for me look up definitions/images quickly while also storing and reminding me of words I came across in my readings.

## Screenshots

![Word Reminder Menu](https://github.com/user-attachments/assets/7b78e167-9c39-423d-b3f5-a11128166e8f)

![Word Reminder Words](https://github.com/user-attachments/assets/bed385a8-a710-4b67-8b67-cd654d3d569d)

![Word Reminder Context Menu](https://github.com/user-attachments/assets/1c859509-3120-4b61-b2da-9cbb6fd6a519)

![Word Reminder Notification](https://github.com/user-attachments/assets/6da01e4a-0d37-4600-b05c-3ac04553e2ac)

<img width="270" alt="" src="https://github.com/user-attachments/assets/38c2df58-2c55-457b-9944-a986d221df0d" />

<img width="270" alt="" src="https://github.com/user-attachments/assets/e73783a0-e5ca-428c-8e48-f472823d1c7c" />

<img width="270" alt="" src="https://github.com/user-attachments/assets/bf840685-8477-442b-95a4-f295eec34659" />

<img width="270" alt="" src="https://github.com/user-attachments/assets/0276e28b-fec4-4b0f-82cd-623274bba6e6" />

<img width="270" alt="" src="https://github.com/user-attachments/assets/6f374cb6-833e-417f-80f5-73347eec2c05" />

<img width="270" alt="" src="https://github.com/user-attachments/assets/0f19cb2c-770a-4015-a18e-710ed50fe298" />

## Introduction

Word Reminder is a browser extension and mobile application that allows users to store words in their dictionary and reminds users of the words that they store to enhance users' reading flow. Notifications will be shown to the user automatically based on their preferences. The notifications will show a list of words in a word reminder. All the user has to do is create an 'Auto Word Reminder' with their preferences and add words to their dictionary. Auto Word Reminders exist to create word reminders for you automatically. The goal of Word Reminder is to help users improve their vocabulary effortlessly.

To see Word Reminder's website: https://ww.word-reminder.com

To find out what's new in this version of Word Reminder, please see [the changelog](https://github.com/OptimisticTrousers/word-reminder/blob/main/CHANGES.md).

## Technologies

Word Reminder is built with [PostgresQL](https://www.postgresql.org/), [React.js](https://react.dev/), and [Express.js](https://expressjs.com/) in [TypeScript](https://www.typescriptlang.org/). Word Reminder was first built as a browser extension. it uses [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview) for data fetching.

The Word Reminder browser extension leverages the [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) to send desktop push notifications that show the user a list of the words in their word reminders. It utilizes [Chrome APIs](https://developer.chrome.com/docs/extensions/reference/api) to [create a custom selection context menu](https://developer.chrome.com/docs/extensions/reference/api/contextMenus), saving the user's id in order to create [PushSubscriptions](https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription) using the [Chrome Storage Sync API](https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync), and the [Chrome Runtime API](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onMessage) to communicate between the extension and service worker, among other things.

The Word Reminder mobile app uses [Capacitor](https://capacitorjs.com/) to convert the extension into a WebView-based mobile app. The mobile port reuses as much code used in the browser extension as possible. However, there are a few notable differences. The mobile port does not use any [Chrome APIs](https://developer.chrome.com/docs/extensions/reference/api) because they are not available inside of a WebView. Additionally, the [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API#browser_compatibility) is not used since it is not available inside of a WebView. Instead, the mobiel app utilizes the [@capacitator/push-notifications](https://capacitorjs.com/docs/apis/push-notifications), an [offical Capacitor plugin](https://github.com/ionic-team/capacitor-plugins) which relies on [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) and the [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns) under the hood. Unlike the browser extension, the mobile app needs to explicitly request permission from the user to send push notifications. Lastly, a text selection context menu option called "Word Reminder" is created with a custom plugin called [TextSelectionActionPlugin](https://github.com/OptimisticTrousers/word-reminder/blob/mobile/clients/android/app/src/main/java/com/wordreminder/www/TextSelectionActionPlugin.java) and by specifying an ACTION_PROCESS_TEXT intent-filter in [AndroidManifest.xml](https://github.com/OptimisticTrousers/word-reminder/blob/mobile/clients/android/app/src/main/AndroidManifest.xml). When the user highlights a word, this "Word Reminder" option will add the word to the user's dictionary across apps. More details on how this feature works is explained here: https://medium.com/androiddevelopers/custom-text-selection-actions-with-action-process-text-191f792d2999. Due to the aforementioned details, the mobile port does not need to use a service worker.

The server, which both the mobile app and browser extension use, utilizes the [Free Dictionary API](https://github.com/meetDeveloper/freeDictionaryAPI) to fetch word definitions. To fetch images for words (when available), it utilizes the [Wikimedia Commons API](https://commons.wikimedia.org/w/api.php?action=help&modules=main). For scheduling related to word reminders, [pg-boss](https://github.com/timgit/pg-boss) is used since it provides convinient APIs for job queuing with PostgresQL. The server uses [Amazon SES](https://aws.amazon.com/ses/) to send emails to users for email confirmation and resetting passwords. 

## Features

- Account authentication that allows a user's dictionary to be shared between mobile app and browser extension
- Allows users to get push notifications on both the browser extension and mobile app
- Allows users to get definitions and images of words quickly
- Allows users to search, sort, and filter words
- Dark and light theme
- Ability to change/reset password
- Ability to change email addresss
- Relies on free and open source technologies with the exception of Amazon SES for sending emails and Firebase Cloud Messaging for push notifications
- Convenient and easy to use through the automatic creation of word reminders
- Creates a selection context menu option in the browser that allows you to add a single highlighted word to your dictionary
- Allows users to import and export a CSV file of words
- Has a mobile app and browser extension
- 97%+ test coverage for the browser extension, mobile app, and server with end-to-end tests for critical features
- Includes a comphrehensive CI/CD pipeline with GitHub Actions.

## Download

### Requirements

Word Reminder should work with any device. However, these are the specifications used to build Word Reminder:

- Linux Mint 22 
- ARM64 CPU Architecture
- 64GB of system memory (RAM), 8 cores of vCPU
- Node v20.18.0 and npm 10.8.2
- At least 1GB of free disk space

### Mobile App

<p align="center"><a href="https://play.google.com/store/apps/details?id=com.wordreminder.www"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" height=240 width=240/></a></p>

### Extension

NOTE: In order to enable the use of push notifications with the help of the Web Push API, the user needs to enable desktop notification permissions in their operating system settings. A push notification will be sent on a recurring basis based on the word reminder that a user creates.

Visit the Chrome Web Store to add the extension to your Chromium browser (Brave, Chrome, Edge): https://chromewebstore.google.com/detail/word-reminder/oejlbeackbidindbmobdbcfhjieljhji

Visit Firefox Browser Add-ons to add the extension to your Gecko-based browser: https://addons.mozilla.org/en-US/firefox/addon/word-reminder/

Visit Microsoft Edge Add-ons add the extension to Edge: https://microsoftedge.microsoft.com/addons/detail/word-reminder/gpciakmhepdkgaeocophgcdiahcbolam

### Source

You can also download from source by unzipping the extension.zip file and following the instructions to [load the extension locally](#how-to-load-the-extension-locally) and/or downloading the mobile app apk by going to releases: https://github.com/OptimisticTrousers/word-reminder/releases.

## Creation/Updating Options

There may be confusion as to what the options are when trying to create/update your words, auto word reminders, and regular word reminders in the 'Word Reminders' tab of the extension Here is what they do.

### User Word Options

- Learned (togglable) - determines whether or not a user word is learned. This becomes relevant when creating an 'Auto Word Reminder', which gives an option whether to include or exclude words you have already learned.

### Word Reminder Attributes

- Reminder - a crontab string that represents how often you would like a notification to be shown to you with a list of the words in the word reminder. If you would like an easy way to convert English into a cron expression, check out this site: https://cronprompt.com/. The application uses UTC time so you need to make sure the crontab string is in UTC. In other words, convert your current time zone to UTC and use the crontab expression for that. For example, if your timezone is 'America/New_York' and you want to schedule the reminder to show every 4 PM ET (which is 'America/New_York' time), use the 8 PM UTC cron expression because UTC time is four hours ahead of ET. The 8 PM UTC cron expression would be "0 20 * * *".
- Finish - a date that represents when the word reminder ends. Once this date is reached, a word reminder will automatically be set to inactive and notifications for the word reminder will no longer be shown. However, word reminders will not be deleted and you can simply update 'Finish' to a later date and check 'Is Active' to activate the word reminder again. The application uses UTC time so you need to make sure the finish date is in UTC.
- Is Active (togglable) - a boolean that represents if the word reminder is active or not. If the word reminder is active, notifications will continue to be shown based on the 'reminder' attribute. If the word reminder is not active, notifications will not be shown. This will automatically be set to false once the word reminder finishes. WARNING: Only one word reminder can be set to active at a time.
- Has Reminder Onload (togglable) - a boolean that determines whether to show a stale notification when the user opens their browser. The [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) only works when the user's browser is open. If the user's browser is closed while a notification should be shown, a stale notification will be shown once the user opens their browser if the option is checked. If the option is unchecked, this stale notification will not be shown when the user opens their browser.

### Auto Word Reminder Attributes

- Reminder - a crontab string that represents how often you would like a notification to be shown to you with a list of the words in the word reminder. If you would like an easy way to convert English into a cron expression, check out this site: https://cronprompt.com/. The application uses UTC time so you need to make sure the crontab string is in UTC.
- Is Active (togglable) - a boolean that represents if the automatically created word reminders will be active or not. If the word reminder is active, notifications will continue to be shown based on the 'reminder' attribute. If the word reminder is not active, notifications will not be shown.
- Duration - how long a word reminder lasts (ie. 2 weeks, 1 day and 1 hour, 3 hours). Once a word reminder ends, it will be set to inactive, and a new word reminder will be created with identical preferences specified when creating/updating an 'Auto Word Reminder'. However, word reminders will not be deleted and you can simply update 'Finish' to a later date and check 'Is Active' to activate the word reminder again.
- Word Count - how many words will be added to a word reminder. The recommended count for this is 7, based on [Miller's law](https://en.wikipedia.org/wiki/Miller%27s_law#In_psychology).
- Sort Mode - determines how a user's words will be chosen for a word reminder. User's can allow a word reminder to choose random words, the most newly created words, or the oldest created words.
- Has Learned Words (togglable) - determines whether the word reminder is allowed to have words that the user has already learned. If checked, the word reminder can include learned words. If unchecked, the word reminder cannot include learned words.
- Create Now (togglable) - determines whether to create a word reminder right now after creating an 'Auto Word Reminder'. If checked, a word reminder will be created immediately with the preferences specified by the user. If unchecked, a word reminder will be created based on the duration set by the user (ie. in 2 weeks, in 1 day, etc.).

## Tips

- Use a shortcut to open the browser extension such as `Shift + Ctrl + W` under your extension keyboard shortcuts to easily open Word Reminder. The word input will automatically focus so you can type in the word you want to add to your dictionary.
- Press `Escape` to close the extension and open it back up again using a shortcut such as `Shift + Ctrl + W`. It's faster to add another word to your dictionary this way using the keyboard instead of navigating back to the `User Words` page.

## Format of CSV File

When importing a CSV file to Word Reminder, the file can be in either row-major, column-major, or row and column major order. Word Reminder will automatically create and add all of the words in the CSV file to your dictionary. When exporting a CSV file of all of the words in your dictionary, the file will be in column-major order.

Row-Major Order:

```
dispensation, serreptitously, gutatory, patronage,
```

Column-Major Order:

```
dispensation
patronage
non compos mentis (considered one word)
```

Row and Column Major Order:

```
dispensation, serreptitously
gutatory
patronage
```

## Extension Permissions

```bash
"permissions": [
    "contextMenus",
    "notifications",
    "storage"
],
```

### contextMenus justification

A text selection context menu called "Add Word" is used to allow users to quickly and easily add words to their dictionary without having to type or copy and paste the word into the chrome extension. A similar text selection context menu option is created by the "Word Reference" mobile app which allows users to look up definitions of the words that they have selected.

### notifications justification

In order to remind users of the words that they have in their word reminder, the Web Push API is used to facilitate that. Notifications are only sent to the user if they create a Word Reminder through the chrome extension.

### storage justification

In order to know which user is adding a word to their dictionary using the "Add Word" text selection context menu option, the user's id is stored using the Chrome Storage Sync API, which allows the service worker to open and redirect the user to the page of the word that they have selected.

### Host permission justification

The chrome extension needs to store cookies since it used traditional session-based authentication, meaning that it needs to interact directly with the user's browser and client data.

NOTE: These permissions are automatically granted once the user installs the browser extension.

## Mobile App Permissions

- Notifications

NOTE: The Word Reminder mobile app will not request permissions for notifications until the user is about to create an (Auto Word Reminder)(#auto-word-reminder-attributes) or (Word Reminder)(#word-reminder-attributes).

### Debugging extension storage API

The Word Reminder browser extension uses the Storage API (see [Storage API for Chrome](https://developer.chrome.com/docs/extensions/reference/api/storage) or [Storage API for Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage)) for keeping track of the user's id. This is used to create a [PushSubscription](https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription) for each user, as explained earlier in the [Introduction](#introduction).

#### For Chromium browsers (Chrome, Edge, Brave)

To check out current storage data, right click on the extension icon and select "Inspect pop-up". In the dev console run:

```js
chrome.storage.sync.get(console.log);
```

To clear storage run the following code in the dev console:

```js
chrome.storage.sync.clear(() => {
  console.log("Cleared!");
});
```

#### For Firefox

Head over to the [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox) page and click on the "Inspect" button next to the "Word Reminder" extension.

```js
browser.storage.sync.get(console.log);
```

To clear storage run the following code in the dev console:

```js
browser.storage.sync.clear(() => {
  console.log("Cleared!");
});
```

## Creating Words using cURL

You can use the web server alone to add words to your dictionary. However, the functionality for word reminders on the browser extension will not work properly as it relies on the Web Push API which only works in the browser through the extension. Word reminders will work correctly on the mobile app, however, as long as the user grants notification permissions. Use these commands to authenticate into the web server and create words.

Install cURL:

```bash
$ sudo apt-get install curl
```

Install command-line JSON processor to get easy to read responses:

```bash
$ sudo apt-get install jq
```

Registering:

```bash
$ curl -c cookie.txt -H 'Content-Type: application/json'      -d '{email: <INSERT_EMAIL_HERE>, password: <INSERT_PASSWORD_HERE>}'      -X POST http://word-reminder.com/api/users | jq .
```

Logging in:

```bash
$ curl -c cookie.txt -H 'Content-Type: application/json'      -d '{email: <INSERT_EMAIL_HERE>, password: <INSERT_PASSWORD_HERE>}'      -X POST http://word-reminder.com/api/sessions | jq .
```

### Creating a word

Creating a word:

```bash
$ curl -b cookie.txt -c cookie.txt -H 'Content-Type/application/json' -d 'word=<INSERT_WORD_HERE>' http://wordreminder.com/api/users/<INSERT_YOUR_USER_ID_HERE>/userWords | jq .

```

## Setup Local Browser Extension

Here is a step by step plan on how to locally setup the Word Reminder browser extension. It will get you to a point of having a local running instance. It is recommended to use the deployed versions unless contributing. Only tested for Debian-based devices:

- First, obtain v22.15.1 (LTS) for [Node.js](https://nodejs.org/en/download).
- Clone this repo:
  ```bash
  $ git clone git@github.com:OptimisticTrousers/word-reminder.git
  ```
- Install project dependencies:
  ```bash
  cd clients/ && npm install && cd ../server && npm install
  ```
- Create an Amazon AWS account if you do not have one already, setup [Amazon SES](https://aws.amazon.com/ses/), and [create an email address identity](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html#verify-email-addresses-procedure) for your personal email address.
- Create your [Amazon AWS Access Key ID and Amazon AWS Secret Access Key](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-key-self-managed.html#Using_CreateAccessKey).
- Create your [VAPID Keys](https://web-push-codelab.glitch.me/) that are necessary to interact with Web Push services.
- Install and Setup [PostgresQL] (https://www.postgresql.org/download/). Read this guide to set it up on your computer: https://www.theodinproject.com/lessons/nodejs-installing-postgresql#step-2-install-the-postgresql-packages. Afterwards, run this command to seed the database.

```bash
  cd server/ && npm run seed
```

- Create a public and private set of application server keys by visiting https://web-push-codelab.glitch.me/, or you can use the [web-push command line](https://github.com/web-push-libs/web-push#command-line) to generate keys by using the following
  ```bash
  $ npm install -g web-push
  $ web-push generate-vapid-keys
  ```
- Insert these keys in your `.env` file:

- Add a `.env` file to the root of 'clients'

  ```bash
  VITE_API_DOMAIN=http://localhost:5000/api
  VITE_VAPID_PUBLIC_KEY=[YOUR VAPID PUBLIC KEY HERE]
  ```

- Add a `.env` file to the root of 'server'
  ```bash
  DATABASE_URL=postgresql://<role_name>:<role_password>@localhost:5432/word_reminder
  TEST_DATABASE_URL=postgresql://<role_name>:<role_password>@localhost:5432/test_word_reminder
  NODE_ENV=development
  SALT=11
  SECRET=[enter any secret value or 'keyboard cat']
  PORT=5000
  SERVER_URL=http://localhost:5000
  VAPID_PUBLIC_KEY=[YOUR VAPID PUBLIC KEY HERE]
  AWS_ACCESS_KEY_ID=[YOUR AWS ACCESS KEY ID HERE]
  AWS_SECRET_ACCESS_KEY=[YOUR AWS SECRET ACCESS KEY HERE]
  VAPID_PRIVATE_KEY=[YOUR VAPID PRIVATE KEY HERE]
  WORD_REMINDER_EMAIL=[YOUR EMAIL HERE]
  ```
- [Load the extension locally](#how-to-load-the-extension-locally)

## Setup Local Mobile App

Perform all of the above steps to locally setup the mobile app.

- Install [Android Studio](https://developer.android.com/studio) and setup an [emulator](https://docs.expo.dev/workflow/android-studio-emulator/#set-up-an-emulator)
- Follow the steps in this [blog post](https://capawesome.io/blog/the-push-notifications-guide-for-capacitor/#add-firebase-to-your-android-app) to create and add [Firebase](https://firebase.google.com/) to your android project.
- Run the following command to rebuild and sync web code to Android
  ```bash
  cd clients/ && npm run build && npx cap sync
  ```
- Navigate to Firebase [service accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk) in the Project settings. Then click `Generate new private key` and `Generate key` to download the service account key.

- Change the VITE_API_DOMAIN in the `.env` file under `/clients` as follows for the mobile app:

  ```bash
  VITE_API_DOMAIN=http://10.0.2.2:5000/api
  ```

- Run your Android emulator and run the following commands

  ```bash
  export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json" (example path of service file you just downloaded)

  npx cap run android
  ```

- The app will be downloaded to your emulator automatically.

## How to load the extension locally

1. Install Dependencies inside of the "/common" directory from the root project and build
   ```bash
   cd common/ && npm install && npm run dev
   ```
2. Install Dependencies inside of the "/clients" directory from the root project and build the extension
   ```bash
   cd clients/ && npm install && npm run build
   ```
3. Install Dependencies inside of the "/server" directory from the root project and run the server
   ```bash
   cd server/ && npm install && npm run dev
   ```

The `npm run build` command will generate a build folder: `dist`.

#### Chrome

For Chrome, load the `dist` folder as a local extension at [chrome://extensions/](chrome://extensions/) via "Load unpacked":

:warning: Note, that you'll need to update the extension (by clicking on the update icon) :point_up: every time you want to test the latest version.

#### Firefox

In Firefox, head over to [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox) and click on the "Load Temporary Add-on..." button on top of the page. :warning: For Firefox, you'll need to select the `dist/manifest.json` file instead of the `dist` folder.

You'll need to make sure that the `manifest.json` file looks like this, making sure to replace `background.service_worker` with `background.scripts` because `background.service_worker` is not supported in Firefox yet, along with the extension's ID:

```js
{
  "manifest_version": 3,
  "version": "1.1.3",
  "description": "Allows users to store and remind themselves of words in their dictionary to improve vocabulary and increase word retention.",
  "name": "Word Reminder",
  "action": {
    "default_popup": "index.html?popup=true"
  },
  "browser_specific_settings": {
    "gecko": {
      "id": "@oejlbeackbidindbmobdbcfhjieljhji"
    }
  },
  "background": {
    "scripts": ["service-worker.js"],
    "type": "module"
  },
  "permissions": ["contextMenus", "notifications", "storage"],
  "host_permissions": ["http://*/*", "https://*/*"],
  "icons": {
    "16": "images/word-reminder-16x16.png"
  }
}

```

#### Edge

With Edge, open the [edge://extensions/](edge://extensions/) page and click on the "Load unpacked" button on top of the page. Select the `dist` folder.

## Contribute

1. [Check for open issues](https://github.com/OptimisticTrousers/word-reminder/issues) or open a fresh issue to start a discussion around a feature idea or a bug.
2. Fork the `word-reminder` repository on Github to start making your changes.
3. [Load the extension locally](#how-to-load-the-extension-locally)
4. Write a test which shows that the bug was fixed or that the feature works as expected. NOTE (optional): If you want to run the unit and integration tests, use any dummy values for all of the environment variables using `npm test`. To run the e2e tests, you must use valid environment variables in your development environment and run the test-server using:

   ```bash
   cd clients/ && npm run e2e
   ```

Additionally, you must go to [fixtures.ts](https://github.com/OptimisticTrousers/word-reminder/blob/main/clients/tests/e2e/helpers.ts) and change the email address to one verified by your [Amazon SES](https://aws.amazon.com/ses/)Amazon SES() account.

5. If you make any changes to the `service-worker` folder under `clients`, `npm run extension -- --watch` will not watch for those changes. Use the `npm run sw -- --watch` command simultaneously with `npm run extension -- --watch` in order to watch for service-worker changes.
6. Send a pull request and bug the maintainer until it gets merged and published. :) Make sure to add yourself to CONTRIBUTORS.txt.
7. A GitHub Actions workflow will automatically lint, test, and build the application for both the frontend and backend, as well as run all e2e tests when any pull requests are made to the main branch.
8. You can skip the deployment step if unnecessary (ie. updating docs) by including the "#skip" tag in your commit message.

## Delete Account

In order to permanently delete your account, log into Word Reminder, navigate to "Settings", and click on the "Delete User" button.

## Next Steps

- Allow users to automatically create word reminders through a combination of nouns, verbs, adverbs, adjectives, etc.
- Add multiple language options besides English.
- Potentially allow users to use fallback APIs besides the [Free Dictionary API](https://github.com/meetDeveloper/freeDictionaryAPI) if their word does not exist.
- Consider adding privacy-friendly analytics.
- Potentially have a history of words that the user entered that do not exist. The [Free Dictionary API](https://github.com/meetDeveloper/freeDictionaryAPI) does not have definitions for all words, especially more archaic ones.
- When using the text selection context menu option on mobile, show a pop-up instead of redirecting the user to the Word Reminder app.
- Add an iOS App Store port of Word Reminder. I currently cannot do this because I do not have access to a Mac with XCode. The text selection context menu option and push notifications need to be included in this port.
- Add a CD pipeline for deploying to the Chrome Web Store, Firefox Add-ons, Microsoft Edge Add-ons, and the Google Play Store.
- Implement Push Notifications using [UnifiedPush](https://unifiedpush.org/), an open-source alternative to [FCM](https://firebase.google.com/docs/cloud-messaging).
- When a user is confirming their email, the browser extension does not automatically redirect the user to the home page. Instead, the user needs to close and re-open the browser extension for the user confirmation to be detected. The user should automatically be redirected to the home page.

## Known Bugs

1. The Word Reminder extension service worker sleeps after a while, which can cause the `Add Word` text selection context menu option to disappear. Signing out, reloading the extension, and signing back into the extension is a temporary fix for anyone who has this problem.

## Support

Let us know if you have issues at: word-reminder@protonmail.com

## License

The project is licensed under the MIT license.
