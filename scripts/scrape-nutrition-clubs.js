const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapeNutritionClubs() {
  const browser = await puppeteer.launch({ 
    headless: false,  
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
    
    // Navigate to the site
    await page.goto('https://nutritionclubdirectory.com/directory/', { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });

    // Log page content and structure
    const pageContent = await page.content();
    await fs.writeFile(
      '/Users/codylunsford/CascadeProjects/tea-finder-next/data/page-source.html', 
      pageContent
    );

    // Log all elements that might be locations
    const potentialLocationElements = await page.evaluate(() => {
      // Try multiple potential selectors
      const selectors = [
        '.location',
        '.club',
        '.business',
        '.address',
        '[class*="location"]',
        '[class*="club"]',
        '[class*="business"]'
      ];

      const elements = [];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          elements.push({
            selector: selector,
            text: el.textContent?.trim(),
            classes: Array.from(el.classList)
          });
        });
      });

      return elements;
    });

    // Save potential location elements
    await fs.writeFile(
      '/Users/codylunsford/CascadeProjects/tea-finder-next/data/potential-locations.json', 
      JSON.stringify(potentialLocationElements, null, 2)
    );

    console.log('Page analysis complete. Check page-source.html and potential-locations.json');

  } catch (error) {
    console.error('Scraping failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Immediately invoke if run directly
if (require.main === module) {
  scrapeNutritionClubs().catch(console.error);
}

module.exports = scrapeNutritionClubs;
