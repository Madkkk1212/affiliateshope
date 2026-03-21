import requests
import json

url = "https://shopee.co.id/api/v4/item/get?itemid=18783959388&shopid=362018996"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://shopee.co.id/",
    "X-APi-Source": "pc"
}

try:
    response = requests.get(url, headers=headers, timeout=10)
    print("Status Code:", response.status_code)
    data = response.json()
    
    if "data" in data and data["data"]:
        item = data["data"]
        price = item.get("price")
        price_before_discount = item.get("price_before_discount")
        print(f"Price: {price}")
        print(f"Price Before: {price_before_discount}")
    else:
        print("Data not found:")
        print(str(data)[:500])
except Exception as e:
    print("Failed API fetch:", e)
