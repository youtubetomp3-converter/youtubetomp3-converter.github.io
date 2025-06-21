// Ads.txt validation script
// This script helps verify that your ads.txt file is properly configured
// and accessible for AdSense crawlers

function validateAdsTxt() {
    const adsTxtUrl = window.location.origin + '/ads.txt';
    console.log('Checking ads.txt accessibility at:', adsTxtUrl);
    
    fetch(adsTxtUrl, {
        method: 'GET',
        cache: 'no-store'
    })
    .then(response => {
        if (!response.ok) {
            console.error(`ads.txt error: Server responded with status ${response.status}`);
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
            console.error('❌ ads.txt has incorrect format. Should contain: google.com, pub-XXXXXXXXXX, DIRECT, f08c47fec0942fa0');
        }
    })
    .catch(error => {
        console.error('Failed to load ads.txt:', error);
    });
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateAdsTxt };
} else {
    // If run directly in browser
    document.addEventListener('DOMContentLoaded', validateAdsTxt);
}
