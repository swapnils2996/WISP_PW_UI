/**
 * Finds the advanced search and lookupItems handling.
 */
const http = require('http');

http.get('http://isp.stores.michaels.com/webapp/main.bundle.js', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find advancedSearchData usage
    const idx = data.indexOf('advancedSearchData = data');
    if (idx >= 0) {
      console.log('=== advancedSearchData context ===');
      console.log(data.substring(Math.max(0, idx - 500), idx + 2000));
    }
    
    // Find what follows after advancedSearchData is set
    const idx2 = data.indexOf('advancedSearchData');
    if (idx2 >= 0) {
      console.log('\n=== advancedSearchData usages ===');
      let pos = idx2;
      let count = 0;
      while (pos >= 0 && count < 5) {
        console.log(`  at ${pos}: ${data.substring(pos, pos + 200)}`);
        console.log('  ---');
        pos = data.indexOf('advancedSearchData', pos + 1);
        count++;
      }
    }
    
    // Find jitems endpoint handling
    const idx3 = data.indexOf('jitems?description');
    if (idx3 >= 0) {
      console.log('\n=== jitems subscribe ===');
      const subscribeIdx = data.indexOf('.subscribe(function', idx3);
      if (subscribeIdx >= 0) {
        console.log(data.substring(subscribeIdx, subscribeIdx + 3000));
      }
    }
    
    // Also find errorMessage = 'No items were found' context
    const idx4 = data.indexOf("errorMessage = 'No items were found'");
    if (idx4 >= 0) {
      console.log('\n=== No items found context ===');
      console.log(data.substring(Math.max(0, idx4 - 500), idx4 + 500));
    }
  });
}).on('error', e => console.error(e.message));
