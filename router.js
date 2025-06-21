// router.js - Simple client-side routing system
(function() {
    // Define our routes
    const routes = {
        'youtubetomp3': '/',
        'youtube-to-mp3': '/',
        'youtube2mp3': '/',
        'youtube-2-mp3': '/',
        'youtube-mp3': '/',
        'yt2mp3': '/',
        'ytmp3': '/'
    };

    function initRouter() {
        // Check if we should handle routing from a 404 page
        const is404Page = window.location.pathname.includes('404.html');
        
        // Only run the routing logic if we're on the 404 page or if there's a path to handle
        if (is404Page || window.location.pathname !== '/') {
            handleRoute();
        }

        // Add event listener for popstate (when user navigates back/forward)
        window.addEventListener('popstate', handleRoute);
    }

    function handleRoute() {
        // Extract the path from the URL (remove leading slash and trailing slash if present)
        let path = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
        
        // Remove the .html extension if present
        path = path.replace('.html', '');
        
        // Check if this is a valid route
        if (routes[path]) {
            // Redirect to the appropriate page
            window.location.href = routes[path];
            return true;
        }
        
        // Special case for the 404 page - check if the URL might match one of our routes
        const is404Page = window.location.pathname.includes('404.html');
        if (is404Page) {
            // Try to extract potential route from the URL query parameters or hash
            const urlParams = new URLSearchParams(window.location.search);
            const path = urlParams.get('path') || window.location.hash.replace('#', '');
            
            if (path && routes[path.toLowerCase()]) {
                // Redirect to home page
                window.location.href = routes[path.toLowerCase()];
                return true;
            }
            
            // Check if any of our route keys are in the URL
            for (const route in routes) {
                if (window.location.href.toLowerCase().includes(route)) {
                    window.location.href = routes[route];
                    return true;
                }
            }
        }
        
        return false;
    }

    // Initialize the router when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRouter);
    } else {
        initRouter();
    }
})();
