const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');
const { executablePath } = require('puppeteer');

async function investigateWebsite() {
  const browser = await puppeteer.launch({ 
    headless: false,
    executablePath: executablePath(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Advanced network interception
    const requestLog = [];
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      requestLog.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        headers: request.headers()
      });
      request.continue();
    });

    // Comprehensive logging
    const consoleLog = [];
    const networkLog = [];
    const errorLog = [];

    page.on('console', (msg) => {
      consoleLog.push({
        type: msg.type(),
        text: msg.text(),
        args: msg.args().map(arg => arg.toString())
      });
    });

    page.on('pageerror', (err) => {
      errorLog.push(err.toString());
    });

    page.on('response', async (response) => {
      try {
        const request = response.request();
        networkLog.push({
          url: response.url(),
          status: response.status(),
          contentType: response.headers()['content-type'],
          method: request.method()
        });
      } catch (e) {
        console.error('Error logging response:', e);
      }
    });

    // Performance and coverage tracking
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();

    // Navigate to site
    await page.goto('https://nutritionclubdirectory.com/directory/', { 
      waitUntil: 'networkidle2',
      timeout: 90000
    });

    // Prepare output directory
    const outputDir = path.join(__dirname, '..', 'data', 'investigation');
    await fs.mkdir(outputDir, { recursive: true });

    // Take full page screenshots
    await page.screenshot({ 
      path: path.join(outputDir, 'full-page.png'), 
      fullPage: true 
    });

    // Comprehensive page evaluation
    const pageEvaluation = await page.evaluate(() => {
      // Window object investigation
      const windowObjects = Object.keys(window)
        .filter(key => window[key] !== null && window[key] !== undefined)
        .map(key => ({
          key, 
          type: typeof window[key],
          hasProperties: Object.keys(window[key] || {}).length > 0
        }));

      // Potential data sources
      const potentialDataSources = {
        DRTS: window.DRTS ? Object.keys(window.DRTS) : null,
        locationData: window.locationData ? Object.keys(window.locationData) : null,
        googleMaps: window.google && window.google.maps ? 'Present' : null
      };

      // DOM structure analysis
      const domAnalysis = {
        totalElements: document.body.getElementsByTagName('*').length,
        divCount: document.getElementsByTagName('div').length,
        scriptCount: document.scripts.length,
        classesWithLocation: Array.from(document.querySelectorAll('[class*="location"]')).length
      };

      return {
        windowObjects,
        potentialDataSources,
        domAnalysis
      };
    });

    // Get JavaScript and CSS coverage
    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();

    // Save investigation results
    await Promise.all([
      fs.writeFile(
        path.join(outputDir, 'request-log.json'), 
        JSON.stringify(requestLog, null, 2)
      ),
      fs.writeFile(
        path.join(outputDir, 'console-log.json'), 
        JSON.stringify(consoleLog, null, 2)
      ),
      fs.writeFile(
        path.join(outputDir, 'network-log.json'), 
        JSON.stringify(networkLog, null, 2)
      ),
      fs.writeFile(
        path.join(outputDir, 'error-log.json'), 
        JSON.stringify(errorLog, null, 2)
      ),
      fs.writeFile(
        path.join(outputDir, 'page-evaluation.json'), 
        JSON.stringify(pageEvaluation, null, 2)
      ),
      fs.writeFile(
        path.join(outputDir, 'js-coverage.json'), 
        JSON.stringify(jsCoverage, null, 2)
      ),
      fs.writeFile(
        path.join(outputDir, 'css-coverage.json'), 
        JSON.stringify(cssCoverage, null, 2)
      )
    ]);

    console.log('Comprehensive website investigation complete.');

    return {
      requestLog,
      consoleLog,
      networkLog,
      errorLog,
      pageEvaluation
    };

  } catch (error) {
    console.error('Investigation failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Export for potential use in other scripts
module.exports = investigateWebsite;

// Immediately invoke if run directly
if (require.main === module) {
  investigateWebsite().catch(console.error);
}
