#!/usr/bin/env python3
"""Fill in missing tarot cards"""
import requests
import os

API_KEY = "sk-cp-1M0akjfjZvfWAQ7okNmjCd7N0FIj4oYxuvVJEh47q8THb1TQy0H1pE7ClHvaWCDaIOy45250WgKwh8YKa-sPKYWLJCus2hD8kG-Un3HRKCOk6e8402W9iVo"
API_URL = "https://api.minimax.chat/v1/image_generation"
OUTPUT_DIR = r"C:\Users\Administrator\Desktop\WishingMoon_许愿月亮\wishing-moon\public\tarot-cards"

missing_cards = [
    {"id": 17, "name": "The Tower", "prompt": "Ultra detailed tarot card of The Tower, magnificent tower struck by brilliant lightning bolt of white-gold, crown and pieces flying, two figures falling gracefully through air, dramatic purple and orange stormy sky, golden divine light breaking through clouds, chaotic yet beautiful destruction, Baroque dramatic composition, ornate card frame with lightning symbols"},
    {"id": 37, "name": "2 of Cups", "prompt": "Ultra detailed tarot card of Two of Cups, beautiful young couple in loving embrace, exchanging ornate goblets, flowing romantic red and white robes, elegant party behind, winged lion with harp above in golden light, rose and lily garlands, pink and gold romantic tones, Pre-Raphaelite romantic style, ornate card frame with lovers symbols"}
]

for card in missing_cards:
    output_path = os.path.join(OUTPUT_DIR, f"tarot_{card['id']:02d}.jpg")
    print(f"Generating {card['id']}: {card['name']}...")
    
    payload = {"model": "image-01", "prompt": card["prompt"]}
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    
    try:
        resp = requests.post(API_URL, json=payload, headers=headers, timeout=120)
        result = resp.json()
        
        if resp.status_code == 200 and result.get("base_resp", {}).get("status_code") == 0:
            image_url = result["data"]["image_urls"][0]
            img_resp = requests.get(image_url, timeout=60)
            if img_resp.status_code == 200:
                with open(output_path, "wb") as f:
                    f.write(img_resp.content)
                print(f"  Success: {len(img_resp.content)} bytes")
            else:
                print(f"  Download failed: {img_resp.status_code}")
        else:
            print(f"  API Error: {result}")
    except Exception as e:
        print(f"  Error: {str(e)[:100]}")
