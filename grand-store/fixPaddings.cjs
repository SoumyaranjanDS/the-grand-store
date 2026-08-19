const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'features/auction/AuctionLotDetail.jsx',
  'features/checkout/CheckoutPage.jsx',
  'features/checkout/OrderSuccessPage.jsx',
  'features/customer/UserAuctionDashboard.jsx',
  'features/events/EventDetails.jsx',
  'features/global/CountryPavilionPage.jsx',
  'features/vendor/EventAdd.jsx',
  'features/vendor/GlobalOnboardingLanding.jsx',
  'features/wine-farm/WineFarmPage.jsx',
];

const basePath = path.join(__dirname, 'frontend', 'src');

for (const file of filesToUpdate) {
  const fullPath = path.join(basePath, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    // Replace pt-24, pt-32, pt-20 when followed by space or quote
    content = content.replace(/\bpt-24\b/g, 'pt-8');
    content = content.replace(/\bpt-32\b/g, 'pt-10');
    content = content.replace(/\bpt-20\b/g, 'pt-8');

    // Also handle md:pt-32, etc.
    content = content.replace(/\bmd:pt-32\b/g, 'md:pt-12');
    content = content.replace(/\bmd:pt-24\b/g, 'md:pt-12');

    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated spacing in ${file}`);
    }
  }
}
console.log('Finished updating paddings.');
