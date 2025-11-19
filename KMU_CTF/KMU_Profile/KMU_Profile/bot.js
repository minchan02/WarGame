const { firefox, webkit } = require('playwright');

const CONFIG = {
    APPNAME: process.env['APPNAME'] || "AdminBot",
    APPURL: process.env['APPURL'] || "http://localhost:3000",
    APPURLREGEX: process.env['APPURLREGEX'] || "^https?://localhost:3000.*$",
    APPFLAG: process.env['APPFLAG'] || "KMU{secret_flag_here}",
    APPLIMITTIME: Number(process.env['APPLIMITTIME'] || "60000"),
    APPLIMIT: Number(process.env['APPLIMIT'] || "5"),
    APPBROWSER: process.env['BROWSER'] || 'firefox',
    ADMIN_USER: process.env['ADMIN_USER'],
    ADMIN_PASSWORD: process.env['ADMIN_PASSWORD']
};

function sleep(s) {
    return new Promise((resolve) => setTimeout(resolve, s));
}

const browserArgs = {
    headless: true,
    args: [
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-gpu',
        '--disable-default-apps',
        '--disable-translate',
        '--disable-device-discovery-notifications',
        '--disable-software-rasterizer',
        '--disable-xss-auditor',
    ],
    ignoreHTTPSErrors: true
};

let initBrowser = null;

async function getContext() {
    if (initBrowser === null) {
        initBrowser = await (CONFIG.APPBROWSER === 'firefox' ? firefox.launch(browserArgs) : webkit.launch(browserArgs));
    }
    return await initBrowser.newContext();
}

console.log("Admin Bot started...");

module.exports = {
    name: CONFIG.APPNAME,
    urlRegex: CONFIG.APPURLREGEX,
    rateLimit: {
        windowMs: CONFIG.APPLIMITTIME,
        limit: CONFIG.APPLIMIT
    },
    bot: async (urlToVisit) => {
        const context = await getContext();
        try {
            const page = await context.newPage();
            
            // Navigate to login page
            await page.goto(`${CONFIG.APPURL}/index.html`, {
                waitUntil: 'load',
                timeout: 10 * 1000
            });
            
            // Login as admin using environment variables
            await page.fill('#username', CONFIG.ADMIN_USER);
            await page.fill('#password', CONFIG.ADMIN_PASSWORD);
            await page.click('button[type="submit"]');
            
            // Wait for login redirect
            await sleep(3000);
            
            // Visit the target URL
            await page.goto(urlToVisit, {
                waitUntil: 'load',
                timeout: 10 * 1000
            });
            
            await sleep(5000);
            
            // Also visit admin panel
            await page.goto(`${CONFIG.APPURL}/admin`, {
                waitUntil: 'load',
                timeout: 10 * 1000
            });
            
            await sleep(10000);
            
            return true;
        } catch (e) {
            console.error('❌ Bot error:', e.message);
            return false;
        } finally {
            await context.close();
        }
    }
};