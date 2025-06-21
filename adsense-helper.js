/**
 * AdSense Helper Functions
 * This script helps manage AdSense loading and provides error handling
 * to improve user experience during the AdSense approval process
 */

// Check if tracking prevention is active
function detectTrackingPrevention() {
    return new Promise((resolve) => {
        try {
            // Try to access localStorage as a quick test
            localStorage.setItem('adsense_test', 'test');
            localStorage.removeItem('adsense_test');
            
            // Test for third-party cookie/storage blocking
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'about:blank';
            document.body.appendChild(iframe);
            
            setTimeout(() => {
                try {
                    // Try to access storage in iframe context
                    const iframeWindow = iframe.contentWindow;
                    const testValue = 'testValue_' + Date.now();
                    iframeWindow.localStorage.setItem('tracking_test', testValue);
                    const retrieved = iframeWindow.localStorage.getItem('tracking_test');
                    iframeWindow.localStorage.removeItem('tracking_test');
                    
                    const trackingPrevented = retrieved !== testValue;
                    console.log('Tracking prevention detected:', trackingPrevented);
                    resolve(trackingPrevented);
                } catch (e) {
                    console.log('Storage access error - tracking prevention likely active:', e);
                    resolve(true); // Tracking prevention is likely active
                } finally {
                    document.body.removeChild(iframe);
                }
            }, 100);
        } catch (e) {
            console.log('Error detecting tracking prevention:', e);
            resolve(true); // Assume tracking prevention is active if test fails
        }
    });
}

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
    testAd.setAttribute('data-ad-slot', '1787237657');
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

// Apply fallback behavior when tracking prevention is detected
function applyTrackingPreventionFallback() {
    console.log('Applying tracking prevention fallback measures');
    
    // Show a minimal notice in ad containers
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
        // Hide any adsbygoogle elements
        const adsElements = container.querySelectorAll('.adsbygoogle');
        adsElements.forEach(ad => {
            ad.style.display = 'none';
        });
        
        // Only add the notice if it doesn't already exist
        if (!container.querySelector('.tracking-notice')) {
            const notice = document.createElement('div');
            notice.className = 'tracking-notice';
            notice.innerHTML = 'Ad display limited by browser privacy settings';
            notice.style.textAlign = 'center';
            notice.style.padding = '10px';
            notice.style.fontSize = '12px';
            notice.style.color = '#666';
            container.appendChild(notice);
        }
    });
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
        checkAdsTxt,
        detectTrackingPrevention,
        applyTrackingPreventionFallback
    };
} else {
    // If loaded directly in browser, run checks after page load
    window.addEventListener('load', function () {
        // Delay checks to ensure page is fully loaded
        setTimeout(() => {
            checkAdsTxt();
            checkAdSenseStatus();
            
            // Check for tracking prevention and apply fallback if needed
            detectTrackingPrevention().then(isTrackingPrevented => {
                if (isTrackingPrevented) {
                    applyTrackingPreventionFallback();
                } else {
                    initAdsense();
                }
            });
        }, 1000);
    });
}
