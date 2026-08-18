import urllib.request
import re

urls = [
    ("https://grandstore.co.za/trade/trade-export", "export_content.txt"),
    ("https://grandstore.co.za/trade/trade-procedures", "procedures_content.txt"),
    ("https://grandstore.co.za/trade/contact-us", "contact_content.txt")
]

for url, filename in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        # simple text extraction
        text = re.sub(r'<style.*?>.*?</style>', '', html, flags=re.DOTALL)
        text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"Saved {filename}")
    except Exception as e:
        print(f"Failed {url}: {e}")
