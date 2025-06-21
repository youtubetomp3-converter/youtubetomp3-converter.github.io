# YouTube to MP3 Converter

A fully functional web application that allows users to convert YouTube videos to MP3 files. This application is ready to be deployed to GitHub Pages.

## Features

- Convert YouTube videos to MP3 format with high-quality audio
- Support for videos up to 10 minutes in length
- User-friendly interface with responsive design
- Progress indicators and detailed error messages
- Works offline with service worker caching
- Progressive Web App (PWA) capabilities
- CORS handling for API requests
- Error logging system for debugging

## How It Works

This application uses:
- YouTube Data API to fetch video information
- RapidAPI's YouTube MP3 Converter to perform the actual conversion
- Client-side JavaScript for a smooth user experience
- Service workers for offline capabilities

## Deployment to GitHub Pages

1. Create a new repository on GitHub
2. Push this code to the repository
3. Go to the repository settings
4. Navigate to Pages section
5. Select the branch you want to deploy (usually `main`)
6. Click Save
7. The site is published at `https://vineethwilson15.github.io/`

## Configuration

The application comes pre-configured with API keys. If you need to use your own:

1. YouTube Data API Key:
   - In `script.js`, replace the value of `YOUTUBE_API_KEY`

2. RapidAPI Key:
   - In `script.js`, replace the value of `RAPID_API_KEY`

## API Usage Information

This application uses several free-tier APIs from RapidAPI:

1. **YouTube Data API**: For fetching video information (title, duration, etc.)
2. **YouTube to MP3 Conversion APIs**: For converting YouTube videos to MP3

The application is configured to try multiple conversion APIs in case one fails. Free tier APIs have the following limitations:

- Limited number of requests per day/month
- Potential rate limiting during high usage
- Some conversions may fail due to API restrictions

If you experience consistent issues with conversions:
1. Try using a different YouTube video
2. Wait and try again later (API quota may refresh)
3. Consider upgrading to a paid API plan if you need reliable service

### Current APIs Used

The application tries the following APIs in sequence until one succeeds:
1. YouTube MP3 Download1 API
2. YouTube MP36 API
3. Several backup APIs if the primary ones fail

## Understanding the Conversion Process

The YouTube to MP3 conversion process works in the following steps:

1. When you submit a YouTube URL, the app first validates it and extracts the video ID
2. The app then fetches video information (title, duration, etc.) using the YouTube Data API
3. If the video is under 10 minutes, the conversion request is sent to the RapidAPI service
4. **Important**: The conversion process may take some time, especially for longer videos
   - Initially, the API returns a "processing" status with a message like "in queue"
   - The app will automatically poll the API every 5 seconds to check the conversion status
   - This polling continues until the conversion is complete or fails after multiple attempts
5. Once the conversion is complete, a download link becomes available
6. You can then download the MP3 file to your device

If you see a message like "Conversion in progress: in queue" - this is normal! The API is processing your request and may take 1-2 minutes to complete, depending on the video length and server load.

## Legal Considerations

- This tool is intended for personal use only
- Only convert videos that you have permission to download
- Respect copyright laws and YouTube's terms of service

## Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- YouTube Data API
- RapidAPI YouTube MP3 Converter
- Service Workers for offline capabilities
- Progressive Web App features

## License

This project is available for personal use only. Commercial use is prohibited.

## Troubleshooting

If you encounter issues:
- Check the browser console for errors
- Use the built-in error logging system by typing `getErrorLogs()` in the console
- Ensure your API keys are valid and have the necessary permissions
- Check if you've reached API usage limits

## Testing Locally

To test the application locally with all features (including the Service Worker):

### Option 1: Using the built-in Node.js server
1. Make sure you have Node.js installed
2. Open a terminal in the project directory
3. Run: `node server.js`
4. Open your browser and go to `http://localhost:8080`

### Option 2: Using http-server
1. Install the http-server package: `npm install -g http-server`
2. Open a terminal in the project directory
3. Run: `http-server` or `npm run dev`
4. Open your browser and go to `http://localhost:8080`

**Note:** Service Workers require HTTPS or localhost to function. They will not work when opening HTML files directly from the filesystem.

## Monetization with Google AdSense

This application is configured for monetization with Google AdSense. To set up AdSense:

1. Create a Google AdSense account at https://www.google.com/adsense/
2. Apply for AdSense approval
3. The application is already set up with AdSense publisher ID: ca-pub-7438590583270235
   - If you need to use your own AdSense account, replace this ID with your actual publisher ID
   - Update the ad slots as needed for your specific implementation

The application includes:
- Pre-configured ad containers for top, middle, and bottom ad placements
- Privacy Policy and Terms of Service pages (required for AdSense approval)
- SEO optimization for better discoverability
- Responsive ad placements that work on all devices

### AdSense Compliance

To ensure AdSense compliance:
- Do not click on your own ads
- Do not encourage users to click on ads
- Ensure all content complies with AdSense Program Policies
- Monitor ad performance and make adjustments as needed

## SEO Optimization

The application includes several SEO features:
- Meta tags for description and keywords
- A sitemap.xml file for search engine indexing
- robots.txt for search engine crawling instructions
- FAQ section with relevant keywords
- Responsive design for mobile optimization

Update the sitemap.xml with your actual GitHub Pages URL before deployment.

## Live Demo

The application is live at: [https://vineethwilson15.github.io/](https://vineethwilson15.github.io/)

## Repository Information

- **Repository URL**: [https://github.com/vineethwilson15/YouTube-to-MP3](https://github.com/vineethwilson15/YouTube-to-MP3)
- **Issues**: [https://github.com/vineethwilson15/YouTube-to-MP3/issues](https://github.com/vineethwilson15/YouTube-to-MP3/issues)
- **GitHub Pages URL**: [https://vineethwilson15.github.io/](https://vineethwilson15.github.io/)
