# Vectra Detect SaaS API Client

This package is used to create an API client for Vectra Detect SaaS brains.

## Usage

This package can be installed via NPM with the following command `npm i vectra-saas-api-client`

Once this package is installed it can be initialised like this

```
const SaaSClient = require("vectra-saas-api-client");
const client = new SaaSClient("BrainURL", "ClientID", "Secret");
```

All functions of this client are asynchronous and so require either Promises or Await syntax to function correctly.

For example, to retrieve all detections on your brain with a Threat score greater than 1, you would use the following functions:

```
client
  .getAllDetections({ t_score_gte: 1 })
  .then((results) => {
    //Do something with the results
  })
  .catch((err) => {
    //Handle error
  });
```

#### OR

```
try {
  let results = await client.getAllDetections({ t_score_gte: 1 });
} catch (err) {
  //Handle error
}
```

---

# Full API Client Documentation

## SaaSClient(siteURL, clientID, secret)

Creates a new SaaS Client Object.

#### new SaaSClient(siteURL, clientID, secret)

##### Parameters:

| Name       | Type   | Description                                                                              |
| ---------- | ------ | ---------------------------------------------------------------------------------------- |
| `siteURL`  | string | The URL Where your SaaS Brain is located. e.g. https://000000000000.foo.portal.vectra.ai |
| `clientID` | string | OAuth Client ID. Generated in Manage/API Clients.                                        |
| `secret`   | string | OAuth Secret. Generated in Manage/API Clients.                                           |

### Methods

#### (async) addAccountNote(accountID, note) → {Promise}

Add a note to a specific account.

##### Parameters:

| Name        | Type   | Description                |
| ----------- | ------ | -------------------------- |
| `accountID` | number | The ID of the account.     |
| `note`      | text   | The text body of the note. |

##### Returns:

Object containing details of the new note.

#### (async) addAccountTags(accountID, tags) → {Promise}

Add tags to an account.

##### Parameters:

| Name        | Type         | Description            |
| ----------- | ------------ | ---------------------- |
| `accountID` | number       | The ID of the account. |
| `tags`      | Array.<text> | Array of tags to add.  |

##### Returns:

Object containing details of the new tags.

#### (async) addDetectionNote(detectionID, note) → {Promise}

Add a note to a specific detection.

##### Parameters:

| Name          | Type   | Description                |
| ------------- | ------ | -------------------------- |
| `detectionID` | number | The ID of the detection.   |
| `note`        | text   | The text body of the note. |

##### Returns:

Object containing details of the new note.

#### (async) addDetectionTags(detectionID, tags) → {Promise}

Add tags to a detection.

##### Parameters:

| Name          | Type         | Description              |
| ------------- | ------------ | ------------------------ |
| `detectionID` | number       | The ID of the detection. |
| `tags`        | Array.<text> | Array of tags to add.    |

##### Returns:

Object containing details of the new tags.

#### (async) assignAccount(accountID, userID) → {Promise}

Assign an account to a specific user.

##### Parameters:

| Name        | Type   | Description                                     |
| ----------- | ------ | ----------------------------------------------- |
| `accountID` | number | ID of the account to be assigned.               |
| `userID`    | number | ID of the user the account will be assigned to. |

##### Returns:

Object containing details of the assignment.

#### (async) clearAccountTags(accountID) → {Promise}

Clear all tags from a specific account.

##### Parameters:

| Name        | Type   | Description            |
| ----------- | ------ | ---------------------- |
| `accountID` | number | The ID of the account. |

##### Returns:

Object containing details of the cleared tags.

#### (async) clearDetectionTags(detectionID) → {Promise}

Clear all tags from a specific detection.

##### Parameters:

| Name          | Type   | Description              |
| ------------- | ------ | ------------------------ |
| `detectionID` | number | The ID of the detection. |

##### Returns:

Object containing details of the cleared tags.

#### (async) createTriageRule(rule) → {Promise}

Create a triage rule.

##### Parameters:

| Name   | Type   | Description                                     |
| ------ | ------ | ----------------------------------------------- |
| `rule` | object | JSON object containing the triage rule details. |

##### Returns:

Object containing details of the new triage rule.

#### (async) deleteAccountNote(accountID, noteID) → {Promise}

Delete a specific note for an account.

##### Parameters:

| Name        | Type   | Description            |
| ----------- | ------ | ---------------------- |
| `accountID` | number | The ID of the account. |
| `noteID`    | number | The ID of the note.    |

##### Returns:

Object containing details of the deleted note.

#### (async) deleteAccountTag(accountID, tag) → {Promise}

Delete a tag from a specific account.

##### Parameters:

