const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');
const { executablePath } = require('puppeteer');

async function scrapeNutritionClubs() {
  const browser = await puppeteer.launch({ 
    headless: false,
    executablePath: executablePath(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', (msg) => console.log('Page Console:', msg.text()));
    page.on('pageerror', (err) => console.error('Page Error:', err));

    // Sophisticated anti-detection techniques
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
    
    // Navigate to the site
    await page.goto('https://nutritionclubdirectory.com/directory/', { 
      waitUntil: 'networkidle2',
      timeout: 90000
    });

    // Take a screenshot for debugging
    await page.screenshot({ 
      path: '/Users/codylunsford/CascadeProjects/tea-finder-next/data/debug-screenshot.png', 
      fullPage: true 
    });

    // Dump page content for investigation
    const pageContent = await page.content();
    await fs.writeFile('/Users/codylunsford/CascadeProjects/tea-finder-next/data/page-content.html', pageContent);

    // Extract comprehensive location data using multiple strategies
    const clubs = await page.evaluate(() => {
      console.log('Window objects:', Object.keys(window));
      console.log('DRTS object:', window.DRTS);
      console.log('DRTS Map:', window.DRTS?.Map);
      console.log('DRTS Map markers:', window.DRTS?.Map?.markers);

      const extractClubData = () => {
        const clubs = [];
        
        // Strategy 1: Direct DOM parsing
        const locationEntries = document.querySelectorAll('.drts-view-entity');
        console.log('Location entries found via DOM:', locationEntries.length);
        
        locationEntries.forEach(entry => {
          const nameEl = entry.querySelector('.drts-bs-card-title a');
          const addressEl = entry.querySelector('.drts-map-marker-address');
          const phoneEl = entry.querySelector('.drts-contact-phone');
          
          if (nameEl && addressEl) {
            const name = nameEl.textContent.trim();
            const address = addressEl.textContent.trim();
            const phone = phoneEl ? phoneEl.textContent.trim() : 'No Phone';
            
            clubs.push({
              name,
              fullAddress: address,
              phone,
              source: 'Direct DOM'
            });
          }
        });

        // Strategy 2: DRTS Map markers
        if (window.DRTS && window.DRTS.Map && window.DRTS.Map.markers) {
          console.log('DRTS Map markers found:', window.DRTS.Map.markers.length);
          window.DRTS.Map.markers.forEach(marker => {
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(marker.content, 'text/html');
              
              const nameEl = doc.querySelector('.drts-bs-card-title a');
              const addressEl = doc.querySelector('.drts-map-marker-address');
              
              if (nameEl && addressEl) {
                const name = nameEl.textContent.trim();
                const address = addressEl.textContent.trim();
                
                clubs.push({
                  name,
                  fullAddress: address,
                  coordinates: {
                    lat: marker.lat,
                    lng: marker.lng
                  },
                  source: 'DRTS Map'
                });
              }
            } catch (err) {
              console.error('Error parsing marker:', err);
            }
          });
        }

        // Strategy 3: Script content parsing
        const scripts = document.scripts;
        const scriptData = Array.from(scripts)
          .map(script => script.textContent)
          .filter(text => 
            text.includes('nutrition') || 
            text.includes('location') || 
            text.includes('club')
          );
        
        console.log('Matching scripts found:', scriptData.length);

        return clubs;
      };
      
      return extractClubData();
    });

    // Ensure data directory exists
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });

    // Save to JSON file with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputFile = path.join(dataDir, `nutrition-clubs-${timestamp}.json`);
    await fs.writeFile(outputFile, JSON.stringify(clubs, null, 2));

    console.log(`Scraped ${clubs.length} nutrition clubs`);
    console.log(`Data saved to ${outputFile}`);

    return clubs;

  } catch (error) {
    console.error('Comprehensive scraping failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Export for potential use in other scripts
module.exports = scrapeNutritionClubs;

// Immediately invoke if run directly
if (require.main === module) {
  scrapeNutritionClubs().catch(console.error);
}
