#!/usr/bin/env python3
"""
WishingMoon Tarot Card Image Generator - Vivid Version
Uses MiniMax API to generate 78 HIGH QUALITY tarot card images
"""

import requests
import json
import os
import time

API_KEY = "sk-cp-1M0akjfjZvfWAQ7okNmjCd7N0FIj4oYxuvVJEh47q8THb1TQy0H1pE7ClHvaWCDaIOy45250WgKwh8YKa-sPKYWLJCus2hD8kG-Un3HRKCOk6e8402W9iVo"
API_URL = "https://api.minimax.chat/v1/image_generation"
OUTPUT_DIR = r"C:\Users\Administrator\Desktop\WishingMoon_许愿月亮\wishing-moon\public\tarot-cards"

# Enhanced prompts - vivid, detailed, cinematic quality
TAROT_CARDS = [
    # Major Arcana (0-20) - Vivid, detailed illustrations
    {"id": 0, "name": "The Fool", "prompt": "Ultra detailed tarot card illustration of The Fool, a young wanderer with dreamy eyes standing at cliff edge, white rose in hand, moon rising dramatically, starry night sky swirling with cosmic colors, flowing cape, golden light rays, hyper-realistic painting style with mystical atmosphere, ornate golden card frame with celestial symbols"},
    {"id": 1, "name": "The Magician", "prompt": "Ultra detailed tarot card of The Magician, powerful figure at wooden altar displaying four elements (wand, cup, sword, coin), infinite symbol glowing above head, dramatic golden light rays, mystical smoke and sparkles, dark purple velvet background, Renaissance painting style with cinematic lighting, ornate golden card frame with mystical runes"},
    {"id": 2, "name": "The High Priestess", "prompt": "Ultra detailed tarot card of The High Priestess, mysterious woman in flowing silver-blue robes seated between black marble and white marble pillars, crescent moon glowing at her feet, ancient scroll in hands, deep ocean blue waters behind, starlit veil, ethereal and mystical atmosphere, chiaroscuro lighting, ornate silver card frame with moon symbols"},
    {"id": 3, "name": "The Empress", "prompt": "Ultra detailed tarot card of The Empress, goddess with flowing auburn hair wearing emerald crown, lush green throne, surrounded by abundant nature, ripe orchards, flowing stream, wheat fields, Venus symbol in sky, golden sunlight filtering through clouds, hyper-romantic painting style, rich warm colors, ornate golden card frame with nature motifs"},
    {"id": 4, "name": "The Emperor", "prompt": "Ultra detailed tarot card of The Emperor, powerful bearded king on imposing stone throne with rams heads, wearing crimson robes and golden crown, holding orb and scepter, fortress walls in background, dramatic red and gold lighting, commanding presence, Baroque painting style, ornate card frame with royal symbols"},
    {"id": 5, "name": "The Hierophant", "prompt": "Ultra detailed tarot card of The Hierophant, papal figure in elaborate gold and blue vestments, blessing hand raised, two monks kneeling before him, grand temple interior with marble columns, sacred geometry on floor, divine golden light from above, Renaissance art style, rich pigments, ornate card frame with religious symbols"},
    {"id": 6, "name": "The Lovers", "prompt": "Ultra detailed tarot card of The Lovers, naked couple embracing tenderly beneath radiant golden sun, cherry blossom tree above, white dove flying between them, divine golden rays streaming down, rose garden surroundings, romantic and divine atmosphere, soft pink and gold tones, hyper-realistic figurative painting, ornate golden card frame with heart symbols"},
    {"id": 7, "name": "The Chariot", "prompt": "Ultra detailed tarot card of The Chariot, triumphant warrior in shining silver armor, commanding black and white sphinxes, dramatic storm clouds parting to reveal victory, stars and cosmos visible, flowing banner with symbols, bronze chariot glinting, intense determined expression, cinematic dramatic lighting, dark purple and gold palette, ornate card frame with triumph symbols"},
    {"id": 8, "name": "Strength", "prompt": "Ultra detailed tarot card of Strength, serene woman with flowing golden hair gently opening lion's mouth, dawn breaking behind, olive branch in her other hand, warm golden sunlight bathes scene, spiritual aura surrounding her, delicate yet powerful pose, impressionistic brushstrokes, warm amber and gold tones, ornate card frame with lion symbols"},
    {"id": 9, "name": "The Hermit", "prompt": "Ultra detailed tarot card of The Hermit, wise sage in simple grey robes with lantern glowing bright yellow, single six-pointed star inside illuminating weathered face, snow-covered mountain path ahead, vast starry night sky with Milky Way, peaceful solitude atmosphere, cool blue and silver tones, Dutch Master painting style, ornate silver card frame with star symbols"},
    {"id": 10, "name": "Wheel of Fortune", "prompt": "Ultra detailed tarot card of Wheel of Fortune, massive mystical wheel covered in ancient symbols (zodiac, runes, Hebrew letters), four figures at cardinal points rising and falling, cosmic energy swirling, deep purple sky with stars and nebula, golden and violet energy rays, dramatic perspective, mystical atmosphere, ornate card frame with cosmic symbols"},
    {"id": 11, "name": "Justice", "prompt": "Ultra detailed tarot card of Justice, majestic woman in flowing white robes with perfect posture, sharp sword raised, perfectly balanced gold scales, blindfold with subtle smile, grand marble temple with blue sky above, dramatic chiaroscuro lighting, silver and gold palette, Renaissance classical painting style, ornate card frame with scales and sword motifs"},
    {"id": 12, "name": "The Hanged Man", "prompt": "Ultra detailed tarot card of The Hanged Man, serene young man hanging upside-down from golden T-cross, peaceful meditative expression, halo of soft white light around his head, cosmic blue and gold background with floating geometric shapes, sacred geometry patterns, contemplative stillness, Art Nouveau style with flowing lines, ornate card frame with spiral patterns"},
    {"id": 13, "name": "Death", "prompt": "Ultra detailed tarot card of Death, elegant skeletal knight in polished black armor riding powerful black horse, dawn breaking with golden-pink sky, armored skeletal hand holding black banner, fallen figures rising transformed into angels, not frightening but transformative, purple and gold dramatic lighting, cinematic composition, ornate card frame with transformation symbols"},
    {"id": 14, "name": "Temperance", "prompt": "Ultra detailed tarot card of Temperance, beautiful angel in flowing white and pink robes, one foot in crystal water one on land, graceful as she pours luminous liquid between two ornate chalices, magnificent rainbow arching overhead, garden of Eden atmosphere, serene expression, Pre-Raphaelite beauty, soft pastels and gold, ornate card frame with rainbow motifs"},
    {"id": 15, "name": "The Devil", "prompt": "Ultra detailed tarot card of The Devil, handsome horned figure seated on dark stone altar, wings folded elegantly, flames flickering orange and gold at base, chains with heart-shaped locks at feet, alluring yet warning presence, mysterious smile, deep crimson and black tones, dramatic chiaroscuro, Old Master painting style, ornate dark card frame with flame patterns"},
    {"id": 16, "name": "The Tower", "prompt": "Ultra detailed tarot card of The Tower, magnificent tower struck by brilliant lightning bolt of white-gold, crown and pieces flying, two figures falling gracefully through air, dramatic purple and orange stormy sky, golden divine light breaking through clouds, chaotic yet beautiful destruction, Baroque dramatic composition, ornate card frame with lightning symbols"},
    {"id": 17, "name": "The Star", "prompt": "Ultra detailed tarot card of The Star, gloriously nude woman kneeling by silver pool, one jar pouring crystal water into pool, other into earth, seven brilliant stars above forming constellation, central large star blazing with 16 rays, lush garden surroundings, silver and opalescent tones, ethereal luminous atmosphere, Art Nouveau goddess style, ornate silver card frame with star patterns"},
    {"id": 18, "name": "The Moon", "prompt": "Ultra detailed tarot card of The Moon, luminous full moon with detailed face glowing in night sky, wolf and dog silhouetted howling at moon, mysterious crayfish emerging from dark water, winding path leading to distant mountains, lotus flowers on water, deep indigo and silver tones, mysterious mist rising, Romantic landscape painting style, ornate silver card frame with lunar symbols"},
    {"id": 19, "name": "The Sun", "prompt": "Ultra detailed tarot card of The Sun, magnificent radiant sun with detailed face, corona of golden rays blazing, golden-haired child on beautiful white horse, triumphant pose, sunflowers and corn fields surrounding, warm flowing river, vivid yellow and orange tones, joyful triumphant atmosphere, classical figurative painting, ornate golden card frame with sunburst pattern"},
    {"id": 20, "name": "Judgement", "prompt": "Ultra detailed tarot card of Judgement, mighty angel with luminous wings trumpeting from heavenly clouds, radiant white light descending, diverse figures rising from open graves, arms raised in resurrection, transformed and glowing, pure white and gold divine light, emotional and spiritual atmosphere, classical composition, ornate card frame with trumpet and angel motifs"},
    {"id": 21, "name": "The World", "prompt": "Ultra detailed tarot card of The World, ethereal dancing figure in center of large laurel wreath, four mystical creatures at corners (angel-human, eagle, lion, bull), cosmic energy swirling, deep cosmic purple background with stars and nebula, figure in transcendent dance pose, completion and transcendence, Art Nouveau decorative style, ornate golden card frame with zodiac symbols"},
    
    # Wands (22-35) - Fire, passion, creativity - Vivid
    {"id": 22, "name": "Ace of Wands", "prompt": "Ultra detailed tarot card of Ace of Wands, mighty hand emerging from dramatic golden cloud, perfect柳杖 emanating orange flames, lush green leaves budding at top, brilliant flame of creative fire, dark warm background, dynamic energy radiating outward, vivid orange and gold tones, ornate golden card frame with flame patterns"},
    {"id": 23, "name": "2 of Wands", "prompt": "Ultra detailed tarot card of Two of Wands, handsome figure in elegant coat standing on grand balcony, overlooking vast colorful world map, two ornate wands flanking, distant ships on shimmering sea, planet Earth visible in sky, adventurous spirit, warm sunset colors, Romantic landscape, ornate card frame with globe motifs"},
    {"id": 24, "name": "3 of Wands", "prompt": "Ultra detailed tarot card of Three of Wands, confident seafarer on cliff edge, three tall ships with billowing sails approaching from ocean, majestic mountain range behind, golden dawn breaking, hope and anticipation, purple and gold dawn sky, dynamic perspective, oil painting style, ornate card frame with ships"},
    {"id": 25, "name": "4 of Wands", "prompt": "Ultra detailed tarot card of Four of Wands, magnificent flower-covered archway, joyful celebration with happy couple in finest robes, other figures dancing, feast table abundant with fruit, distant castle celebration, fireworks in purple sky, warm festive atmosphere, classical celebration scene, ornate card frame with flower garlands"},
    {"id": 26, "name": "5 of Wands", "prompt": "Ultra detailed tarot card of Five of Wands, five knights in gleaming armor with ornate lances, dramatic dusty battlefield, heraldic shields decorated, dynamic chaotic composition, warm browns and golds, intense competition, Baroque painting style with movement, ornate card frame with crossed wands"},
    {"id": 27, "name": "6 of Wands", "prompt": "Ultra detailed tarot card of Six of Wands, triumphant golden-armored knight on magnificent white horse, laurel wreath above, cheering crowds throwing flowers, ornate wands decorated with ribbons, victory archway, golden light streaming, warm celebratory atmosphere, classical figurative painting, ornate card frame with laurel wreath"},
    {"id": 28, "name": "7 of Wands", "prompt": "Ultra detailed tarot card of Seven of Wands, brave warrior on hilltop defending with wand-sword, dynamic pose, cape flowing in wind, five attackers below looking up, determined fierce expression, dramatic stormy sky, purple and grey tones, heroic struggle, cinematic composition, ornate card frame with defense motifs"},
    {"id": 29, "name": "8 of Wands", "prompt": "Ultra detailed tarot card of Eight of Wands, eight perfect柳杖 soaring through bright blue sky in perfect formation, motion blur effect, sunny meadow below, brilliant white and gold wands, velocity and excitement, impressionistic style with movement, vivid blue and orange tones, ornate card frame with flying wands"},
    {"id": 30, "name": "9 of Wands", "prompt": "Ultra detailed tarot card of Nine of Wands, weathered but fierce warrior with bandaged head, surrounded by eight wands, final defense, twilight sky purple and orange, determined heroic pose, battle-worn cape, resilience and perseverance, dramatic lighting, classical oil painting, ornate card frame with warrior motifs"},
    {"id": 31, "name": "10 of Wands", "prompt": "Ultra detailed tarot card of Ten of Wands, strong laborer bending under ten heavy wands, struggling but determined, dusty road ahead, harsh midday sun, brown and gold tones, burden and responsibility, Renaissance chiaroscuro, powerful figurative painting, ornate card frame with burden symbols"},
    {"id": 32, "name": "Page of Wands", "prompt": "Ultra detailed tarot card of Page of Wands, confident young explorer with ornate wand, mythical lizard companion, dramatic volcanic landscape, adventure unfolding, orange and green tones, dynamic pose, curious expression, Art Nouveau illustration style, ornate card frame with explorer motifs"},
    {"id": 33, "name": "Knight of Wands", "prompt": "Ultra detailed tarot card of Knight of Wands, dashing armored knight on powerful dark horse charging forward, wand shaped like fire lance, flame mane and tail, motion blur, dramatic sunset sky orange and purple, heroic gallop, bold and passionate energy, cinematic dynamic composition, ornate card frame with flame patterns"},
    {"id": 34, "name": "Queen of Wands", "prompt": "Ultra detailed tarot card of Queen of Wands, powerful queen on magnificent throne decorated with lions and sunflowers, holding perfect wand, flame in crown, fierce yet kind expression, red and gold robes, golden background with sun rays, commanding presence, classical figurative portrait, ornate golden card frame with lion motifs"},
    {"id": 35, "name": "King of Wands", "prompt": "Ultra detailed tarot card of King of Wands, majestic crowned king on throne with ornate wand, salamander emblem on throne, rich crimson and gold robes, wise commanding expression, throne room with tapestries, golden light, Renaissance portrait style, powerful authoritative presence, ornate golden card frame with crown"},
    
    # Cups (36-49) - Water, emotion, love - Vivid
    {"id": 36, "name": "Ace of Cups", "prompt": "Ultra detailed tarot card of Ace of Cups, divine luminous hand from golden cloud offering magnificent chalice, crystal clear water overflowing, brilliant white dove descending with host, radiant heart floating above, divine love pouring forth, deep blue and silver tones, heavenly light rays, sacred mystical atmosphere, ornate silver card frame with dove and heart"},
    {"id": 37, "name": "Two of Cups", "prompt": "Ultra detailed tarot card of Two of Cups, beautiful young couple in loving embrace, exchanging ornate goblets, flowing romantic red and white robes, elegant party behind, winged lion with harp above in golden light, rose and lily garlands, pink and gold romantic tones, Pre-Raphaelite romantic style, ornate card frame with lovers' symbols"},
    {"id": 38, "name": "Three of Cups", "prompt": "Ultra detailed tarot card of Three of Cups, three joyful women in flowing gowns dancing in circle, raised crystal cups, abundant fruit and flowers scattered, grapes hanging from above, golden wine flowing, purple and pink festive tones, celebration and sisterhood, Rococo painting style, ornate card frame with grape vines"},
    {"id": 39, "name": "Four of Cups", "prompt": "Ultra detailed tarot card of Four of Cups, contemplative youth seated under ancient twisted tree, three ornate cups before, glowing mystical cup appearing from cloud above, distant dark storm clouds, moody indigo and purple tones, apathy and contemplation, Romantic melancholy atmosphere, ornate card frame with contemplative motifs"},
    {"id": 40, "name": "Five of Cups", "prompt": "Ultra detailed tarot card of Five of Cups, cloaked figure with anguished expression, five golden cups spilled with dark water flowing out, two cups still standing behind, rain and dark water around, purple-grey stormy sky, dramatic lighting from behind, grief and loss, Baroque emotional intensity, ornate card frame with flowing water"},
    {"id": 41, "name": "Six of Cups", "prompt": "Ultra detailed tarot card of Six of Cups, tender scene of elegantly dressed figures exchanging cups, mystical child with beautiful flower, nostalgic music sheet, Renaissance garden setting, warm amber and pink tones, innocent memories, classical figurative painting, ornate card frame with roses and cups"},
    {"id": 42, "name": "Seven of Cups", "prompt": "Ultra detailed tarot card of Seven of Cups, mysterious robed figure before seven floating luminous chalices, each containing glowing objects (dragon, serpent, castle, jewels, laurel wreath, figure hooded, lightning), swirling purple mist, fantasy and illusion, dreamlike atmosphere, Art Nouveau mystical style, ornate card frame with dream symbols"},
    {"id": 43, "name": "Eight of Cups", "prompt": "Ultra detailed tarot card of Eight of Cups, solitary hooded figure walking away on misty mountain path, eight golden cups stacked against ancient ruins behind, large luminous full moon reflecting on water below, emotional departure, cool blue and silver tones, melancholy beauty, Romantic landscape painting, ornate card frame with moon and path"},
    {"id": 44, "name": "Nine of Cups", "prompt": "Ultra detailed tarot card of Nine of Cups, jolly confident man with luxurious beard, nine magnificent golden cups arranged behind like crown, rich tavern setting, satisfied expression, burgundy and gold tones, emotional wish fulfillment, Old Masters style with warmth, ornate card frame with cups pattern"},
    {"id": 45, "name": "Ten of Cups", "prompt": "Ultra detailed tarot card of Ten of Cups, beautiful family with happy children dancing below magnificent rainbow, ten golden cups forming arc, stone cottage with smoke rising, village in golden sunset distance, love and harmony, warm domestic scene, classical figurative family painting, ornate card frame with rainbow"},
    {"id": 46, "name": "Page of Cups", "prompt": "Ultra detailed tarot card of Page of Cups, dreamy young figure in blue-green robes by mystical shore, ornate cup containing magical golden fish, waves sparkling, moonlit ocean, cute playful lobster companion, teal and silver tones, intuitive creativity, Art Nouveau illustration style, ornate card frame with waves and fish"},
    {"id": 47, "name": "Knight of Cups", "prompt": "Ultra detailed tarot card of Knight of Cups, romantic knight on elegant white horse, flowing banner with heart and wing motif, dramatic coastal scene, large moon reflecting on ocean waves, azure and purple tones, emotional quest, dreamlike romantic atmosphere, classical oil painting, ornate card frame with heart"},
    {"id": 48, "name": "Queen of Cups", "prompt": "Ultra detailed tarot card of Queen of Cups, serene powerful queen on magnificent throne by sea, holding large ornate chalice with hearts, crown of pearls and shells, beautiful mermaids in water below, deep blue and silver tones, compassionate and intuitive, classical portrait with ocean setting, ornate silver card frame with shell motifs"},
    {"id": 49, "name": "King of Cups", "prompt": "Ultra detailed tarot card of King of Cups, wise mature king on throne with stylized waves, throne decorated with water symbols and winged bulls, holding ceremonial cup, deep blue and gold robes, emotionally balanced and kind, rich jewel tones, authoritative yet peaceful, Renaissance portrait style, ornate card frame with crown and waves"},
    
    # Swords (50-63) - Air, intellect, conflict - Vivid
    {"id": 50, "name": "Ace of Swords", "prompt": "Ultra detailed tarot card of Ace of Swords, mighty hand from golden crown reaching down, perfect gleaming sword pointing upward, crown of thorns glowing above, brilliant white light emanating, deep blue and silver tones, intellectual breakthrough, sacred geometric patterns forming, mystical atmosphere, ornate silver card frame with crown and sword"},
    {"id": 51, "name": "Two of Swords", "prompt": "Ultra detailed tarot card of Two of Swords, blindfolded graceful woman in white, two perfectly balanced silver swords crossed, elegant damsel, large romantic moon behind, deep blue and pearl white tones, balanced tension, mysterious atmosphere, classical figurative painting, ornate card frame with balanced scales"},
    {"id": 52, "name": "Three of Swords", "prompt": "Ultra detailed tarot card of Three of Swords, magnificent crimson heart pierced by three silver swords, dramatic rain from grey clouds above, lightning in background, deep indigo and silver tones, heartbreaking intensity, Baroque emotional drama, powerful figurative composition, ornate card frame with heart and swords"},
    {"id": 53, "name": "Four of Swords", "prompt": "Ultra detailed tarot card of Four of Swords, armored knight lying on stone tomb, four swords pointing down above, hands in prayer, magnificent stained glass window above showing peaceful religious scene, cool blue and grey tones, meditation and rest, Gothic cathedral atmosphere, ornate card frame with window motifs"},
    {"id": 54, "name": "Five of Swords", "prompt": "Ultra detailed tarot card of Five of Swords, smug victor carrying two swords walking away, two defeated figures in background, heraldic shields on ground, grey twilight sky, moral ambiguity, dramatic composition, muted grey and steel tones, Renaissance narrative painting, ornate card frame with crossed swords"},
    {"id": 55, "name": "Six of Swords", "prompt": "Ultra detailed tarot card of Six of Swords, graceful figure in boat draped with blue cloth, six silver swords in boat, calm grey-blue water, distant sunny shore appearing through mist, passage to better times, cool tones with hope, Romantic landscape painting, ornate card frame with boat and oar"},
    {"id": 56, "name": "Seven of Swords", "prompt": "Ultra detailed tarot card of Seven of Swords, cunning figure with three swords, sneaking away with two on back, five remaining in camp, shadowy night, plan revealed, grey-blue night tones with moonlight, strategic deception, Baroque dramatic scene, ornate card frame with stealth motifs"},
    {"id": 57, "name": "Eight of Swords", "prompt": "Ultra detailed tarot card of Eight of Swords, delicate woman bound with eight silver swords in circle, some fallen, exquisite butterfly above seeking freedom, light breaking through clouds, white and indigo tones, restriction yet hope, Baroque composition with emotional tension, ornate card frame with butterfly"},
    {"id": 58, "name": "Nine of Swords", "prompt": "Ultra detailed tarot card of Nine of Swords, anguished figure seated with head in hands, nine swords hovering overhead creating oppressive pattern, deep purple and grey night sky, deep emotional anxiety, dramatic chiaroscuro, Baroque emotional intensity, ornate card frame with swords overhead"},
    {"id": 59, "name": "Ten of Swords", "prompt": "Ultra detailed tarot card of Ten of Swords, fallen warrior on battlefield, ten swords broken beneath, radiant sun rising behind over calm water, purple and gold dawn, rock bottom yet sunrise hope, dramatic Romantic composition, Old Master style, ornate card frame with sunrise"},
    {"id": 60, "name": "Page of Swords", "prompt": "Ultra detailed tarot card of Page of Swords, alert young figure in blue-green tunic, sword raised ready, wind and clouds swirling, mountain peak in background, grey and teal tones, truth seeking, watchful intelligence, Art Nouveau dynamic pose, ornate card frame with wind motifs"},
    {"id": 61, "name": "Knight of Swords", "prompt": "Ultra detailed tarot card of Knight of Swords, charging knight in full armor with sword, powerful white horse thundering, storm clouds dramatically parting, intense determination, grey and silver tones with lightning, dynamic action, Baroque composition with movement, ornate card frame with storm"},
    {"id": 62, "name": "Queen of Swords", "prompt": "Ultra detailed tarot card of Queen of Swords, beautiful stern woman on throne with sharp sword, winter landscape behind, crystal crown with butterflies, wise and piercing gaze, silver and grey with touches of pink, clear thinking, classical portrait with symbolism, ornate silver card frame with sword"},
    {"id": 63, "name": "King of Swords", "prompt": "Ultra detailed tarot card of King of Swords, powerful bearded king on majestic throne with ornate sword, throne with sacred bees, penetrating intelligent gaze, rich purple and silver robes, truth and justice, authoritative mastery, Renaissance portrait with power, ornate golden card frame with crown and bee"},
    
    # Pentacles (64-77) - Earth, material, work - Vivid
    {"id": 64, "name": "Ace of Pentacles", "prompt": "Ultra detailed tarot card of Ace of Pentacles, divine hand from golden cloud holding perfect golden pentacle, garden of eden beyond arch, roses and mystical symbols, brilliant divine light, prosperity and new opportunity, rich greens and gold, sacred geometry, ornate golden card frame with garden motifs"},
    {"id": 65, "name": "Two of Pentacles", "prompt": "Ultra detailed tarot card of Two of Pentacles, joyful jester-like figure dancing, two large golden coins with ribbons intertwined, flowing轻松的 motion, colorful medieval ship sailing on rough sea behind, warm brown and gold tones, adaptability and fun, Baroque playful composition, ornate card frame with ship and ribbons"},
    {"id": 66, "name": "Three of Pentacles", "prompt": "Ultra detailed tarot card of Three of Pentacles, master architect in fine robes with compass and ruler, two monks consulting plans, grand cathedral being built with workers, purple and brown rich tones, skilled craftsmanship, Renaissance workshop scene, ornate card frame with cathedral"},
    {"id": 67, "name": "Four of Pentacles", "prompt": "Ultra detailed tarot card of Four of Pentacles, wealthy merchant in burgundy robes hugging four golden coins close, protective posture, castle and goods around, gold and dark tones, security and control, Renaissance portrait with materialism, ornate card frame with coins"},
    {"id": 68, "name": "Five of Pentacles", "prompt": "Ultra detailed tarot card of Five of Pentacles, two tired pilgrims in snow past church with warm light in windows, fluorescent glow, dramatic contrast, spiritual poverty yet hope, cool blue and warm gold, Baroque romantic landscape, ornate card frame with church light"},
    {"id": 69, "name": "Six of Pentacles", "prompt": "Ultra detailed tarot card of Six of Pentacles, generous noble in purple robes weighing gold coins on scale, grateful beggars receiving, balanced giving and receiving, rich purple and gold tones, charity and sharing, classical figurative painting, ornate card frame with scales"},
    {"id": 70, "name": "Seven of Pentacles", "prompt": "Ultra detailed tarot card of Seven of Pentacles, weary gardener leaning on pentacle, flourishing garden behind showing past effort, purple twilight sky, patience and long-term vision, earthy browns and greens, Renaissance pastoral scene, ornate card frame with garden"},
    {"id": 71, "name": "Eight of Pentacles", "prompt": "Ultra detailed tarot card of Eight of Pentacles, dedicated craftsman intently carving pentacles on ornate shields, workshop setting with tools, purple and gold tones, apprenticeship and mastery, detailed Renaissance scene, ornate card frame with tools and shields"},
    {"id": 72, "name": "Nine of Pentacles", "prompt": "Ultra detailed tarot card of Nine of Pentacles, wealthy elegant woman in silk gown among abundant grapevines, golden coins scattered, pet bird on hand, lush retirement, rich green and gold tones, self-sufficiency and luxury, Pre-Raphaelite beauty, ornate golden card frame with grapes"},
    {"id": 73, "name": "Ten of Pentacles", "prompt": "Ultra detailed tarot card of Ten of Pentacles, noble grandfather blessing with beautiful family beneath grand arch, ten golden coins in arch, wealthy estate behind, generations and legacy, rich purple and gold tones, classical family scene, ornate card frame with family"},
    {"id": 74, "name": "Page of Pentacles", "prompt": "Ultra detailed tarot card of Page of Pentacles, eager young scholar kneeling, presenting perfect pentacle, mystical scroll nearby, verdant countryside with castle on hill, ambition and opportunity, green and brown tones, eager learning, Art Nouveau illustration, ornate card frame with scroll"},
    {"id": 75, "name": "Knight of Pentacles", "prompt": "Ultra detailed tarot card of Knight of Pentacles, reliable knight on sturdy horse moving at steady pace, pentacle on shield, peaceful productive countryside, brown and gold tones, patience and productivity, methodical progress, classical equine portrait, ornate card frame with shield"},
    {"id": 76, "name": "Queen of Pentacles", "prompt": "Ultra detailed tarot card of Queen of Pentacles, nurturing queen on throne with baby and golden coin, throne decorated with森林 and mushrooms, abundance all around, green and gold elegant robes, earthy and nurturing, classical portrait with abundance, ornate card frame with forest"},
    {"id": 77, "name": "King of Pentacles", "prompt": "Ultra detailed tarot card of King of Pentacles, powerful mature king on magnificent throne with golden coin and harvest, throne with bull emblem and luxe textiles, ripe orchard and estate behind, richest greens and golds, mastery of material world, authoritative and prosperous, Renaissance portrait style, ornate golden card frame with crown and bull"},
]

