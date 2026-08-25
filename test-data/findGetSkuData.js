/**
 * Extracts getSkuData function implementation from main.bundle.js
 */
const https = require('http');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const http = require('http');

http.get('http://isp.stores.michaels.com/webapp/main.bundle.js', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find getSkuData function
    const idx = data.indexOf('getSkuData = function');
    if (idx >= 0) {
      // Extract ~2000 chars around this function
      const snippet = data.substring(idx, idx + 2000);
      console.log('=== getSkuData function ===');
      console.log(snippet);
    }
    
    // Find ItemSearchComponent subscribe
    const idx2 = data.indexOf('this.itemsvc.getSkuData');
    if (idx2 >= 0) {
      const snippet2 = data.substring(Math.max(0, idx2 - 200), idx2 + 2000);
      console.log('\n=== ItemSearchComponent getSkuData usage ===');
      console.log(snippet2);
    }
    
    // Find the component that handles the search
    const idx3 = data.indexOf('_this._itemService.getSkuData');
    if (idx3 >= 0) {
      const snippet3 = data.substring(Math.max(0, idx3 - 100), idx3 + 3000);
      console.log('\n=== getSkuData usage in component ===');
      console.log(snippet3);
    }
  });
}).on('error', e => console.error(e.message));
