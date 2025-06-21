/**
 * AdSense Helper Functions
 * This script helps manage AdSense loading and provides error handling
 * to improve user experience during the AdSense approval process
 */

// Check if AdSense is blocked or not yet approved
function checkAdSenseStatus() {
    // If we're in an iframe or local environment, skip the check
    if (window.location.protocol === 'file:' || window !== window.top) {
        console.log('AdSense check skipped: local or iframe environment');
        return;
    }

    // Create a test element to detect if ads are loading
    const testAd = document.createElement('div');
    testAd.className = 'adsbygoogle';
    testAd.style.position = 'absolute';
    testAd.style.top = '-999px';
    testAd.style.left = '-999px';
    testAd.style.width = '1px';
    testAd.style.height = '1px';
    testAd.setAttribute('data-ad-client', 'ca-pub-7438590583270235');
    testAd.setAttribute('data-ad-slot', 'test');
    document.body.appendChild(testAd);

    // Check the AdSense status of the test element
    window.setTimeout(function () {
        try {
            // Check if AdSense script failed to load or initialize
            const adsenseScript = document.querySelector('script[src*="adsbygoogle.js"]');
            const adsenseLoaded = typeof window.adsbygoogle !== 'undefined';

            if (!adsenseScript || !adsenseLoaded) {
                console.log('AdSense not loaded yet or blocked. This is normal during approval.');
                logAdStatus('not_loaded');
                return;
            }

            // Check if the test ad has been initialized
            const status = testAd.getAttribute('data-adsbygoogle-status');
            if (!status) {
                console.log('AdSense not initialized. This is normal during approval.');
                logAdStatus('not_initialized');
            } else {
                console.log('AdSense status:', status);
                logAdStatus(status);
            }
        } catch (e) {
            console.error('Error checking AdSense status:', e);
            logAdStatus('error');
        } finally {
            // Clean up the test element
            if (testAd.parentNode) {
                testAd.parentNode.removeChild(testAd);
            }
        }
    }, 2000);
}

// Log AdSense status to localStorage for diagnostics
function logAdStatus(status) {
    try {
        const now = new Date().toISOString();
        const statusLog = JSON.parse(localStorage.getItem('adsense_status_log') || '[]');
        statusLog.unshift({ status, timestamp: now });

        // Keep only the last 10 entries
        if (statusLog.length > 10) {
            statusLog.length = 10;
        }

        localStorage.setItem('adsense_status_log', JSON.stringify(statusLog));
    } catch (e) {
        console.error('Failed to log AdSense status:', e);
    }
}

// Initialize AdSense ads safely
function initAdsense() {
    try {
        if (typeof window.adsbygoogle === 'undefined') {
            console.log('AdSense not available yet. This is normal during approval.');
            return;
        }

        const adElements = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
        console.log(`Initializing ${adElements.length} AdSense ad units`);

        adElements.forEach(ad => {
            try {
                // Add a specific data attribute to track our initialization attempt
                ad.setAttribute('data-init-attempt', 'true');
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (innerErr) {
                console.error('Error pushing individual ad:', innerErr);
                // Mark the ad as having an error
                ad.setAttribute('data-init-error', 'true');
            }
        });
    } catch (e) {
        console.error('AdSense initialization error:', e);
    }
}

// Check if ads.txt is accessible
function checkAdsTxt() {
    const adsTxtUrl = window.location.origin + '/ads.txt';
    console.log('Checking ads.txt accessibility at:', adsTxtUrl);

    fetch(adsTxtUrl, {
        method: 'GET',
        cache: 'no-store'
    })
        .then(response => {
            if (!response.ok) {
                console.warn(`ads.txt issue: Server responded with status ${response.status}`);
                return Promise.reject(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(content => {
            console.log('ads.txt content found:', content);
            const validFormat = /google\.com, pub-[0-9]+, DIRECT, f08c47fec0942fa0/.test(content);
            if (validFormat) {
                console.log('✅ ads.txt is properly formatted');
            } else {
                console.warn('⚠️ ads.txt has incorrect format. Should contain: google.com, pub-XXXXXXXXXX, DIRECT, f08c47fec0942fa0');
            }
        })
        .catch(error => {
            console.warn('Issue with ads.txt:', error);
        });
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkAdSenseStatus,
        initAdsense,
        checkAdsTxt
    };
} else {
    // If loaded directly in browser, run checks after page load
    window.addEventListener('load', function () {
        // Delay checks to ensure page is fully loaded
        setTimeout(() => {
            checkAdsTxt();
            checkAdSenseStatus();
        }, 1000);
    });
}
