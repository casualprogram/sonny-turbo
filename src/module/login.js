

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

puppeteer.use(StealthPlugin());
dotenv.config( {path: path.resolve("../.env") });


export default async function accountLogin(){


    const URL = process.env.LOGIN_URL;
    const checkoutURL = process.env.CHECKOUT_URL;
    const api_remove_item = process.env.API_REMOVE_ITEM;
    const user_email = process.env.USER_EMAIL;
    const user_password = process.env.USER_PASSWORD;

    const randomDelay = (min, max) => {
        const delay = Math.floor(Math.random() * (max - min) + min);
        return new Promise(resolve => setTimeout(resolve, delay));
      };
    
      // Clear previous browser data to avoid being tracked
      try {
        await fs.rm('./user-data-dir', { recursive: true, force: true });
      } catch (error) {
        // Directory might not exist, that's fine
      }
    
      // Launch with more human-like settings and custom user data directory
      const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        userDataDir: './user-data-dir',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-position=0,0',
          '--window-size=1280,720',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process'
        ]
      });
      
      const page = await browser.newPage();
      
      // More sophisticated fingerprint masking
      await page.evaluateOnNewDocument(() => {
        // Override properties that automation detection libraries check
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        
        // Modify the user agent on the navigator object
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        Object.defineProperty(navigator, 'userAgent', { get: () => userAgent });
        
        // Add mock plugins and mime types
        window.navigator.plugins = [...Array(3)].map((_, i) => ({
          name: ['Widevine Content Decryption Module', 'Chrome PDF Plugin', 'Chrome PDF Viewer'][i],
          description: ['Widevine Content Decryption Module', 'Portable Document Format', 'Chrome PDF Viewer'][i],
          filename: ['widevinecdm.dll', 'internal-pdf-viewer', 'mhjfbmdgcfjbbpaeojofohoefgiehjai'][i],
          length: 1,
          item: () => null
        }));
        
        // Mock webGL vendor and renderer
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
          if (parameter === 37445) return 'Intel Inc.';
          if (parameter === 37446) return 'Intel Iris OpenGL Engine';
          return getParameter.apply(this, [parameter]);
        };
      });
      
      // Randomize viewport slightly
      const viewportWidth = 1280 + Math.floor(Math.random() * 100);
      const viewportHeight = 720 + Math.floor(Math.random() * 100);
      await page.setViewport({ width: viewportWidth, height: viewportHeight });
      
      // Set a rotating user agent
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
      ];
      await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
      
    //   Wait a bit before visiting the site (like a human would)
      await randomDelay(1000, 3000);
      
      // Navigate to login page
      await page.goto(URL, { waitUntil: 'networkidle2' });
      
      // Human-like waiting and interaction
      await randomDelay(1000, 2000);
      
      // Fill in login credentials with human-like typing
      console.log("FILL IN EMAIL")
      await humanLikeType(page, '#customer_email', user_email);
      await randomDelay(500, 1500);
      console.log("FILL IN PASSWORD")
      await humanLikeType(page, '#customer_password', user_password);
      await randomDelay(800, 2000);
      
      // Click login button and wait for navigation
      await page.click('.c-button-action');

      await randomDelay(800, 2000);
      // Wait for potential captcha to appear
      try {
        await page.waitForSelector('iframe[src*="hcaptcha"], div[class*="captcha"]', { timeout: 8000 });
        console.log('Captcha detected! Please solve it manually in the browser.');
      } catch (error) {
        // No captcha found or timeout, continue
        console.log('No captcha detected or timeout occurred, proceeding...');
      }
      
      // Wait for successful login
      try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      } catch (error) {
        console.log('Navigation timeout or error. Checking login status...');
      }
      
      // Check if we're successfully logged in
      const isLoggedIn = await page.evaluate(() => {
        // This will depend on your site's structure - adjust accordingly
        return document.querySelector('.c-customer-info') !== null;
      });
      
      // Extract Cookies after saved
      if (isLoggedIn) {
        console.log('Successfully logged in!');
        // Extract and save cookies for future use
        const cookies = await page.cookies();
        const cookieFile = path.resolve('../src/data/cookies.json');
        await fs.writeFile(cookieFile, JSON.stringify(cookies, null, 2));
        console.log('Cookies saved to cookies.json');
      } else {
        console.log('Login status unclear or failed. Please check the browser.');
        
        // Let's capture a screenshot to see what happened
        await page.screenshot({ path: 'login-result.png' });
        console.log('Screenshot saved as login-result.png');
      }


      try{
        await page.goto(checkoutURL1);
        await randomDelay(800, 2000);

        // Due to data dome issue
        const addToCartButton = await page.$('#add-to-cart-product-template');

        // Then use evaluate on the element to trigger a native DOM click
        if (addToCartButton) {
          await addToCartButton.evaluate(el => el.click());
          console.log('Add to cart button clicked via DOM');
          await randomDelay(800, 2000);
        } else {
          console.log('Add to cart button not found');
        }

        await page.goto('https://sonnyangelusa.com/cart');
        await randomDelay(800, 2000);

        // Wait for the checkout button to be visible
        const checkoutButton = await page.$('.c-button.js-purchase-submit');
        await checkoutButton.evaluate(el => el.click());

        // Wait for the "Credit card" span element to appear
        await page.waitForSelector('._1fragemlo._1fragemsg');
        const preSaveUrl = await page.url();

        
        const filePathUrl = path.resolve('../src/data/preloadUrl.txt');
        await fs.writeFile(filePathUrl, JSON.stringify(preSaveUrl, null, 2));

        console.log("Back to cart to remove item");
        await page.goto(api_remove_item);
        await randomDelay(800, 2000);

        console.log("Successfuly save preload");
      } catch(e){
        console.log("Failed at save preload URL", e);
      }

    
    // Keep the browser open for inspection
      await browser.close();

    }
    

