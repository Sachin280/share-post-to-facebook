// Installation ID management for unique user identification
// Uses Chrome sync storage to persist across uninstall/reinstall on same profile
export class InstallationIdManager {
  static async getUniqueInstallationId() {
    return new Promise((resolve) => {
      // First check sync storage (persists across uninstalls)
      chrome.storage.sync.get(['profileAuthCode'], (syncResult) => {
        if (syncResult.profileAuthCode) {
          console.log('Found existing profile auth code:', syncResult.profileAuthCode);
          // Also store in local for quick access
          chrome.storage.local.set({ uniqueInstallationId: syncResult.profileAuthCode }, () => {
            resolve(syncResult.profileAuthCode);
          });
          return;
        }

        // If no sync storage, check local storage for migration
        chrome.storage.local.get(['uniqueInstallationId'], (localResult) => {
          if (localResult.uniqueInstallationId) {
            console.log('Migrating local auth code to profile storage:', localResult.uniqueInstallationId);
            // Migrate existing local ID to sync storage
            chrome.storage.sync.set({ profileAuthCode: localResult.uniqueInstallationId }, () => {
              resolve(localResult.uniqueInstallationId);
            });
            return;
          }

          // No existing ID found, generate new one
          const uniqueId = this.generateUniqueId();
          console.log('Generated new profile auth code:', uniqueId);
          
          // Store in both sync (persistent) and local (quick access)
          chrome.storage.sync.set({ profileAuthCode: uniqueId }, () => {
            chrome.storage.local.set({ uniqueInstallationId: uniqueId }, () => {
              resolve(uniqueId);
            });
          });
        });
      });
    });
  }

  static generateUniqueId() {
    // Generate a unique ID using timestamp + random string
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `shareunlimited_${timestamp}_${randomPart}`;
  }

  static async resetInstallationId() {
    // For debugging or reset purposes - WARNING: This will create a new trial!
    const newId = this.generateUniqueId();
    return new Promise((resolve) => {
      chrome.storage.sync.set({ profileAuthCode: newId }, () => {
        chrome.storage.local.set({ uniqueInstallationId: newId }, () => {
          console.log('Reset profile auth code to:', newId);
          resolve(newId);
        });
      });
    });
  }

  static async getProfilePersistentAuthCode() {
    // Direct method to get the profile-persistent auth code
    return new Promise((resolve) => {
      chrome.storage.sync.get(['profileAuthCode'], (result) => {
        resolve(result.profileAuthCode || null);
      });
    });
  }

  static async hasExistingProfileAuth() {
    // Check if user has ever registered on this Chrome profile
    const existingAuth = await this.getProfilePersistentAuthCode();
    return !!existingAuth;
  }
}
