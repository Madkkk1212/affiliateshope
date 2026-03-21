import requests
import json

def test_v2():
    url = "https://shopee.co.id/api/v2/item/get?itemid=18783959388&shopid=362018996"
    headers = {
        "User-Agent": "ShopeeID/2.9.28 (com.shopee.id; build:2.9.28; iOS 14.4.0) Alamofire/5.0.0",
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print("v2 Status:", response.status_code)
        data = response.json()
        print(str(data)[:500])
    except Exception as e:
        print("v2 Failed:", e)

test_v2()
