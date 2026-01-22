
const https = require('https');

console.log('Fetching https://psycheverse.org/ ...');

https.get('https://psycheverse.org/', (resp) => {
  let data = '';

  resp.on('data', (chunk) => { data += chunk; });

  resp.on('end', () => {
    console.log('Response received. Length:', data.length);
    if (data.includes('psycheverse-banner.png')) {
      console.log('✅ Banner found in HTML!');
    } else {
      console.log('❌ Banner NOT found in HTML.');
      // Print a snippet of where the logo usually is
      const logoIndex = data.indexOf('psycheverse-logo.png');
      if (logoIndex !== -1) {
        console.log('⚠️ Found OLD logo instead!');
      }
    }
    
    if (data.includes('Mini Manson')) console.log('✅ Mini Manson found!');
    else console.log('❌ Mini Manson NOT found.');

    if (data.includes('Scribbles')) console.log('✅ Scribbles found!');
    else console.log('❌ Scribbles NOT found.');
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