| Name        | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `accountID` | number | The ID of the account.          |
| `tag`       | text   | Value of the tag to be deleted. |

##### Returns:

Object containing details of the deleted tag.

#### (async) deleteDetectionNote(detectionID, noteID) → {Promise}

Delete a specific note for a detection.

##### Parameters:

| Name          | Type   | Description              |
| ------------- | ------ | ------------------------ |
| `detectionID` | number | The ID of the detection. |
| `noteID`      | number | The ID of the note.      |

##### Returns:

Object containing details of the deleted note.

#### (async) deleteDetectionTag(detectionID, tag) → {Promise}

Delete a tag from a specific detection.

##### Parameters:

| Name          | Type   | Description                     |
| ------------- | ------ | ------------------------------- |
| `detectionID` | number | The ID of the detection.        |
| `tag`         | text   | Value of the tag to be deleted. |

##### Returns:

Object containing details of the deleted tag.

#### (async) deleteTriageRule(ruleID) → {Promise}

Delete an existing triage rule.

##### Parameters:

| Name     | Type   | Description                   |
| -------- | ------ | ----------------------------- |
| `ruleID` | number | ID of the rule to be deleted. |

##### Returns:

Object containing details of the deleted triage rule.

#### (async) filterDetection(detectionIDs, value) → {Promise}

Filter detections with a specific value.

##### Parameters:

| Name           | Type           | Description                                   |
| -------------- | -------------- | --------------------------------------------- |
| `detectionIDs` | Array.<number> | Array of detection IDs to be marked as fixed. |
| `value`        | text           | Value of the new detection subject.           |

##### Returns:

Object containing details of filtered detections.

#### (async) getAccount(accountID) → {Promise}

Return a specific account based on the ID

##### Parameters:

| Name        | Type   | Description        |
| ----------- | ------ | ------------------ |
| `accountID` | number | ID of the account. |

##### Returns:

Object containing all the data on the account.

#### (async) getAccountChanges(checkpoint?) → {Promise}

Get account changes from a specific checkpoint

##### Parameters:

| Name         | Type   | Attributes | Default | Description                                             |
| ------------ | ------ | ---------- | ------- | ------------------------------------------------------- |
| `checkpoint` | number | optional   | 0       | Starting point to retrieve changes from (0 by default). |

##### Returns:

Array containing all account changes since the provided checkpoint.

#### (async) getAccountNote(accountID, noteID) → {Promise}

Return a specific note for an account.

##### Parameters:

| Name        | Type   | Description            |
| ----------- | ------ | ---------------------- |
| `accountID` | number | The ID of the account. |
| `noteID`    | number | The ID of the note.    |

##### Returns:

Object containing details of the note.

#### (async) getAccountNotes(accountID) → {Promise}

Return the notes for a specific account.

##### Parameters:

| Name        | Type   | Description            |
| ----------- | ------ | ---------------------- |
| `accountID` | number | The ID of the account. |

##### Returns:

Array of objects containing details of the notes.

#### (async) getAccountTags(accountID) → {Promise}

Get tags for a specific account.

##### Parameters:

| Name        | Type   | Description            |
| ----------- | ------ | ---------------------- |
| `accountID` | number | The ID of the account. |

##### Returns:

Array of tags in text form.

#### (async) getAllAccounts(options) → {Promise}

Return all accounts

##### Parameters:

| Name      | Type   | Description     |
| --------- | ------ | --------------- |
| `options` | object | Search options. |

##### Returns:

Array containing all account objects.

#### (async) getAllDetections(options) → {Promise}

Return all detections

##### Parameters:

| Name      | Type   | Description     |
| --------- | ------ | --------------- |
| `options` | object | Search options. |

##### Returns:

Array containing all detection objects.

#### (async) getAssignment(assignmentID) → {Promise}

Get a specific account Assignment.

##### Parameters:

| Name           | Type   | Description                           |
| -------------- | ------ | ------------------------------------- |
| `assignmentID` | number | ID of the assignment to be retrieved. |

##### Returns:

Object containing details of an assignment.

#### (async) getAssignments() → {Promise}

Get all account Assignments.

##### Returns:

Array of objects containing details of assignments.

#### (async) getDetection(detectionID) → {Promise}

Return a specific detection based on the ID

##### Parameters:

| Name          | Type   | Description          |
| ------------- | ------ | -------------------- |
| `detectionID` | number | ID of the detection. |

##### Returns:

Object containing all the data on the detection.

#### (async) getDetectionChanges(checkpoint?) → {Promise}

Get detection changes from a specific checkpoint

##### Parameters:

| Name         | Type   | Attributes | Default | Description                                             |
| ------------ | ------ | ---------- | ------- | ------------------------------------------------------- |
| `checkpoint` | number | optional   | 0       | Starting point to retrieve changes from (0 by default). |

