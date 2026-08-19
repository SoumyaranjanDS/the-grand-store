const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'features/auction/AuctionLotDetail.jsx',
  'features/checkout/CheckoutPage.jsx',
  'features/checkout/OrderSuccessPage.jsx',
  'features/customer/UserAuctionDashboard.jsx',
  'features/events/EventDetails.jsx',
  'features/events/EventsHub.jsx',
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

    // Replace all pt-8, pt-10, md:pt-12 etc with nothing or pt-0
    content = content.replace(/\bpt-8\b/g, 'pt-0');
    content = content.replace(/\bpt-10\b/g, 'pt-0');
    content = content.replace(/\bpt-12\b/g, 'pt-0');
    content = content.replace(/\bmd:pt-12\b/g, 'md:pt-0');
    content = content.replace(/\bmd:pt-8\b/g, 'md:pt-0');
    content = content.replace(/\bpt-0 md:pt-0\b/g, 'pt-0');

    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated spacing to 0 in ${file}`);
    }
  }
}
console.log('Finished updating paddings to 0.');
