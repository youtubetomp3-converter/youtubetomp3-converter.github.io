document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const youtubeUrlInput = document.getElementById('youtube-url');
    const convertBtn = document.getElementById('convert-btn');
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const thumbnailImg = document.getElementById('thumbnail');
    const videoTitleEl = document.getElementById('video-title');
    const videoDurationEl = document.getElementById('video-duration');
    const downloadLink = document.getElementById('download-link');
    const welcomeBanner = document.getElementById('welcome-banner');
    
    // Check for tracking prevention and storage access issues
    const checkStorageAccess = function() {
        if (window.storageAccess) {
            // Log storage access status for debugging
            console.log('Storage access status:', window.storageAccess);
            
            // If all storage is blocked, show a message
            if (!window.storageAccess.localStorage && 
                !window.storageAccess.sessionStorage && 
                !window.storageAccess.cookies) {
                console.warn('All storage access is blocked by browser privacy settings');
            }
        }
    };
    
    // Call storage access check
    checkStorageAccess();
    
    // Show welcome message with a slight delay
    setTimeout(() => {
        if (welcomeBanner) {
            welcomeBanner.style.display = 'block';
            // Auto-hide welcome message after 8 seconds
            setTimeout(() => {
                welcomeBanner.style.animation = 'fadeOut 1s forwards';
            }, 8000);
        }
    }, 1000);
    
    // YouTube API Key - This is a placeholder
    // For a real application, this should be secured and not exposed in client-side code
    // For GitHub Pages deployment, consider using a proxy server or a service like Netlify Functions
    const YOUTUBE_API_KEY = 'AIzaSyBQMnPn5Jy7KUhxWkuJ1nTCvamlQ-Nncf8';
    
    // RapidAPI key for YouTube to MP3 conversion service
    // This is a placeholder - you'll need to sign up at RapidAPI and subscribe to a YouTube to MP3 converter
    const RAPID_API_KEY = '5de0ce470amsh584ebd4cd57edf6p10e7d7jsnb35be6bf8443';
    
    // Event listeners
    convertBtn.addEventListener('click', handleConversion);
    youtubeUrlInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            handleConversion();
        }
    });
    
    // Main conversion handler
    async function handleConversion() {
        // Reset UI
        resetUI();
        
        // Get YouTube URL
        const youtubeUrl = youtubeUrlInput.value.trim();
        
        // Validate URL
        if (!isValidYouTubeUrl(youtubeUrl)) {
            showMessage('Please enter a valid YouTube URL', 'error');
            return;
        }
        
        // Extract video ID
        const videoId = extractVideoId(youtubeUrl);
        if (!videoId) {
            showMessage('Could not extract video ID from the URL', 'error');
            return;
        }
        
        try {
            // Show loading spinner
            loadingDiv.style.display = 'flex';
            
            // Get video information using YouTube API
            const videoInfo = await getVideoInfo(videoId);
            
            // Check if video duration exceeds 10 minutes (600 seconds)
            const durationInSeconds = convertYouTubeDuration(videoInfo.items[0].contentDetails.duration);
            if (durationInSeconds > 600) {
                showMessage('Video exceeds the maximum duration of 10 minutes', 'error');
                loadingDiv.style.display = 'none';
                return;
            }
              // Format duration for display
            const formattedDuration = formatDuration(durationInSeconds);
            
            // Update video info in the UI
            thumbnailImg.src = videoInfo.items[0].snippet.thumbnails.medium.url;
            videoTitleEl.textContent = videoInfo.items[0].snippet.title;
            videoDurationEl.textContent = `Duration: ${formattedDuration}`;
            
            // Perform the actual conversion using RapidAPI
            await performConversion(videoId, videoInfo.items[0].snippet.title);
            
        } catch (error) {
            console.error('Error during conversion:', error);
            showMessage('An error occurred during conversion. Please try again later.', 'error');
            loadingDiv.style.display = 'none';
        }
    }
    
    // Validate YouTube URL
    function isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
        return youtubeRegex.test(url);
    }
    
    // Extract video ID from YouTube URL
    function extractVideoId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }    // Get video information using YouTube API
    async function getVideoInfo(videoId) {
        try {
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`;
            
            // Use our CORS helper if available
            const fetchFunction = window.fetchWithCORS || fetch;
            const response = await fetchFunction(apiUrl);
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                throw new Error('Video not found or is unavailable');
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching video info:', error);
            throw error;
        }
    }
    
    // Convert YouTube duration format (ISO 8601) to seconds
    function convertYouTubeDuration(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        
        const hours = (match[1] && match[1].replace('H', '')) || 0;
        const minutes = (match[2] && match[2].replace('M', '')) || 0;
        const seconds = (match[3] && match[3].replace('S', '')) || 0;
        
        return (parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseInt(seconds);
    }
    
    // Format duration in MM:SS or HH:MM:SS format
    function formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
        } else {
            return `${minutes}:${padZero(remainingSeconds)}`;
        }
    }
    
    // Pad zero for single digit numbers
    function padZero(num) {
        return num.toString().padStart(2, '0');
    }
    
    // Show message with type (error or success)
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }
    
    // Reset UI elements
    function resetUI() {
        messageDiv.style.display = 'none';
        loadingDiv.style.display = 'none';
        resultDiv.style.display = 'none';
    }    // Perform the conversion using youtube-mp36.p.rapidapi.com API
    async function performConversion(videoId, videoTitle) {
        try {
            loadingDiv.style.display = 'flex';
            
            // Clean the video title for use in the filename
            const safeTitle = videoTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
            
            // Call the RapidAPI YouTube to MP3 conversion API
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': RAPID_API_KEY,
                    'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
                }
            };

            const apiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
            
            // Use our CORS helper if available
            const fetchFunction = window.fetchWithCORS || fetch;
            const response = await fetchFunction(apiUrl, options);
            const result = await response.json();
            
            // Handle different response statuses
            if (result.status === 'ok') {
                // Conversion successful, download is ready
                handleSuccessfulConversion(result, safeTitle);
            } else if (result.status === 'processing') {
                // Conversion is in progress, show appropriate message and start polling
                showMessage(`Conversion in progress: ${result.msg}. This may take a few minutes...`, 'info');
                pollConversionStatus(videoId, safeTitle);
            } else if (result.link && result.link.length > 0) {
                // Some APIs might not use status field but provide a link directly
                handleSuccessfulConversion(result, safeTitle);
            } else {
                // If none of the above conditions are met, it's an error
                throw new Error(result.msg || 'Conversion failed');
            }
        } catch (error) {
            console.error('Error in conversion:', error);
            loadingDiv.style.display = 'none';
            showMessage(`Conversion failed. Please try again later or with a different video.`, 'error');
        }
    }
    
    // Handle successful conversion
    function handleSuccessfulConversion(result, safeTitle) {
        // Show result section
        loadingDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        
        // Set the download link to the actual MP3 file URL
        downloadLink.href = result.link;
        downloadLink.download = `${safeTitle}.mp3`;
        
        showMessage('Conversion completed! Click the download button to get your MP3 file.', 'success');
    }
    
    // Poll conversion status until it's complete
    async function pollConversionStatus(videoId, safeTitle) {
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPID_API_KEY,
                'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
            }
        };
        
        const apiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
        const fetchFunction = window.fetchWithCORS || fetch;
        
        // Set a polling interval (in milliseconds)
        const pollingInterval = 5000; // 5 seconds
        const maxAttempts = 20; // Maximum 20 attempts (100 seconds total)
        let attempts = 0;
        
        const checkStatus = async () => {
            try {
                attempts++;
                const response = await fetchFunction(apiUrl, options);
                const result = await response.json();
                
                // Update the message with current status
                showMessage(`Conversion in progress: ${result.msg || 'processing'}. Attempt ${attempts}/${maxAttempts}...`, 'info');
                
                if (result.status === 'ok' || (result.link && result.link.length > 0)) {
                    // Conversion is complete
                    handleSuccessfulConversion(result, safeTitle);
                } else if (result.status === 'fail' || attempts >= maxAttempts) {
                    // Conversion failed or too many attempts
                    loadingDiv.style.display = 'none';
                    showMessage(`Conversion failed after ${attempts} attempts. Please try again later.`, 'error');
                } else {
                    // Still processing, schedule another check
                    setTimeout(checkStatus, pollingInterval);
                }
            } catch (error) {
                console.error('Error checking conversion status:', error);
                loadingDiv.style.display = 'none';
                showMessage('Error checking conversion status. Please try again later.', 'error');
            }
        };
        
        // Start checking after the initial polling interval
        setTimeout(checkStatus, pollingInterval);
    }
      // Verify API availability on startup
    async function verifyApiAvailability() {
        // Sample video ID for testing (short video)
        const testVideoId = 'dQw4w9WgXcQ';
        
        const api = {
            name: 'YouTube MP36',
            host: 'youtube-mp36.p.rapidapi.com',
            endpoint: `https://youtube-mp36.p.rapidapi.com/dl?id=${testVideoId}`
        };
        
        // Log API availability to console (for debugging)
        console.log('Checking API availability...');
        
        try {
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': RAPID_API_KEY,
                    'X-RapidAPI-Host': api.host
                }
            };
            
            const response = await fetch(api.endpoint, options);
            const result = await response.json();
            
            console.log(`API ${api.name} is available:`, result);
        } catch (error) {
            console.log(`API ${api.name} is not available:`, error.message);
        }
    }
    
    // Check API availability on startup (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        verifyApiAvailability();
    }
});

// IMPORTANT NOTES FOR IMPLEMENTATION:
// 1. For a real application, you would need:
//    - A YouTube Data API key to fetch video information
//    - A backend service or third-party API to handle the conversion process
//    - Proper error handling for API limits, network issues, etc.
// 
// 2. YouTube's terms of service may prohibit direct downloading of content.
//    Always ensure your application complies with their terms and copyright laws.
//
// 3. For GitHub Pages deployment:
//    - GitHub Pages only hosts static content and doesn't support server-side code
//    - You'll need to use a third-party API service for the conversion
//    - Consider using a serverless function (like Netlify Functions) if you need backend capabilities
//
// 4. To implement a real solution, you could:
//    - Use a service like RapidAPI that offers YouTube to MP3 conversion APIs
//    - Create your own backend service using Node.js, Python, etc.
//    - Deploy the backend to a platform like Heroku, Vercel, or AWS
