# Word Reminder

<p>
<img alt="Version" src="https://img.shields.io/badge/version-1.0-blue.svg?cacheSeconds=2592000" />
<a href="https://github.com/urllib3/urllib3/actions?query=workflow%3ACI"><img alt="Coverage Status" src="https://img.shields.io/badge/coverage-97%25-success" /></a>
</p>

## Table of Contents

- [Word Reminder](#word-reminder)
  - [Table of Contents](#table-of-contents)
  - [Motivation](#motivation)
  - [Screenshots](#screenshots)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Download](#download)
    - [Mobile App](#mobile-app)
    - [Extension](#extension)
  - [Creation/Updating Options](#creationupdating-options)
    - [User Word Options](#user-word-options)
    - [Word Reminder Attributes](#word-reminder-attributes)
    - [Auto Word Reminder Attributes](#auto-word-reminder-attributes)
  - [Tips](#tips)
  - [Format of CSV File](#format-of-csv-file)
  - [Permissions](#permissions)
    - [Debugging storage API](#debugging-storage-api)
      - [For Chromium browsers (Chrome, Edge, Brave)](#for-chromium-browsers-chrome-edge-brave)
      - [For Firefox](#for-firefox)
  - [Creating Words using cURL](#creating-words-using-curl)
    - [Creating a word](#creating-a-word)
  - [Self-Host](#self-host)
  - [How to load the extension locally](#how-to-load-the-extension-locally)
    - [Chrome](#chrome)
    - [Firefox](#firefox)
    - [Edge](#edge)
  - [Contribute](#contribute)
  - [Next Steps](#next-steps)
  - [Support](#support)
  - [License](#license)

## Motivation

Have you ever read a book, article, or any other form of written content and discovered unfamiliar words in it? You probably looked up the word afterward to get a definition or image. However, unless this is a common or recurring word, you'll likely forget what the word means a few days or weeks. The inspiration for this came after reading Cormac McCarthy's _Blood Meridian_, which has a sleuth of esoteric and archaic words on every page that make following along with the story challenging. I wanted something that made it easy for me look up definitions/images quickly while also storing and reminding me of words I came accross in my readings.

## Screenshots

![Word Reminder Menu](https://github.com/user-attachments/assets/7b78e167-9c39-423d-b3f5-a11128166e8f)
![Word Reminder Words](https://github.com/user-attachments/assets/bed385a8-a710-4b67-8b67-cd654d3d569d)
![Word Reminder Context Menu](https://github.com/user-attachments/assets/1c859509-3120-4b61-b2da-9cbb6fd6a519)
![Word Reminder Notification](https://github.com/user-attachments/assets/6da01e4a-0d37-4600-b05c-3ac04553e2ac)

## Introduction

Word Reminder is a chrome extension and mobile application that allows users to store words in their dictionary and reminds users of the words that they store so that users can remember words that they come across in their readings. Notifications will be shown to the user automatically based on their preferences. The notifications will show a list of words in a word reminder. All the user has to do is create an 'Auto Word Reminder' with their preferences and add words to their dictionary. Auto Word Reminders exist to create word reminders for you automatically. The goal of Word Reminder is to help users improve their vocabulary effortlessly.

It is built with PostgresQL, React.js, and Express.js in TypeScript. It uses Capacitor to convert the extension into a WebView-based mobile app. For the Capacitator mobile app, it utilizes the [@capacitator/push-notifications](https://capacitorjs.com/docs/apis/push-notifications) which relies on [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) and the [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns) under the hood. Push notification permissions are requested from the app which will allow push notifications to be sent, in this case, from the server. It leverages the [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) to send desktop push notifications that show the user a list of the words. It uses [Amazon SES](https://aws.amazon.com/ses/) to do things like send emails to users for email confirmation and resetting passwords. It utilizes [Chrome APIs](https://developer.chrome.com/docs/extensions/reference/api) for [creating a custom selection context menu](https://developer.chrome.com/docs/extensions/reference/api/contextMenus), saving the user's id in order to create [PushSubscriptions](https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription) using the [Chrome Storage Sync API](https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync), and the [Chrome Runtime API](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onMessage) to communicate between the extension and service worker, among other things. It also uses the [Free Dictionary API](https://github.com/meetDeveloper/freeDictionaryAPI) to fetch word definitions. To fetch images for words (when available), it utilizes the [Wikimedia Commons API](https://commons.wikimedia.org/w/api.php?action=help&modules=main). For scheduling related to word reminders, [pg-boss](https://github.com/timgit/pg-boss) is used since it provides useful APIs for job queuing with PostgresQL.

To find out what's new in this version of Word Reminder, please see [the changelog](https://github.com/OptimisticTrousers/word-reminder/blob/main/CHANGES.md).

## Features

- Account authentication that allows a user's dictionary to be shared between mobile app and chrome extension
- Dark and light theme
- Ability to change/reset password
- Ability to change email addresss
- Self-hostable
- Relies on free and open source technologies with the exception of Amazon SES for sending emails
- Convenient and easy to use through the automatic creation of word reminders.
- Creates a selection context menu option in the browser that allows you to add a single highlighted word to your dictionary
- Allows users to import and export a CSV file of words
- Has a mobile app and chrome extension
- 97%+ test coverage with e2e tests

## Download

### Mobile App

<p align="center"><a href="https://f-droid.org/packages/org.schabi.newpipe/"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Get_it_on_F-Droid_%28material_design%29.svg" alt="Get it on F-Droid" height=240 width=240/></a></p>
<p align="center"><a href="https://play.google.com/store/apps/details?id=com.x8bit.bitwarden&hl=en_US"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" height=240 width=240/></a></p>
<p align="center"><a href="https://upload.wikimedia.org/wikipedia/commons/a/a3/Get_it_on_F-Droid_%28material_design%29.svg"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" height=240 width=240/></a></p>

### Extension

Visit the Chrome Web Store to add the extension to your Chromium browser (Brave, Chrome, Edge): https://chromewebstore.google.com/detail/bitwarden-password-manage/nngceckbapebfimnlniiiahkandclblb

Visit Firefox Browser Add-ons to add the extension to your Gecko-based browser: https://addons.mozilla.org/en-US/firefox/addon/bitwarden-password-manager/

Visit Microsoft Edge Add-ons add the extension to Edge: https://microsoftedge.microsoft.com/addons/detail/bitwarden-password-manage/jbkfoedolllekgbhcbcoahefnbanhhlh

## Creation/Updating Options

There may be confusion as to what the options are when trying to create/update your words, auto word reminders, and regular word reminders in the 'Word Reminders' tab of the extension Here is what they do.

### User Word Options

- Learned (togglable) - determines whether or not a user word is learned. This becomes relevant when creating an 'Auto Word Reminder', which gives an option whether to include or exclude words you have already learned.

### Word Reminder Attributes

- Reminder - a crontab string that represents how often you would like a notification to be shown to you with a list of the words in the word reminder. If you would like an easy way to convert English into a cron expression, check out this site: https://cronprompt.com/.
- Finish - a date that represents when the word reminder ends. Once this date is reached, a word reminder will automatically be set to inactive and notifications for the word reminder will no longer be shown. However, word reminders will not be deleted and you can simply update 'Finish' to a later date and check 'Is Active' to activate the word reminder again.
- Is Active (togglable) - a boolean that represents if the word reminder is active or not. If the word reminder is active, notifications will continue to be shown based on the 'reminder' attribute. If the word reminder is not active, notifications will not be shown. This will automatically be set to false once the word reminder finishes. WARNING: Only one word reminder can be set to active at a time.
- Has Reminder Onload (togglable) - a boolean that determines whether to show a stale notification when the user opens their browser. The [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) only works when the user's browser is open. If the user's browser is closed while a notification should be shown, a stale notification will be shown once the user opens their browser if the option is checked. If the option is unchecked, this stale notification will not be shown when the user opens their browser.

### Auto Word Reminder Attributes

- Reminder - a crontab string that represents how often you would like a notification to be shown to you with a list of its words. If you would like an easy way to convert English into a cron expression, check out this site: https://cronprompt.com/.
- Is Active (togglable) - a boolean that represents if the automatically created word reminders will be active or not. If the word reminder is active, notifications will continue to be shown based on the 'reminder' attribute. If the word reminder is not active, notifications will not be shown.
- Duration - how long a word reminder lasts (ie. 2 weeks, 1 day and 1 hour, 3 hours). Once a word reminder ends, it will be set to inactive, and a new word reminder will be created with identical preferences specified when creating/updating an 'Auto Word Reminder'. However, word reminders will not be deleted and you can simply update 'Finish' to a later date and check 'Is Active' to activate the word reminder again.
- Word Count - how many words will be added to a word reminder. The recommended count for this is 7, based on [Miller's law](https://en.wikipedia.org/wiki/Miller%27s_law#In_psychology).
- Sort Mode - determines how a user's words will be chosen for a word reminder. User's can allow a word reminder to choose words randomly, the most newly created words, or the oldest words.
- Has Learned Words (togglable) - determines whether the word reminder is allowed to have words that the user has already learned. If checked, the word reminder can include learned words. If unchecked, the word reminder cannot include learned words.
- Create Now (togglable) - determines whether to create a word reminder right now after creating an 'Auto Word Reminder'. If checked, a word reminder will be created immediately with the preferences specified by the user. If unchecked, a word reminder will be created based on the duration set by the user (ie. in 2 weeks, in 1 day, etc.).

## Tips

- Use a shortcut to open the chrome extension such as `Shift + Ctrl + W` under your extension keyboard shortcuts to easily open Word Reminder. The word input will automatically focus so you can type in the word you want to add to your dictionary.
- Press `Escape` to close the extension and open it back up again using a shortcut such as `Shift + Ctrl + W`. It's faster to add another word to your dictionary this way using the keyboard instead of navigating back to the `User Words` page.

## Format of CSV File

When importing a CSV file to Word Reminder, the file can be in either row-major, column-major, or row and column major order. Word Reminder will automatically created and add all of the words in the CSV file to your dictionary. When exporting a CSV file of all of the words in your dictionary, the file will be in column-major order.

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

## Permissions

```bash
"permissions": [
    "contextMenus",
    "notifications",
    "storage"
],
```

### Debugging storage API

Word Reminder extension uses Storage API (see [Storage API for Chrome](https://developer.chrome.com/docs/extensions/reference/api/storage) or [Storage API for Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage)) for keeping track of the user's id.

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

You can use the web server alone to add words to your dictionary. However, the functionality for word reminders will not work properly as it relies on the Web Push API which only works in the browser through the extension. Use these commands to authenticate into the web server and create words. Only tested for Debian-based devices.

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
$ curl -c cookie.txt -H 'Content-Type: application/json'      -d '{email: <INSERT_EMAIL_HERE>, password: <INSERT_PASSWORD_HERE>}'      -X POST http://wordreminder.com/api/users | jq .
```

Logging in:

```bash
$ curl -c cookie.txt -H 'Content-Type: application/json'      -d '{email: <INSERT_EMAIL_HERE>, password: <INSERT_PASSWORD_HERE>}'      -X POST http://wordreminder.com/api/sessions | jq .
```

### Creating a word

Creating a word:

```bash
$ curl -b cookie.txt -c cookie.txt -H 'Content-Type/application/json' -d 'word=<INSERT_WORD_HERE>' http://wordreminder.com/api/users/<INSERT_YOUR_USER_ID_HERE>/userWords | jq .

```

## Self-Host

Here is a step by step plan on how to self-host Word Reminder. It will get you to a point of having a local running instance. It is recommended to use the deployed versions instead of self-hosting. Only tested for Debian-based devices:

- First, obtain v22.15.1 (LTS) for [Node.js](https://nodejs.org/en/download).
- Create an Amazon AWS account if you do not have one already, setup [Amazon SES](https://aws.amazon.com/ses/), and [create an email address identity](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html#verify-email-addresses-procedure) for your personal email address.
- Create your [Amazon AWS Access Key ID and Amazon AWS Secret Access Key](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-key-self-managed.html#Using_CreateAccessKey).
- Create your [VAPID Keys](https://web-push-codelab.glitch.me/) that are necessary to interact with Web Push services.
- Install and Setup [PostgresQL] (https://www.postgresql.org/download/). Read this guide to set it up on your computer: https://www.theodinproject.com/lessons/nodejs-installing-postgresql#step-2-install-the-postgresql-packages.
- Clone this repo:
  ```bash
  $ git clone git@github.com:OptimisticTrousers/word-reminder.git
  ```
- Create a public and private set of application server keys by visiting https://web-push-codelab.glitch.me/, or you can use the [web-push command line](https://github.com/web-push-libs/web-push#command-line) to generate keys by using the following
  ```bash
  $ npm install -g web-push
  $ web-push generate-vapid-keys
  ```
- Insert these keys in your `.env` file:

- Add a `.env` file to the root of 'extension'

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
  SERVER_PORT=5000
  SERVER_URL=http://localhost
  VAPID_PUBLIC_KEY=[YOUR VAPID PUBLIC KEY HERE]
  AWS_ACCESS_KEY_ID=[YOUR AWS ACCESS KEY ID HERE]
  AWS_SECRET_ACCESS_KEY=[YOUR AWS SECRET ACCESS KEY HERE]
  VAPID_PRIVATE_KEY=[YOUR VAPID PRIVATE KEY HERE]
  WORD_REMINDER_EMAIL=[YOUR EMAIL HERE]
  ```
- [Load the extension locally](#how-to-load-the-extension-locally)

## How to load the extension locally

1. Install Dependencies inside of the "/common" directory from the root project and build
   ```bash
   cd common/ && npm install && npm run dev
   ```
2. Install Dependencies inside of the "/extension" directory from the root project and build the extension
   ```bash
   cd extension/ && npm install && npm run extension
   ```
3. Install Dependencies inside of the "/server" directory from the root project and run the server
   ```bash
   cd server/ && npm install && npm run dev
   ```

The `npm run extension` command will generate a build folder: `dist`.

#### Chrome

For Chrome, load the `dist` folder as a local extension at [chrome://extensions/](chrome://extensions/) via "Load unpacked":

:warning: Note, that you'll need to update the extension (by clicking on the update icon) :point_up: every time you want to test the latest version.

#### Firefox

In Firefox, head over to [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox) and click on the "Load Temporary Add-on..." button on top of the page. :warning: For Firefox, you'll need to select the `dist/manifest.json` file instead of the `dist` folder.

#### Edge

With Edge, open the [edge://extensions/](edge://extensions/) page and click on the "Load unpacked" button on top of the page. Select the `dist` folder.

## Contribute

1. [Check for open issues](https://github.com/OptimisticTrousers/word-reminder/issues) or open a fresh issue to start a discussion around a feature idea or a bug.
2. Fork the `word-reminder` repository on Github to start making your changes.
3. [Load the extension locally](#how-to-load-the-extension-locally)
4. Write a test which shows that the bug was fixed or that the feature works as expected. NOTE (optional): If you want to run the unit and integration tests, use any dummy values for all of the environment variables using `npm test`. To run the e2e tests, you must use valid environment variables in your development environment and run the test-server using:

   ```bash
   cd server/ && npm run start:test

   cd extension/ && npm run e2e
   ```

5. If you make any changes to the `service-worker` folder under `extension`, `npm run extension` will not watch for those changes. Use the `npm run sw` command simultaneously with `npm run extension` in order to watch for service-worker changes.
6. Send a pull request and bug the maintainer until it gets merged and published. :) Make sure to add yourself to CONTRIBUTORS.txt.

## Next Steps

- Allow users to automatically create word reminders through a combination of nouns, verbs, adverbs, adjectives, etc.
- Add multiple language options besides English.
- Potentially allow users to use fallback APIs besides the [Free Dictionary API](https://github.com/meetDeveloper/freeDictionaryAPI) if their word does not exist.
- Consider adding privacy-friendly analytics.
- Potentially have a history of words that the user entered that do not exist. The [Free Dictionary API](https://github.com/meetDeveloper/freeDictionaryAPI) does not have definitions for all words, especially more archaic ones.

## Support

Let us know if you have issues at: wordreminder@protonmail.com

## License

The project is licensed under the MIT license.
