const axios = require("axios");
/**
 * Creates a new SaaS Client Object.
 */
module.exports = class SaasClient {
  #tokenRefresh = 0;

  #siteURL = null;
  #clientID = null;
  #secret = null;
  #sleepTime = 500;
  #token = null;

  /**
   * @param {string} siteURL - The URL Where your SaaS Brain is located. e.g. https://000000000000.foo.portal.vectra.ai
   * @param {string} clientID - OAuth Client ID. Generated in Manage/API Clients.
   * @param {string} secret - OAuth Secret. Generated in Manage/API Clients.
   */
  constructor(siteURL, clientID, secret) {
    this.#siteURL = siteURL;
    this.#clientID = clientID;
    this.#secret = secret;
  }

  //Sleep for a period of time
  async #sleep(timeout) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, timeout);
    });
  }

  //Get token from OAuth2
  async #getToken() {
    const token = Buffer.from(
      `${this.#clientID}:${this.#secret}`,
      "utf8"
    ).toString("base64");
    let data = await axios({
      url: `${this.#siteURL}/oauth2/token`,
      method: "POST",
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "grant_type=client_credentials",
    });
    //Set time that token expires
    this.#tokenRefresh = Math.floor(Date.now() / 1000) + data.data.expires_in;
    return data.data.access_token;
  }

  //Check that a token exists and is still valid.
  async #checkToken() {
    if (!this.#token || this.#tokenRefresh < Math.floor(Date.now() / 1000)) {
      this.#token = await this.#getToken();
    }
    await this.#sleep(this.#sleepTime);
    return true;
  }

  //Get data from API
  async #get(url, full = false) {
    await this.#checkToken();
    let query = await axios({
      url: `${this.#siteURL}/api/v3${url}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.#token}`,
      },
    });
    return query.data;
  }

  //Post data to API
  async #post(url, body) {
    await this.#checkToken();

    console.log(this.#token);
    let data = await axios({
      url: `${this.#siteURL}/api/v3${url}`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.#token}`,
      },
      data: body,
    });
    return data.data;
  }

  //Patch data to API
  async #patch(url, body) {
    await this.#checkToken();
    let data = await axios({
      url: `${this.#siteURL}/api/v3${url}`,
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.#token}`,
      },
      data: body,
    });
    return data.data;
  }

  //Post data to API
  async #put(url, body) {
    await this.#checkToken();

    console.log(this.#token);
    let data = await axios({
      url: `${this.#siteURL}/api/v3${url}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.#token}`,
      },
      data: body,
    });
    return data.data;
  }

  //Delete data from API
  async #delete(url) {
    await this.#checkToken();
    let data = await axios({
      url: `${this.#siteURL}/api/v3${url}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.#token}`,
      },
    });
    return data.data;
  }

  /**
   * Get account changes from a specific checkpoint
   * @param {number} [checkpoint] - Starting point to retrieve changes from (0 by default).
   * @returns {Promise} Array containing all account changes since the provided checkpoint.
   */
  async getAccountChanges(checkpoint = 0) {
    let results = [];
    let data = {
      remaining_count: 1,
      next_checkpoint: checkpoint,
    };
    while (data.remaining_count > 0) {
      data = await this.#get(
        `/events/account_scoring?limit=1000&since=${data.next_checkpoint}`
      );
      results = results.concat(data.events);
    }
    return results;
  }

  /**
   * Get detection changes from a specific checkpoint
   * @param {number} [checkpoint] - Starting point to retrieve changes from (0 by default).
   * @returns {Promise} Array containing all account changes since the provided checkpoint.
   */
  async getDetectionChanges(checkpoint = 0) {
    let results = [];
    let data = {
      remaining_count: 1,
      next_checkpoint: checkpoint,
    };
    while (data.remaining_count > 0) {
      data = await this.#get(
        `/events/account_detection?limit=1000&since=${data.next_checkpoint}`
      );
      results = results.concat(data.events);
    }
    return results;
  }

  /**
   * Return a specific detection based on the ID
   * @param {number} detectionID - ID of the detection.
   * @returns {Promise} Object containing all the data on the detection.
   */
  async getDetection(detectionID) {
    return await this.#get(`/detections/${detectionID}`);
  }

  /**
   * Return all detections
   * @param {object} options - Search options.
   * @returns {Promise} Array containing all detection objects.
   */
  async getAllDetections(options) {
    let extra = "";
    //Add options into URL string
    for (let option of Object.keys(options)) {
      extra += `&${option}=${options[option]}`;
    }

    let results = [];
    let data = {
      next: `/detections?page=1${extra}`,
    };
    while (data.next) {
      data = await this.#get(data.next.replace(/.*vectra.ai/, ""), true);
      results = results.concat(data.results);
    }
    return results;
  }

  /**
   * Return the notes for a specific detection.
   * @param {number} detectionID - The ID of the detection.
   * @returns {Promise} Array of objects containing details of the notes.
   */
  async getDetectionNotes(detectionID) {
    return await this.#get(`/detections/${detectionID}/notes`);
  }

  /**
   * Return a specific note for a detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {number} noteID - The ID of the note.
   * @returns {Promise} Object containing details of the note.
   */
  async getDetectionNote(detectionID, noteID) {
    return await this.#get(`/detections/${detectionID}/notes/${noteID}`);
  }

  /**
   * Add a note to a specific detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {text} note - The text body of the note.
   * @returns {Promise} Object containing details of the new note.
   */
  async addDetectionNote(id, note) {
    return await this.#post(`/detections/${id}/notes`, { note: note });
  }

  /**
   * Updated a specific note for a detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {number} noteID - The ID of the note.
   * @param {text} note - The text body to update the note with.
   * @returns {Promise} Object containing details of the new note.
   */
  async updateDetectionNote(detectionID, noteID, note) {
    return await this.#patch(`/detections/${detectionID}/notes/${noteID}`, {
      note: note,
    });
  }

  /**
   * Delete a specific note for a detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {number} noteID - The ID of the note.
   * @returns {Promise} Object containing details of the deleted note.
   */
  async deleteDetectionNote(detectionID, noteID) {
    return await this.#delete(`/detections/${detectionID}/notes/${noteID}`);
  }

  /**
   * Get tags for a specific detection.
   * @param {number} detectionID - The ID of the detection.
   * @returns {Promise} Array of tags in text form.
   */
  async getDetectionTags(detectionID) {
    let data = await this.#get(`/tagging/detection/${detectionID}`);
    return data.tags;
  }

  /**
   * Add tags to a detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {text[]} tags - Array of tags to add.
   * @returns {Promise} Object containing details of the new tags.
   */
  async addDetectionTags(detectionID, tags) {
    let existingTags = await this.getDetectionTags(detectionID);
    tags = tags.concat(existingTags.tags);
    return await this.#patch(`/tagging/detection/${detectionID}`, {
      tags: tags,
    });
  }

  /**
   * Delete a tag from a specific detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {text} tag - Value of the tag to be deleted.
   * @returns {Promise} Object containing details of the deleted tag.
   */
  async deleteDetectionTag(detectionID, tag) {
    let existingTags = await this.getDetectionTags(detectionID);
    for (let i = existingTags.tags.length - 1; i >= 0; i--) {
      if (existingTags.tags[i] == tag) {
        existingTags.tags.splice(i, 1);
      }
    }
    return await this.#patch(`/tagging/detection/${detectionID}`, {
      tags: existingTags.tags,
    });
  }

  /**
   * Clear all tags from a specific detection.
   * @param {number} detectionID - The ID of the detection.
   * @returns {Promise} Object containing details of the cleared tags.
   */
  async clearDetectionTags(detectionID) {
    return await this.#patch(`/tagging/detection/${detectionID}`, {
      tags: [],
    });
  }

  /**
   * Mark specific detections as fixed.
   * @param {number[]} detectionIDs - Array of detection IDs to be marked as fixed.
   * @returns {Promise} Object containing details of fixed detections.
   */
  async markAsFixed(detectionIDs) {
    return await this.#patch(`/detections`, {
      detectionIdList: detectionIDs,
      mark_as_fixed: true,
    });
  }

  /**
   * Return a specific account based on the ID
   * @param {number} accountID - ID of the account.
   * @returns {Promise} Object containing all the data on the account.
   */
  async getAccount(accountID) {
    return await this.#get(`/accounts/${accountID}`);
  }

  /**
   * Return all accounts
   * @param {object} options - Search options.
   * @returns {Promise} Array containing all account objects.
   */
  async getAllAccounts(options) {
    let extra = "";
    //Add options into URL string
    for (let option of Object.keys(options)) {
      extra += `&${option}=${options[option]}`;
    }
    let results = [];
    let data = {
      next: `/accounts?page=1${extra}`,
    };
    while (data.next) {
      data = await this.#get(data.next.replace(/.*vectra.ai/, ""), true);
      results = results.concat(data.results);
    }
    return results;
  }

  /**
   * Add a note to a specific account.
   * @param {number} accountID - The ID of the account.
   * @param {text} note - The text body of the note.
   * @returns {Promise} Object containing details of the new note.
   */
  async addAccountNote(accountID, note) {
    return await this.#post(`/accounts/${accountID}/notes`, { note: note });
  }

  /**
   * Return the notes for a specific account.
   * @param {number} accountID - The ID of the account.
   * @returns {Promise} Array of objects containing details of the notes.
   */
  async getAccountNotes(accountID) {
    return await this.#get(`/accounts/${accountID}/notes`);
  }

  /**
   * Return a specific note for an account.
   * @param {number} accountID - The ID of the account.
   * @param {number} noteID - The ID of the note.
   * @returns {Promise} Object containing details of the note.
   */
  async getAccountNote(accountID, noteID) {
    return await this.#get(`/accounts/${accountID}/notes/${noteID}`);
  }

  /**
   * Updated a specific note for an account.
   * @param {number} accountID - The ID of the account.
   * @param {number} noteID - The ID of the note.
   * @param {text} note - The text body to update the note with.
   * @returns {Promise} Object containing details of the new note.
   */
  async updateAccountNote(accountID, noteID, note) {
    return await this.#patch(`/accounts/${accountID}/notes/${noteID}`, {
      note: note,
    });
  }

  /**
   * Delete a specific note for an account.
   * @param {number} accountID - The ID of the account.
   * @param {number} noteID - The ID of the note.
   * @returns {Promise} Object containing details of the deleted note.
   */
  async deleteAccountNote(accountID, noteID) {
    return await this.#delete(`/accounts/${accountID}/notes/${noteID}`);
  }

  /**
   * Get tags for a specific account.
   * @param {number} accountID - The ID of the account.
   * @returns {Promise} Array of tags in text form.
   */
  async getAccountTags(accountID) {
    let data = await this.#get(`/tagging/account/${accountID}`);
    return data.tags;
  }

  /**
   * Add tags to an account.
   * @param {number} accountID - The ID of the account.
   * @param {text[]} tags - Array of tags to add.
   * @returns {Promise} Object containing details of the new tags.
   */
  async addAccountTags(accountID, tags) {
    let existingTags = await this.getAccountTags(accountID);
    tags = tags.concat(existingTags);
    return await this.#patch(`/tagging/account/${accountID}`, {
      tags: tags,
    });
  }

  /**
   * Delete a tag from a specific account.
   * @param {number} accountID - The ID of the account.
   * @param {text} tag - Value of the tag to be deleted.
   * @returns {Promise} Object containing details of the deleted tag.
   */
  async deleteAccountTag(accountID, tag) {
    let existingTags = await this.getAccountTags(accountID);
    for (let i = existingTags.tags.length - 1; i >= 0; i--) {
      if (existingTags.tags[i] == tag) {
        existingTags.tags.splice(i, 1);
      }
    }
    return await this.#patch(`/tagging/account/${accountID}`, {
      tags: existingTags.tags,
    });
  }

  /**
   * Clear all tags from a specific account.
   * @param {number} accountID - The ID of the account.
   * @returns {Promise} Object containing details of the cleared tags.
   */
  async clearAccountTags(accountID) {
    return await this.#patch(`/tagging/account/${accountID}`, {
      tags: [],
    });
  }

  /**
   * Return all triage rules on the brain.
   * @returns {Promise} Array of objects containing details of the triage rules.
   */
  async getTriageRules() {
    return await this.#get(`/rules`);
  }

  /**
   * Get a single triage rule by ID.
   * @param {number} ruleID - The ID of the account.
   * @returns {Promise} Object containing details of the triage rule.
   */
  async getTriageRule(ruleID) {
    return await this.#get(`/rules/${ruleID}`);
  }

  /**
   * Create a triage rule.
   * @param {object} rule - JSON object containing the triage rule details.
   * @returns {Promise} Object containing details of the new triage rule.
   */
  async createTriageRule(rule) {
    return await this.#post("/rules", rule);
  }

  /**
   * Update an existing triage rule.
   * @param {number} ruleID - ID of the rule to be updated.
   * @param {object} rule - JSON object containing the new triage rule details.
   * @returns {Promise} Object containing details of the updated triage rule.
   */
  async updateTriageRule(ruleID, rule) {
    return await this.#put("/rules", ruleID, rule);
  }

  /**
   * Delete an existing triage rule.
   * @param {number} ruleID - ID of the rule to be deleted.
   * @returns {Promise} Object containing details of the deleted triage rule.
   */
  async deleteTriageRule(ruleID) {
    return await this.#delete(`/rules${ruleID}`);
  }
};
