import urllib.request
import re

url = "https://grandstore.co.za/winefarm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        images = re.findall(r'<img[^>]+src="([^">]+)"', html)
        print("Images found in HTML:")
        for img in set(images):
            print(img)
            
        # Also check JS bundles
        scripts = re.findall(r'<script[^>]+src="([^">]+)"', html)
        print("\nScripts found:")
        for script in scripts:
            print(script)
except Exception as e:
    print("Error:", e)
