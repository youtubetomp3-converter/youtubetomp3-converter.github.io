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

// Check if the current page is suitable for ads (has sufficient content)
function hasAdequateContent() {
    // Check if we're on a special page that shouldn't have ads
    const path = window.location.pathname.toLowerCase();
    
    // Don't show ads on error pages, offline pages, or pages under construction
    if (path.includes('404') || 
        path.includes('error') || 
        path.includes('offline') || 
        path.includes('construction')) {
        console.log('Page not suitable for ads: special page');
        return false;
    }
    
    // Don't show ads on pages with minimal content
    const contentElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, article, section');
    if (contentElements.length < 3) {
        console.log('Page not suitable for ads: insufficient content elements');
        return false;
    }
    
    // Calculate total content length - pages with very little text shouldn't show ads
    let totalTextLength = 0;
    contentElements.forEach(el => {
        totalTextLength += el.textContent.trim().length;
    });
    
    if (totalTextLength < 300) { // Requiring at least 300 characters of text content
        console.log('Page not suitable for ads: insufficient text content');
        return false;
    }
    
    return true;
}

// Initialize AdSense with content checks
function initializeAdSense() {
    // If this page doesn't have adequate content, remove ad slots
    if (!hasAdequateContent()) {
        console.log('Removing ad slots due to insufficient content');
        const adElements = document.querySelectorAll('.adsbygoogle, amp-ad, .ad-container');
        adElements.forEach(el => {
            el.style.display = 'none';
            // If it's a container, add a data attribute to mark it as inactive
            if (el.classList.contains('ad-container')) {
                el.setAttribute('data-adsense-disabled', 'content-policy');
            }
        });
        return;
    }

    // Initialize AdSense ads if the page has adequate content
    (adsbygoogle = window.adsbygoogle || []).push({});
    
    // Wait for the DOM to be fully ready
    document.addEventListener('DOMContentLoaded', function() {
        // Check AdSense status
        checkAdSenseStatus();
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

// Log AdSense status for debugging
function logAdStatus(status) {
    // Implementation depends on your logging needs
    console.log('AdSense status logged:', status);
}

// Run initialization
initializeAdSense();

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

        // Check if we've already initialized ads in this page load
        if (window._adsenseInitialized) {
            console.log('AdSense already initialized in this session, skipping duplicate initialization');
            return;
        }

        // Flag to prevent multiple initialization attempts in same session
        window._adsenseInitialized = true;
        
        // Handle mixed AMP and non-AMP pages
        const hasAmp = document.querySelector('amp-ad, amp-auto-ads');
        
        // On AMP pages, don't manually initialize ads as AMP will handle them
        if (hasAmp) {
            console.log('AMP ads detected on page - skipping manual initialization');
            // Just push the array once to initialize any non-AMP ads that might exist
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (ampError) {
                // Ignore expected errors on AMP pages
                console.log('Expected push error on AMP page:', ampError.message || ampError);
            }
            return;
        }

        // On regular pages, initialize each ad unit individually
        const adElements = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status]):not([data-ad-status])');
        
        if (adElements.length === 0) {
            console.log('No uninitiated AdSense elements found to initialize');
            return;
        }
        
        console.log(`Found ${adElements.length} AdSense ad units to initialize`);
        
        // Single push for all ads - recommended approach by Google
        (adsbygoogle = window.adsbygoogle || []).push({});
        console.log('AdSense initialization pushed');
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
    // Use DOMContentLoaded instead of load for faster initialization
    // This helps with the race condition between AMP and regular AdSense
    document.addEventListener('DOMContentLoaded', function() {
        // Check for tracking prevention and apply fallback if needed
        detectTrackingPrevention().then(isTrackingPrevented => {
            if (isTrackingPrevented) {
                applyTrackingPreventionFallback();
            } else {
                // Only initialize once and with a short delay
                setTimeout(() => {
                    if (!window._adsenseInitialized) {
                        initAdsense();
                    }
                    
                    // Run additional checks with a longer delay
                    setTimeout(() => {
                        checkAdsTxt();
                        checkAdSenseStatus();
                    }, 2000);
                }, 100);
            }
        });
    });
}
