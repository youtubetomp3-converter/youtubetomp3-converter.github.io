// Simple error logging system for the YouTube to MP3 Converter

(function() {
    const MAX_LOGS = 10;
    const STORAGE_KEY = 'yt2mp3_error_logs';
    
    // Initialize error handling
    window.addEventListener('error', function(event) {
        logError({
            message: event.message,
            source: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            timestamp: new Date().toISOString()
        });
    });
    
    // Also catch unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        logError({
            message: `Unhandled Promise Rejection: ${event.reason}`,
            timestamp: new Date().toISOString()
        });
    });
    
    // Log error to localStorage
    function logError(errorData) {
        try {
            let logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            logs.unshift(errorData);  // Add to beginning
            
            // Keep only the last MAX_LOGS entries
            if (logs.length > MAX_LOGS) {
                logs = logs.slice(0, MAX_LOGS);
            }
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
            
            // Also log to console for debugging
            console.error('Logged error:', errorData);
        } catch (e) {
            // If localStorage fails, just log to console
            console.error('Error logging failed:', e);
            console.error('Original error:', errorData);
        }
    }
    
    // Add a global helper to get logs
    window.getErrorLogs = function() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
            console.error('Failed to retrieve error logs:', e);
            return [];
        }
    };
    
    // Add a global helper to clear logs
    window.clearErrorLogs = function() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('Failed to clear error logs:', e);
            return false;
        }
    };
})();
