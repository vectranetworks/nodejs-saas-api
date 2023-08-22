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
  #version = null;

  /**
   * @param {string} siteURL - The URL Where your SaaS Brain is located. e.g. https://000000000000.foo.portal.vectra.ai
   * @param {string} clientID - OAuth Client ID. Generated in Manage/API Clients.
   * @param {string} secret - OAuth Secret. Generated in Manage/API Clients.
   * @param {number} version - API Version. Defaults to 3.
   */
  constructor(siteURL, clientID, secret, version = 3) {
    this.#siteURL = siteURL;
    this.#clientID = clientID;
    this.#secret = secret;
    this.#version = `v${version}`;
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
    try {
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
      this.#tokenRefresh =
        Math.floor(Date.now() / 1000) + data.data.expires_in - 100;
      return data.data.access_token;
    } catch (err) {
      throw err;
    }
  }

  //Check that a token exists and is still valid.
  async #checkToken() {
    try {
      if (!this.#token || this.#tokenRefresh < Math.floor(Date.now() / 1000)) {
        this.#token = await this.#getToken();
      }
      await this.#sleep(this.#sleepTime);
      return true;
    } catch (err) {
      throw err;
    }
  }

  //Get data from API
  async #get(url) {
    try {
      await this.#checkToken();
      let query = await axios({
        url: `${this.#siteURL}/api/${this.#version}${url}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.#token}`,
        },
      });
      return query.data;
    } catch (err) {
      if (err.response) {
        throw {
          status: err.response.status,
          statusText: err.response.statusText,
          url: err.response.config.url,
        };
      } else {
        throw err;
      }
    }
  }

  //Post data to API
  async #post(url, body) {
    try {
      await this.#checkToken();
      let data = await axios({
        url: `${this.#siteURL}/api/${this.#version}${url}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.#token}`,
        },
        data: body,
      });
      return data.data;
    } catch (err) {
      if (err.response) {
        throw {
          status: err.response.status,
          statusText: err.response.statusText,
          url: err.response.config.url,
        };
      } else {
        throw err;
      }
    }
  }

  //Patch data to API
  async #patch(url, body) {
    try {
      await this.#checkToken();
      let data = await axios({
        url: `${this.#siteURL}/api/${this.#version}${url}`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.#token}`,
        },
        data: body,
      });
      return data.data;
    } catch (err) {
      throw err;
    }
  }

  //Post data to API
  async #put(url, body) {
    try {
      await this.#checkToken();
      let data = await axios({
        url: `${this.#siteURL}/api/${this.#version}${url}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.#token}`,
        },
        data: body,
      });
      return data.data;
    } catch (err) {
      if (err.response) {
        throw {
          status: err.response.status,
          statusText: err.response.statusText,
          url: err.response.config.url,
        };
      } else {
        throw err;
      }
    }
  }

  //Delete data from API
  async #delete(url, body) {
    try {
      await this.#checkToken();
      let data = await axios({
        url: `${this.#siteURL}/api/${this.#version}${url}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.#token}`,
        },
        data: body,
      });
      return data.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get account changes from a specific checkpoint
   * @param {number} [checkpoint] - Starting point to retrieve changes from (0 by default).
   * @returns {Promise} Array containing all account changes since the provided checkpoint.
   */
  async getAccountChanges(checkpoint = 0) {
    try {
      let results = [];
      let data = {
        remaining_count: 1,
        next_checkpoint: checkpoint,
      };
      while (data.remaining_count > 0) {
        data = await this.#get(
          `/events/account_scoring?limit=1000&from=${data.next_checkpoint}`
        );
        results = results.concat(data.events);
      }
      return results;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Retrieve the last checkpoint for Account changes
   * @returns {Promise} Number showing the latest Account change checkpoint in the system.
   */
  async getLatestAccountCheckpoint() {
    try {
      let data = await this.#get(
        `/events/account_scoring?limit=1000&from=999999999999`
      );
      data = await this.#get(
        `/events/account_scoring?limit=1000&from=${data.next_checkpoint}`
      );
      return data.next_checkpoint;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Retrieve the last checkpoint for Detection changes
   * @returns {Promise} Number showing the latest Detection change checkpoint in the system.
   */
  async getLatestDetectionCheckpoint() {
    try {
      let data = await this.#get(
        `/events/account_detection?limit=1000&from=999999999999`
      );
      data = await this.#get(
        `/events/account_detection?limit=1000&from=${data.next_checkpoint}`
      );
      return data.next_checkpoint;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get detection changes from a specific checkpoint
   * @param {number} [checkpoint] - Starting point to retrieve changes from (0 by default).
   * @returns {Promise} Array containing all account changes since the provided checkpoint.
   */
  async getDetectionChanges(checkpoint = 0) {
    try {
      let results = [];
      let data = {
        remaining_count: 1,
        next_checkpoint: checkpoint,
      };
      while (data.remaining_count > 0) {
        data = await this.#get(
          `/events/account_detection?limit=1000&from=${data.next_checkpoint}`
        );
        results = results.concat(data.events);
      }
      return results;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return a specific detection based on the ID
   * @param {number} detectionID - ID of the detection.
   * @returns {Promise} Object containing all the data on the detection.
   */
  async getDetection(detectionID) {
    try {
      return await this.#get(`/detections/${detectionID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return detections based on an array of detection IDs
   * @param {number[]} detectionID - IDs of the detections.
   * @returns {Promise} Object containing all the data on the detection.
   */
  async getDetections(detectionIDs) {
    try {
      let results = [];
      let data = {
        next: `/detections/?id=${detectionIDs.join(",")}`,
      };

      while (data.next) {
        data = await this.#get(
          data.next.replace(/.*vectra.ai\/api\/v3[^\/]*/, ""),
          true
        );
        results = results.concat(data.results);
      }
      return results;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return all detections
   * @param {object} options - Search options.
   * @returns {Promise} Array containing all detection objects.
   */
  async getAllDetections(options) {
    try {
      let extra = "";
      //Add options into URL string
      if (options) {
        for (let option of Object.keys(options)) {
          extra += `&${option}=${options[option]}`;
        }
      }
      let results = [];
      let data = {
        next: `/detections?page=1${extra}`,
      };
      while (data.next) {
        data = await this.#get(
          data.next.replace(/.*vectra.ai\/api\/v3[^\/]*/, ""),
          true
        );
        results = results.concat(data.results);
      }
      return results;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return the notes for a specific detection.
   * @param {number} detectionID - The ID of the detection.
   * @returns {Promise} Array of objects containing details of the notes.
   */
  async getDetectionNotes(detectionID) {
    try {
      return await this.#get(`/detections/${detectionID}/notes`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return a specific note for a detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {number} noteID - The ID of the note.
   * @returns {Promise} Object containing details of the note.
   */
  async getDetectionNote(detectionID, noteID) {
    try {
      return await this.#get(`/detections/${detectionID}/notes/${noteID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Add a note to a specific detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {text} note - The text body of the note.
   * @returns {Promise} Object containing details of the new note.
   */
  async addDetectionNote(id, note) {
    try {
      return await this.#post(`/detections/${id}/notes`, { note: note });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Updated a specific note for a detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {number} noteID - The ID of the note.
   * @param {text} note - The text body to update the note with.
   * @returns {Promise} Object containing details of the new note.
   */
  async updateDetectionNote(detectionID, noteID, note) {
    try {
      return await this.#patch(`/detections/${detectionID}/notes/${noteID}`, {
        note: note,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete a specific note for a detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {number} noteID - The ID of the note.
   * @returns {Promise} Object containing details of the deleted note.
   */
  async deleteDetectionNote(detectionID, noteID) {
    try {
      return await this.#delete(`/detections/${detectionID}/notes/${noteID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get tags for a specific detection.
   * @param {number} detectionID - The ID of the detection.
   * @returns {Promise} Array of tags in text form.
   */
  async getDetectionTags(detectionID) {
    try {
      let data = await this.#get(`/tagging/detection/${detectionID}`);
      return data.tags;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Add tags to a detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {text[]} tags - Array of tags to add.
   * @returns {Promise} Object containing details of the new tags.
   */
  async addDetectionTags(detectionID, tags) {
    try {
      let existingTags = await this.getDetectionTags(detectionID);
      tags = tags.concat(existingTags);
      return await this.#patch(`/tagging/detection/${detectionID}`, {
        tags: tags,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete a tag from a specific detection.
   * @param {number} detectionID - The ID of the detection.
   * @param {text} tag - Value of the tag to be deleted.
   * @returns {Promise} Object containing details of the deleted tag.
   */
  async deleteDetectionTag(detectionID, tag) {
    try {
      let existingTags = await this.getDetectionTags(detectionID);
      for (let i = existingTags.length - 1; i >= 0; i--) {
        if (existingTags[i] == tag) {
          existingTags.splice(i, 1);
        }
      }
      return await this.#patch(`/tagging/detection/${detectionID}`, {
        tags: existingTags,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Clear all tags from a specific detection.
   * @param {number} detectionID - The ID of the detection.
   * @returns {Promise} Object containing details of the cleared tags.
   */
  async clearDetectionTags(detectionID) {
    try {
      return await this.#patch(`/tagging/detection/${detectionID}`, {
        tags: [],
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Mark specific detections as fixed.
   * @param {number[]} detectionIDs - Array of detection IDs to be marked as fixed.
   * @returns {Promise} Object containing details of fixed detections.
   */
  async markAsFixed(detectionIDs) {
    try {
      return await this.#patch(`/detections`, {
        detectionIdList: detectionIDs,
        mark_as_fixed: "True",
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Unmark specific detections as fixed.
   * @param {number[]} detectionIDs - Array of detection IDs to be unmarked as fixed.
   * @returns {Promise} Object containing details of fixed detections.
   */
  async unmarkAsFixed(detectionIDs) {
    try {
      return await this.#patch(`/detections`, {
        detectionIdList: detectionIDs,
        mark_as_fixed: "False",
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Filter detections with a specific value.
   * @param {number[]} detectionIDs - Array of detection IDs to be marked as fixed.
   * @param {text} value - Value of the new detection subject
   * @returns {Promise} Object containing details of filtered detections.
   */
  async filterDetection(detectionIDs, value) {
    try {
      return await this.#post(`/rules`, {
        detectionIdList: detectionIDs,
        triage_category: value,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Unfilter detections with a specific value.
   * @param {number[]} detectionIDs - Array of detection IDs to be unmarked as fixed.
   * @returns {Promise} Object containing details of filtered detections.
   */
  async unfilterDetection(detectionIDs) {
    try {
      console.log(detectionIDs);
      return await this.#delete(`/rules`, {
        detectionIdList: detectionIDs,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return a specific account based on the ID
   * @param {number} accountID - ID of the account.
   * @returns {Promise} Object containing all the data on the account.
   */
  async getAccount(accountID) {
    try {
      return await this.#get(`/accounts/${accountID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return accounts based on an array of account IDs
   * @param {number[]} accountID - IDs of the accounts.
   * @returns {Promise} Object containing all the data on the account.
   */
  async getAccounts(accountIDs) {
    try {
      let results = [];
      let data = {
        next: `/accounts/?id=${accountIDs.join(",")}`,
      };

      while (data.next) {
        data = await this.#get(
          data.next.replace(/.*vectra.ai\/api\/v3[^\/]*/, ""),
          true
        );
        results = results.concat(data.results);
      }
      return results;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return all accounts
   * @param {object} options - Search options.
   * @returns {Promise} Array containing all account objects.
   */
  async getAllAccounts(options) {
    try {
      let extra = "";
      //Add options into URL string
      if (options) {
        for (let option of Object.keys(options)) {
          extra += `&${option}=${options[option]}`;
        }
      }
      let results = [];
      let data = {
        next: `/accounts?page=1${extra}`,
      };
      while (data.next) {
        data = await this.#get(
          data.next.replace(/.*vectra.ai\/api\/v3[^\/]*/, ""),
          true
        );
        results = results.concat(data.results);
      }
      return results;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Add a note to a specific account.
   * @param {number} accountID - The ID of the account.
   * @param {text} note - The text body of the note.
   * @returns {Promise} Object containing details of the new note.
   */
  async addAccountNote(accountID, note) {
    try {
      return await this.#post(`/accounts/${accountID}/notes`, { note: note });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return the notes for a specific account.
   * @param {number} accountID - The ID of the account.
   * @returns {Promise} Array of objects containing details of the notes.
   */
  async getAccountNotes(accountID) {
    try {
      return await this.#get(`/accounts/${accountID}/notes`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return a specific note for an account.
   * @param {number} accountID - The ID of the account.
   * @param {number} noteID - The ID of the note.
   * @returns {Promise} Object containing details of the note.
   */
  async getAccountNote(accountID, noteID) {
    try {
      return await this.#get(`/accounts/${accountID}/notes/${noteID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Updated a specific note for an account.
   * @param {number} accountID - The ID of the account.
   * @param {number} noteID - The ID of the note.
   * @param {text} note - The text body to update the note with.
   * @returns {Promise} Object containing details of the new note.
   */
  async updateAccountNote(accountID, noteID, note) {
    try {
      return await this.#patch(`/accounts/${accountID}/notes/${noteID}`, {
        note: note,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete a specific note for an account.
   * @param {number} accountID - The ID of the account.
   * @param {number} noteID - The ID of the note.
   * @returns {Promise} Object containing details of the deleted note.
   */
  async deleteAccountNote(accountID, noteID) {
    try {
      return await this.#delete(`/accounts/${accountID}/notes/${noteID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Add a note to a specific host.
   * @param {number} hostID - The ID of the host.
   * @param {text} note - The text body of the note.
   * @returns {Promise} Object containing details of the new note.
   */
  async addHostNote(hostID, note) {
    try {
      return await this.#post(`/hosts/${hostID}/notes`, { note: note });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return the notes for a specific host.
   * @param {number} hostID - The ID of the host.
   * @returns {Promise} Array of objects containing details of the notes.
   */
  async getHostNotes(hostID) {
    try {
      return await this.#get(`/hosts/${hostID}/notes`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return a specific note for a host.
   * @param {number} hostID - The ID of the host.
   * @param {number} noteID - The ID of the note.
   * @returns {Promise} Object containing details of the note.
   */
  async getHostNote(hostID, noteID) {
    try {
      return await this.#get(`/hosts/${hostID}/notes/${noteID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Updated a specific note for a host.
   * @param {number} hostID - The ID of the host.
   * @param {number} noteID - The ID of the note.
   * @param {text} note - The text body to update the note with.
   * @returns {Promise} Object containing details of the new note.
   */
  async updateHostNote(hostID, noteID, note) {
    try {
      return await this.#patch(`/hosts/${hostID}/notes/${noteID}`, {
        note: note,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete a specific note for a host.
   * @param {number} hostID - The ID of the host.
   * @param {number} noteID - The ID of the note.
   * @returns {Promise} Object containing details of the deleted note.
   */
  async deleteHostNote(hostID, noteID) {
    try {
      return await this.#delete(`/hosts/${hostID}/notes/${noteID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get tags for a specific account.
   * @param {number} accountID - The ID of the account.
   * @returns {Promise} Array of tags in text form.
   */
  async getAccountTags(accountID) {
    try {
      let data = await this.#get(`/tagging/account/${accountID}`);
      return data.tags;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Add tags to an account.
   * @param {number} accountID - The ID of the account.
   * @param {text[]} tags - Array of tags to add.
   * @returns {Promise} Object containing details of the new tags.
   */
  async addAccountTags(accountID, tags) {
    try {
      let existingTags = await this.getAccountTags(accountID);
      tags = tags.concat(existingTags);
      return await this.#patch(`/tagging/account/${accountID}`, {
        tags: tags,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete a tag from a specific account.
   * @param {number} accountID - The ID of the account.
   * @param {text} tag - Value of the tag to be deleted.
   * @returns {Promise} Object containing details of the deleted tag.
   */
  async deleteAccountTag(accountID, tag) {
    try {
      let existingTags = await this.getAccountTags(accountID);
      for (let i = existingTags.length - 1; i >= 0; i--) {
        if (existingTags[i] == tag) {
          existingTags.splice(i, 1);
        }
      }
      return await this.#patch(`/tagging/account/${accountID}`, {
        tags: existingTags,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Clear all tags from a specific account.
   * @param {number} accountID - The ID of the account.
   * @returns {Promise} Object containing details of the cleared tags.
   */
  async clearAccountTags(accountID) {
    try {
      return await this.#patch(`/tagging/account/${accountID}`, {
        tags: [],
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get tags for a specific host.
   * @param {number} hostID - The ID of the host.
   * @returns {Promise} Array of tags in text form.
   */
  async getHostTags(hostID) {
    try {
      let data = await this.#get(`/tagging/host/${hostID}`);
      return data.tags;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Add tags to a host.
   * @param {number} hostID - The ID of the host.
   * @param {text[]} tags - Array of tags to add.
   * @returns {Promise} Object containing details of the new tags.
   */
  async addHostTags(hostID, tags) {
    try {
      let existingTags = await this.getHostTags(hostID);
      tags = tags.concat(existingTags);
      return await this.#patch(`/tagging/host/${hostID}`, {
        tags: tags,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete a tag from a specific host.
   * @param {number} hostID - The ID of the host.
   * @param {text} tag - Value of the tag to be deleted.
   * @returns {Promise} Object containing details of the deleted tag.
   */
  async deleteHostTag(hostID, tag) {
    try {
      let existingTags = await this.getHostTags(hostID);
      for (let i = existingTags.length - 1; i >= 0; i--) {
        if (existingTags[i] == tag) {
          existingTags.splice(i, 1);
        }
      }
      return await this.#patch(`/tagging/host/${hostID}`, {
        tags: existingTags,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Clear all tags from a specific host.
   * @param {number} hostID - The ID of the host.
   * @returns {Promise} Object containing details of the cleared tags.
   */
  async clearHostTags(hostID) {
    try {
      return await this.#patch(`/tagging/host/${hostID}`, {
        tags: [],
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Return all triage rules on the brain.
   * @returns {Promise} Array of objects containing details of the triage rules.
   */
  async getTriageRules() {
    try {
      return await this.#get(`/rules`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get a single triage rule by ID.
   * @param {number} ruleID - The ID of the account.
   * @returns {Promise} Object containing details of the triage rule.
   */
  async getTriageRule(ruleID) {
    try {
      return await this.#get(`/rules/${ruleID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create a triage rule.
   * @param {object} rule - JSON object containing the triage rule details.
   * @returns {Promise} Object containing details of the new triage rule.
   */
  async createTriageRule(rule) {
    try {
      return await this.#post("/rules", rule);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update an existing triage rule.
   * @param {number} ruleID - ID of the rule to be updated.
   * @param {object} rule - JSON object containing the new triage rule details.
   * @returns {Promise} Object containing details of the updated triage rule.
   */
  async updateTriageRule(ruleID, rule) {
    try {
      return await this.#put("/rules", ruleID, rule);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete an existing triage rule.
   * @param {number} ruleID - ID of the rule to be deleted.
   * @returns {Promise} Object containing details of the deleted triage rule.
   */
  async deleteTriageRule(ruleID) {
    try {
      return await this.#delete(`/rules${ruleID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get all account Assignments.
   * @returns {Promise} Array of objects containing details of assignments.
   */
  async getAssignments() {
    try {
      let results = [];
      let data = {
        next: `/assignments`,
      };
      while (data.next) {
        data = await this.#get(
          data.next.replace(/.*vectra.ai\/api\/v3[^\/]*/, ""),
          true
        );
        results = results.concat(data.results);
      }
      return results;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get a specific account Assignment.
   * @param {number} assignmentID - ID of the assignment to be retrieved.
   * @returns {Promise} Object containing details of an assignment.
   */
  async getAssignment(assignmentID) {
    try {
      return await this.#get(`/assignments/${assignmentID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get a specific account Assignment.
   * @param {number} accountID - ID of the account to be retrieve assignments for.
   * @param {boolean} resolved - If true, return resolved assignments.
   * @returns {Promise} Object containing details of an assignment.
   */
  async getAccountAssignment(accountID, resolved = false) {
    try {
      return await this.#get(
        `/assignments?accounts=${accountID}&resolved=${resolved}`
      );
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get a specific host Assignment.
   * @param {number} hostID - ID of the host to be retrieve assignments for.
   * @param {boolean} resolved - If true, return resolved assignments.
   * @returns {Promise} Object containing details of an assignment.
   */
  async getHostAssignment(hostID, resolved = false) {
    try {
      return await this.#get(
        `/assignments?hosts=${hostID}&resolved=${resolved}`
      );
    } catch (err) {
      throw err;
    }
  }

  /**
   * Resolve an Assignment.
   * @param {number} assignmentID - ID of the assignment to be resolved.
   * @param {string} outcomeID - ID of the resolution outcome ("1" - Benign True Positive, "2" - Malicious True Positive, "3" - False Positive).
   * @returns {Promise} Object containing details of an assignment.
   */
  async resolveAssignment(assignmentID, outcomeID) {
    try {
      return await this.#put(`/assignments/${assignmentID}/resolve`, {
        outcome: outcomeID,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get a list of all user accounts in the system.
   * @returns {Promise} Array of objects containing details of all user accounts.
   */
  async getUsers() {
    try {
      let results = [];
      let data = {
        next: `/users`,
      };

      while (data.next) {
        data = await this.#get(
          data.next.replace(/.*vectra.ai\/api\/v3[^\/]*/, ""),
          true
        );
        results = results.concat(data.results);
      }

      return results;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get a specific user account in the system.
   * @returns {Promise} Object containing details of the requested user account.
   * @param {number} userID - ID of the user account to be retrieved.
   */
  async getUser(userID) {
    try {
      return await this.#get(`/users/${userID}`);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Assign an account to a specific user.
   * @param {number} accountID - ID of the account to be assigned.
   * @param {number} userID - ID of the user the account will be assigned to.
   * @returns {Promise} Object containing details of the assignment.
   */
  async assignAccount(accountID, userID) {
    try {
      return await this.#post(`/assignments`, {
        assign_account_id: accountID,
        assign_to_user_id: userID,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Assign a host to a specific user.
   * @param {number} hostID - ID of the host to be assigned.
   * @param {number} userID - ID of the user the host will be assigned to.
   * @returns {Promise} Object containing details of the assignment.
   */
  async assignHost(hostID, userID) {
    try {
      return await this.#post(`/assignments`, {
        assign_host_id: hostID,
        assign_to_user_id: userID,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Modify or reassign an existing assignment.
   * @param {number} assignmentID - ID of the assignment to be modified.
   * @param {number} accountID - ID of the account to be assigned.
   * @param {number} userID - ID of the user the account will be assigned to.
   * @returns {Promise} Object containing details of the modified assignment.
   */
  async modifyAssignment(assignmentID, accountID, userID) {
    try {
      return await this.#put(`/assignments/${assignmentID}`, {
        assign_account_id: accountID,
        assign_to_user_id: userID,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete an existing assignment.
   * @param {number} assignmentID - ID of the assignment to be deleted.
   * @returns {Promise} Object containing details of the deleted assignment.
   */
  async removeAssignment(assignmentID) {
    try {
      return await this.#delete(`/assignments/${assignmentID}`);
    } catch (err) {
      throw err;
    }
  }
};
