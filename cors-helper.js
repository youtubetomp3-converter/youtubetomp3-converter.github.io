/* This file sets up a simple CORS proxy */
window.addEventListener('DOMContentLoaded', (event) => {
    // This script is a fallback in case direct API calls fail due to CORS
    // It demonstrates how to handle CORS issues in a GitHub Pages environment
    
    // Adds a method to check if a request is likely to face CORS issues
    window.checkCORS = function(url) {
        const currentOrigin = window.location.origin;
        try {
            const urlObj = new URL(url);
            return urlObj.origin !== currentOrigin;
        } catch (e) {
            return false;
        }
    };
    
    // A helper function to use a CORS proxy if needed
    window.fetchWithCORS = async function(url, options = {}) {
        try {
            // First try direct fetch
            return await fetch(url, options);
        } catch (error) {            // If direct fetch fails and it might be due to CORS, try with a proxy
            if (error.message.includes('CORS') || error.message.includes('network')) {
                const corsProxies = [
                    'https://corsproxy.io/?',
                    'https://api.allorigins.win/raw?url=',
                    'https://proxy.cors.sh/',
                    'https://cors-anywhere.herokuapp.com/'
                ];
                
                // Don't use proxies for RapidAPI endpoints, they require specific headers
                const isRapidApiRequest = url.includes('rapidapi.com') || 
                                         (options.headers && options.headers['X-RapidAPI-Key']);
                
                if (isRapidApiRequest) {
                    console.error('CORS error with RapidAPI request, but cannot use proxy for these endpoints.');
                    throw new Error('Cannot use proxy for RapidAPI requests due to authentication requirements. Try using the app when deployed to GitHub Pages.');
                }
                
                // Try each proxy in turn
                for (const proxy of corsProxies) {
                    try {
                        const proxyUrl = proxy + encodeURIComponent(url);
                        return await fetch(proxyUrl, options);
                    } catch (proxyError) {
                        console.error(`Proxy ${proxy} failed:`, proxyError);
                        // Continue to the next proxy
                    }
                }
            }
            
            // If all attempts fail, rethrow the original error
            throw error;
        }
    };
});