##### Returns:

Array containing all account changes since the provided checkpoint.

#### (async) getDetectionNote(detectionID, noteID) → {Promise}

Return a specific note for a detection.

##### Parameters:

| Name          | Type   | Description              |
| ------------- | ------ | ------------------------ |
| `detectionID` | number | The ID of the detection. |
| `noteID`      | number | The ID of the note.      |

##### Returns:

Object containing details of the note.

#### (async) getDetectionNotes(detectionID) → {Promise}

Return the notes for a specific detection.

##### Parameters:

| Name          | Type   | Description              |
| ------------- | ------ | ------------------------ |
| `detectionID` | number | The ID of the detection. |

##### Returns:

Array of objects containing details of the notes.

#### (async) getDetectionTags(detectionID) → {Promise}

Get tags for a specific detection.

##### Parameters:

| Name          | Type   | Description              |
| ------------- | ------ | ------------------------ |
| `detectionID` | number | The ID of the detection. |

##### Returns:

Array of tags in text form.

#### (async) getTriageRule(ruleID) → {Promise}

Get a single triage rule by ID.

##### Parameters:

| Name     | Type   | Description            |
| -------- | ------ | ---------------------- |
| `ruleID` | number | The ID of the account. |

##### Returns:

Object containing details of the triage rule.

#### (async) getTriageRules() → {Promise}

Return all triage rules on the brain.

##### Returns:

Array of objects containing details of the triage rules.

#### (async) getUsers() → {Promise}

Get a list of all user accounts in the system.

##### Returns:

Array of objects containing details of all user accounts.

#### (async) getUsers(userID) → {Promise}

Get a list of all user accounts in the system.

##### Parameters:

| Name     | Type   | Description                             |
| -------- | ------ | --------------------------------------- |
| `userID` | number | ID of the user account to be retrieved. |

##### Returns:

Array of objects containing details of all user accounts.

#### (async) getUsers(userID) → {Promise}

Get a list of all user accounts in the system.

##### Parameters:

| Name     | Type   | Description                             |
| -------- | ------ | --------------------------------------- |
| `userID` | number | ID of the user account to be retrieved. |

##### Returns:

Array of objects containing details of all user accounts.

#### (async) markAsFixed(detectionIDs) → {Promise}

Mark specific detections as fixed.

##### Parameters:

| Name           | Type           | Description                                   |
| -------------- | -------------- | --------------------------------------------- |
| `detectionIDs` | Array.<number> | Array of detection IDs to be marked as fixed. |

##### Returns:

Object containing details of fixed detections.

#### (async) modifyAssignment(assignmentID, accountID, userID) → {Promise}

Modify or reassign an existing assignment.

##### Parameters:

| Name           | Type   | Description                                     |
| -------------- | ------ | ----------------------------------------------- |
| `assignmentID` | number | ID of the assignment to be modified.            |
| `accountID`    | number | ID of the account to be assigned.               |
| `userID`       | number | ID of the user the account will be assigned to. |

##### Returns:

Object containing details of the modified assignment.

#### (async) modifyAssignment(assignmentID) → {Promise}

Delete an existing assignment.

##### Parameters:

| Name           | Type   | Description                         |
| -------------- | ------ | ----------------------------------- |
| `assignmentID` | number | ID of the assignment to be deleted. |

##### Returns:

Object containing details of the deleted assignment.

#### (async) updateAccountNote(accountID, noteID, note) → {Promise}

Updated a specific note for an account.

##### Parameters:

| Name        | Type   | Description                            |
| ----------- | ------ | -------------------------------------- |
| `accountID` | number | The ID of the account.                 |
| `noteID`    | number | The ID of the note.                    |
| `note`      | text   | The text body to update the note with. |

##### Returns:

Object containing details of the new note.

#### (async) updateDetectionNote(detectionID, noteID, note) → {Promise}

Updated a specific note for a detection.

##### Parameters:

| Name          | Type   | Description                            |
| ------------- | ------ | -------------------------------------- |
| `detectionID` | number | The ID of the detection.               |
| `noteID`      | number | The ID of the note.                    |
| `note`        | text   | The text body to update the note with. |

##### Returns:

Object containing details of the new note.

#### (async) updateTriageRule(ruleID, rule) → {Promise}

Update an existing triage rule.

##### Parameters:

| Name     | Type   | Description                                         |
| -------- | ------ | --------------------------------------------------- |
| `ruleID` | number | ID of the rule to be updated.                       |
| `rule`   | object | JSON object containing the new triage rule details. |

##### Returns:

Object containing details of the updated triage rule.
