import urllib.request
import os

os.makedirs('public/assets/trade', exist_ok=True)

images = {
    "Trade_banner.jpg": "https://grandstore.co.za/public/trade/banner/Trade_banner.jpg",
    "maritime.jpeg": "https://grandstore.co.za/public/trade/home/maritime.jpeg",
    "5.png": "https://grandstore.co.za/public/trade/home/5.png",
    "6.png": "https://grandstore.co.za/public/trade/home/6.png",
    "7.png": "https://grandstore.co.za/public/trade/home/7.png",
    "8.png": "https://grandstore.co.za/public/trade/home/8.png",
    "Trade-logo.png": "https://grandstore.co.za/public/trade/logo/Trade-logo.png",
    "About_us.png": "https://grandstore.co.za/public/trade/about/About_us.png",
    "enquiry.jpeg": "https://grandstore.co.za/public/trade/enquiry/enquiry.jpeg"
}

for name, url in images.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(f"public/assets/trade/{name}", 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"Downloaded {name}")
    except Exception as e:
        print(f"Failed to download {name}: {e}")