def generate_card_image(card_info, output_path):
    """Generate a single tarot card image - vivid and detailed"""
    payload = {
        "model": "image-01",
        "prompt": card_info["prompt"]
    }
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print(f"Generating {card_info['id']}: {card_info['name']}...")
    
    try:
        response = requests.post(API_URL, json=payload, headers=headers, timeout=120)
        result = response.json()
        
        if response.status_code == 200 and result.get("base_resp", {}).get("status_code") == 0:
            image_url = result["data"]["image_urls"][0]
            
            img_response = requests.get(image_url, timeout=60)
            if img_response.status_code == 200:
                with open(output_path, "wb") as f:
                    f.write(img_response.content)
                print(f"  Success: {output_path} ({len(img_response.content)} bytes)")
                return True
            else:
                print(f"  Download failed: {img_response.status_code}")
                return False
        else:
            print(f"  API Error: {result.get('base_resp', {}).get('status_msg', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"  Error: {str(e)[:100]}")
        return False

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"Starting VIVID tarot card generation for {len(TAROT_CARDS)} cards...")
    
    success = 0
    failed = 0
    
    for i, card in enumerate(TAROT_CARDS):
        output_path = os.path.join(OUTPUT_DIR, f"tarot_{card['id']:02d}.jpg")
        
        if os.path.exists(output_path) and os.path.getsize(output_path) > 50000:
            print(f"Skipping {card['id']} (exists)")
            success += 1
            continue
        
        if generate_card_image(card, output_path):
            success += 1
        else:
            failed += 1
        
        time.sleep(2)
    
    print(f"\n=== Complete! Success: {success}, Failed: {failed} ===")

if __name__ == "__main__":
    main()
