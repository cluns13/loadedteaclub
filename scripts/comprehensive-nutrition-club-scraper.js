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
    
    // Set a realistic user agent and increase timeout
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
    await page.setDefaultTimeout(60000);
    
    // Navigate to the site
    await page.goto('https://nutritionclubdirectory.com/directory/', { 
      waitUntil: 'networkidle0'
    });

    // Debug: Take a screenshot
    await page.screenshot({ path: '/Users/codylunsford/CascadeProjects/tea-finder-next/data/page-screenshot.png' });

    // Debug: Log page content
    const pageContent = await page.content();
    await fs.writeFile('/Users/codylunsford/CascadeProjects/tea-finder-next/data/page-debug.html', pageContent);

    // Extract comprehensive location data
    const clubs = await page.evaluate(() => {
      console.log('Starting evaluation');
      const extractClubData = () => {
        console.log('Extracting club data');
        const clubs = [];
        
        // Debug: Log all elements
        console.log('Total elements:', document.body.getElementsByTagName('*').length);
        
        // Select all location entries
        const locationEntries = document.querySelectorAll('.drts-view-entities .drts-view-entity');
        console.log('Location entries found:', locationEntries.length);
        
        locationEntries.forEach((entry, index) => {
          try {
            console.log(`Processing entry ${index}`);
            
            // Name extraction
            const nameEl = entry.querySelector('.drts-bs-card-title a');
            const name = nameEl ? nameEl.textContent.trim() : 'Unknown';
            console.log('Name:', name);
            
            // Address extraction
            const addressEl = entry.querySelector('.drts-map-marker-address');
            const address = addressEl ? addressEl.textContent.trim() : 'No Address';
            console.log('Address:', address);
            
            // Phone number extraction
            const phoneEls = [
              entry.querySelector('.drts-contact-phone'),
              entry.querySelector('.drts-location-phone')
            ];
            const phone = phoneEls.find(el => el && el.textContent)?.textContent.trim() || 'No Phone';
            console.log('Phone:', phone);
            
            // Social media link extraction
            const socialMediaEl = entry.querySelector('a[href*="facebook.com"], a[href*="instagram.com"]');
            const socialMedia = socialMediaEl ? socialMediaEl.href : null;
            console.log('Social Media:', socialMedia);
            
            // Image extraction
            const imageEl = entry.querySelector('.drts-bs-card-img:not(.drts-no-image)');
            const image = imageEl ? imageEl.src : null;
            console.log('Image:', image);
            
            // Coordinates extraction
            const mapMarker = entry.querySelector('[data-lat][data-lng]');
            const coordinates = mapMarker 
              ? {
                  lat: parseFloat(mapMarker.getAttribute('data-lat')),
                  lng: parseFloat(mapMarker.getAttribute('data-lng'))
                }
              : null;
            console.log('Coordinates:', coordinates);
            
            // Parse address components
            const addressParts = address.split(',').map(part => part.trim());
            const city = addressParts.length > 1 ? addressParts[addressParts.length - 2] : 'Unknown';
            const state = addressParts.length > 1 ? addressParts[addressParts.length - 1].split(' ')[0] : 'Unknown';
            
            clubs.push({
              name,
              fullAddress: address,
              city,
              state,
              phone,
              socialMedia,
              image,
              coordinates,
              source: 'Nutrition Club Directory'
            });
          } catch (entryError) {
            console.error('Error processing entry:', entryError);
          }
        });
        
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
