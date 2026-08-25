/**
 * Finds the GatewayService implementation.
 */
const http = require('http');

http.get('http://isp.stores.michaels.com/webapp/main.bundle.js', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find getData implementation
    const idx = data.indexOf('getData = function');
    if (idx >= 0) {
      console.log('=== getData function ===');
      console.log(data.substring(idx, idx + 3000));
    }
    
    // Find PriceChecker reference
    const idx2 = data.indexOf('PriceChecker');
    if (idx2 >= 0) {
      console.log('\n=== PriceChecker context ===');
      console.log(data.substring(Math.max(0, idx2 - 200), idx2 + 500));
    }
    
    // Find jitems endpoint usage
    const idx3 = data.indexOf('jitems?description');
    if (idx3 >= 0) {
      console.log('\n=== lookupItems subscribe handler ===');
      // Look for how the response from lookupItems is handled
      const snippetStart = data.indexOf('lookupItems(', idx3);
      console.log(data.substring(Math.max(0, idx3 - 100), idx3 + 500));
    }
    
    // Find how lookupItems result is subscribed to
    const idx4 = data.indexOf('_this.itemsvc.lookupItems');
    if (idx4 < 0) {
      const idx4b = data.indexOf('itemsvc.lookupItems');
      if (idx4b >= 0) {
        console.log('\n=== lookupItems usage ===');
        console.log(data.substring(Math.max(0, idx4b - 100), idx4b + 2000));
      }
    } else {
      console.log('\n=== lookupItems usage (_this) ===');
      console.log(data.substring(Math.max(0, idx4 - 100), idx4 + 2000));
    }
  });
}).on('error', e => console.error(e.message));
