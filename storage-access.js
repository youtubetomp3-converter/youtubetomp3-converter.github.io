// Storage Access Detector
// This script checks if the site has access to various storage APIs
// and provides fallbacks when storage is blocked

(function() {
    // Object to track storage access status
    window.storageAccess = {
        localStorage: false,
        sessionStorage: false,
        indexedDB: false,
        cookies: false,
        cacheAPI: false
    };

    // Check localStorage access
    try {
        localStorage.setItem('storage_test', '1');
        localStorage.removeItem('storage_test');
        window.storageAccess.localStorage = true;
    } catch (e) {
        console.warn('localStorage access is blocked by browser privacy settings');
    }

    // Check sessionStorage access
    try {
        sessionStorage.setItem('storage_test', '1');
        sessionStorage.removeItem('storage_test');
        window.storageAccess.sessionStorage = true;
    } catch (e) {
        console.warn('sessionStorage access is blocked by browser privacy settings');
    }

    // Check cookies access
    try {
        document.cookie = "storage_test=1; path=/; max-age=60";
        window.storageAccess.cookies = document.cookie.indexOf('storage_test=1') !== -1;
        document.cookie = "storage_test=1; path=/; max-age=0"; // Delete the cookie
    } catch (e) {
        console.warn('Cookie access is blocked by browser privacy settings');
    }

    // Check IndexedDB access
    try {
        const request = indexedDB.open('storage_test', 1);
        request.onerror = function() {
            console.warn('IndexedDB access is blocked by browser privacy settings');
        };
        request.onsuccess = function() {
            window.storageAccess.indexedDB = true;
            request.result.close();
            indexedDB.deleteDatabase('storage_test');
        };
    } catch (e) {
        console.warn('IndexedDB access is blocked by browser privacy settings');
    }

    // Check Cache API access (used by Service Workers)
    if ('caches' in window) {
        caches.open('storage_test_cache')
            .then(cache => {
                window.storageAccess.cacheAPI = true;
                return caches.delete('storage_test_cache');
            })
            .catch(error => {
                console.warn('Cache API access is blocked by browser privacy settings');
            });
    }

    // Create a fallback for blocked storage
    window.getStorageAccess = function() {
        return window.storageAccess;
    };

    // Memory-based fallback storage
    window.memoryStorage = {
        _data: {},
        setItem: function(id, val) {
            return this._data[id] = String(val);
        },
        getItem: function(id) {
            return this._data.hasOwnProperty(id) ? this._data[id] : null;
        },
        removeItem: function(id) {
            return delete this._data[id];
        },
        clear: function() {
            return this._data = {};
        }
    };

    // Create a safe storage access method
    window.safeStorage = {
        getItem: function(key) {
            if (window.storageAccess.localStorage) {
                return localStorage.getItem(key);
            }
            return window.memoryStorage.getItem(key);
        },
        setItem: function(key, value) {
            if (window.storageAccess.localStorage) {
                try {
                    localStorage.setItem(key, value);
                } catch (e) {
                    window.memoryStorage.setItem(key, value);
                }
            } else {
                window.memoryStorage.setItem(key, value);
            }
        },
        removeItem: function(key) {
            if (window.storageAccess.localStorage) {
                localStorage.removeItem(key);
            }
            window.memoryStorage.removeItem(key);
        },
        clear: function() {
            if (window.storageAccess.localStorage) {
                localStorage.clear();
            }
            window.memoryStorage.clear();
        }
    };

    // Show notification if storage access is limited
    window.addEventListener('DOMContentLoaded', function() {
        if (!window.storageAccess.localStorage || 
            !window.storageAccess.cacheAPI || 
            !window.storageAccess.cookies) {
            
            const storageIssue = document.createElement('div');
            storageIssue.id = 'storage-issue-warning';
            storageIssue.innerHTML = `
                <div style="background-color: #fff3cd; color: #856404; padding: 10px; margin: 10px 0; border-radius: 4px; border-left: 5px solid #ffeeba;">
                    <p><strong>Limited Privacy Mode Detected:</strong> Your browser's tracking prevention is blocking some storage access. 
                    The app will still work, but some features like offline access may be limited.</p>
                    <button id="dismiss-storage-warning" style="background: #856404; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Dismiss</button>
                </div>
            `;
            
            // Add to page when DOM is ready
            setTimeout(function() {
                const firstElement = document.body.firstChild;
                document.body.insertBefore(storageIssue, firstElement);
                
                // Add dismiss button functionality
                document.getElementById('dismiss-storage-warning').addEventListener('click', function() {
                    document.getElementById('storage-issue-warning').style.display = 'none';
                });
            }, 1000);
        }
    });
})();
