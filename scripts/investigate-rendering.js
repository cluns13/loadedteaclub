const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');
const { executablePath } = require('puppeteer');

async function investigateRendering() {
  const browser = await puppeteer.launch({ 
    headless: false,
    executablePath: executablePath(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Sophisticated anti-detection and bypass techniques
    await page.evaluateOnNewDocument(() => {
      // Overwrite webdriver flag
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    // Set a more realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
    
    // Randomize viewport size to appear more human-like
    await page.setViewport({
      width: 1920 + Math.floor(Math.random() * 100),
      height: 1080 + Math.floor(Math.random() * 100)
    });

    // Disable various browser features that might be detected
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate'
    });

    // Enable request interception for advanced analysis
    await page.setRequestInterception(true);
    
    const blockedResourceTypes = [
      'image', 
      'media', 
      'font', 
      'texttrack', 
      'object', 
      'beacon', 
      'csp_report', 
      'imageset'
    ];

    const skippedResources = [
      'quantserve', 
      'adzerk', 
      'doubleclick',
      'adnxs', 
      'taboola', 
      'facebook', 
      'twitter', 
      'analytics'
    ];

    page.on('request', (request) => {
      const url = request.url();
      const type = request.resourceType();
      
      // Block unnecessary resources
      if (
        blockedResourceTypes.includes(type) || 
        skippedResources.some(resource => url.includes(resource))
      ) {
        request.abort();
        return;
      }

      request.continue();
    });

    // Capture console logs and errors
    page.on('console', (msg) => console.log('Console:', msg.text()));
    page.on('pageerror', (err) => console.log('Page Error:', err));

    // Navigate with advanced options
    await page.goto('https://nutritionclubdirectory.com/directory/', { 
      waitUntil: 'networkidle2',
      timeout: 90000
    });

    // Take full page screenshot
    await page.screenshot({ 
      path: '/Users/codylunsford/CascadeProjects/tea-finder-next/data/full-page-screenshot.png', 
      fullPage: true 
    });

    // Comprehensive page analysis
    const pageAnalysis = await page.evaluate(() => {
      // Detailed window and document investigation
      const windowKeys = Object.keys(window)
        .filter(key => window[key] !== null && window[key] !== undefined)
        .map(key => ({
          key, 
          type: typeof window[key],
          hasOwnProperties: Object.keys(window[key] || {}).length > 0
        }));

      // Check for potential data loading mechanisms
      const potentialDataSources = [
        // Look for global objects that might contain location data
        window.DRTS,
        window.locationData,
        window.clubs,
        window.locations
      ].filter(Boolean).map(source => Object.keys(source));

      return {
        documentReadyState: document.readyState,
        windowObjectCount: windowKeys.length,
        potentialDataSources,
        documentStructure: {
          bodyChildCount: document.body.children.length,
          divCount: document.getElementsByTagName('div').length,
          scriptCount: document.scripts.length
        }
      };
    });

    // Attempt multiple data extraction strategies
    const extractionStrategies = await page.evaluate(() => {
      const strategies = {
        querySelectorStrategies: {
          byClass: Array.from(document.querySelectorAll('.drts-view-entity')).map(el => el.textContent),
          byAddress: Array.from(document.querySelectorAll('.drts-map-marker-address')).map(el => el.textContent),
          byLocation: Array.from(document.querySelectorAll('[class*="location"]')).map(el => el.textContent)
        },
        scriptContentStrategies: Array.from(document.scripts)
          .map(script => script.textContent)
          .filter(text => 
            text.includes('location') || 
            text.includes('club') || 
            text.includes('nutrition')
          )
          .slice(0, 10) // Limit to first 10 matches
      };

      return strategies;
    });

    // Prepare output directory
    const outputDir = path.join(__dirname, '..', 'data', 'rendering-investigation');
    await fs.mkdir(outputDir, { recursive: true });

    // Save investigation results
    await fs.writeFile(
      path.join(outputDir, 'page-analysis.json'), 
      JSON.stringify({
        pageAnalysis,
        extractionStrategies
      }, null, 2)
    );

    console.log('Rendering investigation complete. Check data/rendering-investigation directory.');

    return {
      pageAnalysis,
      extractionStrategies
    };

  } catch (error) {
    console.error('Rendering investigation failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Export for potential use in other scripts
module.exports = investigateRendering;

// Immediately invoke if run directly
if (require.main === module) {
  investigateRendering().catch(console.error);
}
