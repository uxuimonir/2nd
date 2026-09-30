import type { MediaAsset } from "@/types/content";

/**
 * Photography registry.
 * Every file below is a real Wikimedia Commons file (verified by name). Images are served
 * from Commons' thumbnail CDN at runtime; authorship and licence live on each file page,
 * which the credits page links to. Replace or extend freely — components only use ids.
 */
const list: MediaAsset[] = [
  // ——— Heritage ———
  { id: "ahsan-manzil", file: "Ahsan-Manzil.jpg", alt: "The pink facade and dome of Ahsan Manzil on the bank of the Buriganga, Dhaka", kind: "photo", focal: "50% 45%" },
  { id: "ahsan-manzil-1888", file: "Ahsan_Manzil_1888.jpg", alt: "Archival photograph of Ahsan Manzil in 1888", kind: "archival" },
  { id: "lalbagh-pari-bibi", file: "Lalbagh_Fort,_Dhaka,_Bangladesh.jpg", alt: "The Tomb of Pari Bibi inside Lalbagh Fort, Dhaka", kind: "photo" },
  { id: "lalbagh-kella", file: "Lalbagh_Kella_(Lalbagh_Fort)_Dhaka_Bangladesh_2011_18.JPG", alt: "Mughal gateway and walls of Lalbagh Fort", kind: "photo" },
  { id: "lalbagh-1875", file: "Lalbagh_Fort,_south_entrance,_south_view_Dhaka_1875.jpg", alt: "Nineteenth-century photograph of Lalbagh Fort's south entrance", kind: "archival" },
  { id: "panam-city", file: "Panam_City,_an_ancient_historical_city_at_Sonargaon_(34).jpg", alt: "Weathered merchant houses lining the street of Panam City, Sonargaon", kind: "photo" },
  { id: "panam-nogor", file: "Panam_Nogor,_Sonargaon.jpg", alt: "Colonial-era facades of Panam Nagar", kind: "photo" },
  { id: "paharpur-aerial", file: "Paharpur_-_DJI_0792.jpg", alt: "Aerial view of the cruciform central shrine of Somapura Mahavihara, Paharpur", kind: "photo" },
  { id: "paharpur-vihara", file: "Paharpur_Buddhist_Vihara.jpg", alt: "Brick terraces of the Paharpur Buddhist monastery", kind: "photo" },
  { id: "sixty-dome", file: "Sixty_Dome_Mosque_in_Bagerhat_Bangladesh.JPG", alt: "The brick facade and domes of the Sixty Dome Mosque, Bagerhat", kind: "photo" },
  { id: "mahasthangarh-parshuram", file: "Palace_of_Parshuram,_Mahasthangarh,_Bogra,_September_2016_06.jpg", alt: "Excavated brick foundations at Mahasthangarh, Bogura", kind: "photo" },
  { id: "mahasthangarh-govinda", file: "Mahasthangar_Govinda_Bhita_Bogra_Bangladesh.JPG", alt: "Govinda Bhita temple mound at Mahasthangarh beside the Karatoya", kind: "photo" },
  { id: "shalban-vihara", file: "View_of_Shalban_Vihara,_Mainamati,_Comilla_01.jpg", alt: "Monastic cells around the courtyard of Shalban Vihara, Mainamati", kind: "photo" },
  { id: "kantajew", file: "Kantajew_Temple,_Dinajpur.jpg", alt: "Kantajew Temple, a terracotta-clad temple in Dinajpur", kind: "photo" },
  { id: "kantajew-terracotta", file: "Kantajew_Temple-Terracotta.jpg", alt: "Detail of terracotta panels at Kantajew Temple", kind: "photo" },
  { id: "parliament", file: "Jatiyo_Sangsad_Bhaban_or_National_Parliament_House.jpg", alt: "Louis Kahn's National Parliament House reflected in water, Dhaka", kind: "photo" },
  { id: "shaheed-minar", file: "Central_Shaheed_Minar_Dhaka_(8).jpg", alt: "The Central Shaheed Minar, Dhaka", kind: "photo" },
  { id: "smriti-soudho", file: "National_memorial_Savar.jpg", alt: "The seven triangular planes of the National Martyrs' Memorial, Savar", kind: "photo" },
  { id: "curzon-hall", file: "Curzon_Hall,_Dhaka_University,_Bangladesh.jpg", alt: "Curzon Hall, University of Dhaka", kind: "photo" },
  { id: "tajhat", file: "A_side_of_Tajhat_Landlord's_Palace_in_Rangpur,_Bangladesh.jpg", alt: "Tajhat Palace, Rangpur", kind: "photo" },
  { id: "shashi-lodge", file: "Shashi_Lodge_(Present_Teachers'_Training_College),_Mymensingh,_Bangladesh_25.JPG", alt: "Shashi Lodge, Mymensingh", kind: "photo" },

  // ——— Nature ———
  { id: "sundarbans-satellite", file: "Sundarbans_web_ESA362980.jpg", alt: "Satellite image of the Sundarbans mangrove delta", kind: "satellite" },
  { id: "sundarbans-kachikhali", file: "Mangrove_Forest_Kachikhali_Sundarban_National_Park_Bangladesh_-_panoramio_(7).jpg", alt: "Mangrove forest edge at Kachikhali in the Sundarbans", kind: "photo" },
  { id: "sundarbans-largest", file: "A_View_of_the_Largest_Mangrove_Forest_in_the_World.JPG", alt: "Tidal channel winding through the Sundarbans mangroves", kind: "photo" },
  { id: "sundarbans-mangrove", file: "Sundarban_mangrove.jpg", alt: "Pneumatophores and mangrove roots at low tide, Sundarbans", kind: "photo" },
  { id: "sundarbans-tiger", file: "Royal_Bengal_Tiger_in_Sundarbans_National_Park.jpg", alt: "A Royal Bengal tiger in the Sundarbans", kind: "photo" },
  { id: "sundarbans-tiger-canal", file: "Bengal_Tiger_gets_down_in_a_shallow_canal_in_Sundarban.jpg", alt: "A Bengal tiger stepping into a shallow tidal canal", kind: "photo" },
  { id: "coxs-bazar", file: "Cox's_Bazar_sea_beach.jpg", alt: "Waves along the long sandy shore of Cox's Bazar", kind: "photo" },
  { id: "coxs-bazar-dusk", file: "A_dusk_at_Cox's_Bazar_sea_beach.jpg", alt: "Dusk over Cox's Bazar beach", kind: "photo" },
  { id: "saint-martin", file: "Saint_Martin_Island_Bangladesh.jpg", alt: "Coconut palms and coral-strewn shore of Saint Martin's Island", kind: "photo" },
  { id: "saint-martin-blue", file: "Blue_waters_of_Saint_Martin_Island_,_Bangladesh.jpg", alt: "Clear blue water off Saint Martin's Island", kind: "photo" },
  { id: "ratargul", file: "Ratargul_Swamp_Forest,_Sylhet..jpg", alt: "Boat gliding between flooded trees in Ratargul Swamp Forest", kind: "photo" },
  { id: "sajek", file: "Sajek_Valley_Rangamati_3.jpg", alt: "Cloud-filled valleys seen from Sajek, Rangamati", kind: "photo" },
  { id: "nilgiri", file: "Nilgiri,_Bandarban,_Bangladesh_20.jpg", alt: "Layered green hills around Nilgiri, Bandarban", kind: "photo" },
  { id: "tea-srimangal", file: "Tea_Garden_Srimongol_Sylhet_Bangladesh_2.JPG", alt: "Rows of tea bushes under shade trees, Srimangal", kind: "photo", maxWidth: 1280 },
  { id: "tea-malnicherra", file: "Malnicherra_Tea_Garden_(Sylhet)_in_2021.01.jpg", alt: "Malnicherra Tea Garden, Sylhet", kind: "photo" },
  { id: "tanguar-haor", file: "Tanguar_haor,_Bangladesh_01.jpg", alt: "Open water and sky at Tanguar Haor wetland", kind: "photo" },
  { id: "jaflong", file: "Jaflong_sylhet.jpg", alt: "Stones and clear water of the river at Jaflong beneath the Meghalaya hills", kind: "photo" },

  // ——— Cities & modern life ———
  { id: "hatirjheel-night", file: "Night_view_of_Hatirjheel.jpg", alt: "Hatirjheel lake and bridges lit at night, Dhaka", kind: "photo" },
  { id: "dhaka-rickshaw-view", file: "Rickshaw_View_of_Dhaka.jpg", alt: "A Dhaka street seen from a cycle rickshaw", kind: "photo" },
  { id: "dhaka-rickshaw-parking", file: "Rickshaw_Parking_at_Dhaka_(9601873282).jpg", alt: "Painted cycle rickshaws parked together in Dhaka", kind: "photo" },
  { id: "rickshaw-wallah", file: "Cycle_rickshaw_wallah_in_Dhaka.jpg", alt: "A rickshaw puller at work in Dhaka", kind: "photo" },
  { id: "karnaphuli-night", file: "Karnaphuli_River_at_night_(02)_(cropped).jpg", alt: "Ships and lights on the Karnaphuli River at night, Chattogram", kind: "photo" },
  { id: "keane-bridge", file: "Keane_Bridge_and_Ali_Amjad's_Clock,_Sylhet.jpg", alt: "Keane Bridge over the Surma and Ali Amjad's Clock, Sylhet", kind: "photo" },
  { id: "rajshahi-padma", file: "Sunset_at_Padma_River,_Rajshahi_(1).jpg", alt: "Sunset over the Padma at Rajshahi", kind: "photo" },
  { id: "rajshahi-t-badh", file: "T-badh,_Padma_River_in_Rajshahi.jpg", alt: "The T-shaped embankment on the Padma, Rajshahi", kind: "photo" },
  { id: "rupsha-bridge", file: "Rupsha_bridge.jpg", alt: "Rupsha Bridge spanning the river at Khulna", kind: "photo" },
  { id: "barishal-launch", file: "Barisal_River_Port_Launch_Terminal_Bangladesh.jpg", alt: "Multi-deck river launches at Barishal river port", kind: "photo" },
  { id: "kirtankhola", file: "Kirtankhola_River,_Barisal.jpg", alt: "The Kirtankhola River at Barishal", kind: "photo" },
  { id: "metro-uttara", file: "Metro_Rail_Station_at_Uttara_Center_in_Dhaka,_Bangladesh.jpg", alt: "Elevated Dhaka Metro Rail station at Uttara", kind: "photo" },
  { id: "metro-motijheel", file: "Dhaka_Metro_Rail_Motijheel_Station_at_Night.jpg", alt: "Motijheel metro station at night", kind: "photo" },

  // ——— Rivers ———
  { id: "padma-bridge", file: "Padma_Bridge.jpg", alt: "The Padma Bridge stretching across the river", kind: "photo" },
  { id: "padma-bridge-night", file: "Night_view_of_Padma_Bridge_1.jpg", alt: "Padma Bridge illuminated at night", kind: "photo" },
  { id: "padma-boatman", file: "পদ্মা_নদীতে_নৌকা_ও_মাঝি.jpg", alt: "A boatman and his boat on the Padma", kind: "photo" },
  { id: "padma-daulatdia", file: "Boats_in_Padma_River_Daulatdia_Ghat_Rajbari_Bangladesh_(5).JPG", alt: "Boats at Daulatdia ghat on the Padma", kind: "photo" },
  { id: "jamuna-from-bridge", file: "A_view_of_Jamuna_River_from_Jamuna_Bridge.jpg", alt: "The wide braided Jamuna seen from the Jamuna Bridge", kind: "photo" },
  { id: "jamuna-bridge", file: "Jamuna_Bridge.jpg", alt: "The Jamuna Multipurpose Bridge", kind: "photo" },
  { id: "meghna-narsingdi", file: "Meghna_River,_Narsingdi.jpg", alt: "The Meghna at Narsingdi", kind: "photo" },
  { id: "teesta-barrage", file: "Teesta_Barrage_Bangladesh.jpg", alt: "The Teesta Barrage", kind: "photo" },
  { id: "surma", file: "05122009_River_Surma_Sylhet_photo2_Ranadipam_Basu.jpg", alt: "Boats on the Surma at Sylhet", kind: "photo" },
  { id: "sitalakhya", file: "BD_Sitalakhya_River.JPG", alt: "Boats on the Sitalakhya River", kind: "photo" },
  { id: "boats", file: "Boats_Bangladesh.JPG", alt: "Wooden country boats moored on a riverbank", kind: "photo" },

  // ——— People ———
  { id: "fishermen", file: "BD-fishermen.jpg", alt: "Fishermen hauling a net from a boat", kind: "photo" },
  { id: "paddy", file: "A_paddy_field_(rice_field)_in_bangladesh.jpg", alt: "A green paddy field in Bangladesh", kind: "photo" },
  { id: "rice-field", file: "Rice_Field.jpg", alt: "Farmers working in a rice field", kind: "photo" },
  { id: "jamdani-weaving", file: "Weaving_jamdani_at_BSCIC_Jamdani_palli,_Narayanganj_107.jpg", alt: "A weaver at a Jamdani handloom, Narayanganj", kind: "photo" },
  { id: "jamdani-weaving-2", file: "Weaving_jamdani_at_BSCIC_Jamdani_palli,_Narayanganj_75.jpg", alt: "Hands working the threads of a Jamdani loom", kind: "photo" },
  { id: "nakshi-kantha-maker", file: "Nakshi_Kantha_craftswoman.jpg", alt: "A craftswoman stitching a nakshi kantha", kind: "photo" },
  { id: "nakshi-kantha", file: "Nakshi_kantha_(Flower_motif).JPG", alt: "Close-up of nakshi kantha embroidery with flower motifs", kind: "photo" },
  { id: "potters", file: "The_pottery_workers.jpg", alt: "An artisan shaping clay pots at Bijoypur, Cumilla", kind: "photo" },
  { id: "pottery-drying", file: "Clay_Pottery_Drying.jpg", alt: "Clay pots drying in the sun, Munshiganj", kind: "photo" },
  { id: "pottery-art", file: "Pottery_art_of_Bangladesh.jpg", alt: "Hand-made terracotta pottery of Bangladesh", kind: "photo" },

  // ——— Culture ———
  { id: "mangal-shobhajatra", file: "Mangal_Shobhajatra_in_Dhaka.jpg", alt: "Giant folk-art masks in the Pohela Boishakh procession, Dhaka", kind: "photo" },
  { id: "mongol-shobhajatra-07", file: "Mongol_Shobhajatra,_Pohela_Boishakh_(07).jpg", alt: "Crowds and painted figures at the Pohela Boishakh procession", kind: "photo" },
  { id: "baul", file: "Baul_Folk_Artists.jpg", alt: "Baul folk artists performing", kind: "photo" },
  { id: "ektara", file: "Ektara.JPG", alt: "An ektara, the one-stringed instrument of the Bauls", kind: "photo" },
  { id: "language-movement-1952", file: "1952_Bengali_Language_movement.jpg", alt: "Procession on 21 February 1952 in Dhaka demanding Bangla as a state language", kind: "archival" },
  { id: "instrument-of-surrender", file: "Pakistani_Instrument_of_Surrender_(16_December_1971),_Copy_of_Document_in_the_Bangladesh_Military_Museum,_Dhaka.jpg", alt: "Copy of the Instrument of Surrender of 16 December 1971, Bangladesh Military Museum", kind: "document" },

  // ——— Food ———
  { id: "hilsa", file: "Ilish_(Hilsa)_fish.JPG", alt: "Fresh hilsa, the silver fish of the delta", kind: "photo" },
  { id: "hilsa-dhaka", file: "Hilsa_Fish_in_Dhaka-9_(cropped).jpg", alt: "Hilsa for sale at a market in Dhaka", kind: "photo" },
  { id: "kacchi", file: "Kacchi_Biryani.jpg", alt: "A plate of Old Dhaka kacchi biryani", kind: "photo" },
  { id: "bhuna-khichuri", file: "Bhuna_Khichuri_with_Chicken,_Vegetables,_Chili,_and_Lemon.jpg", alt: "Bhuna khichuri with chicken, chilli and lemon", kind: "photo" },
  { id: "fuchka", file: "Fuchka_Bengali_food_from_Rajshahi.jpg", alt: "Fuchka with tamarind water, Rajshahi", kind: "photo" },
  { id: "bhorta", file: "Bangladeshi_vorta_vat.jpg", alt: "Rice served with several kinds of bhorta", kind: "photo" },
  { id: "pitha-chitoi", file: "Egg_Chitoi_Pitha_from_Bangladesh.jpg", alt: "Chitoi pitha, a winter rice cake", kind: "photo" },
  { id: "pitha-nakshi", file: "Nakshi_Pitha_(নকশী_পিঠা).jpg", alt: "Nakshi pitha with carved patterns", kind: "photo" },
  { id: "chingri", file: "Prawn(chingri)_fish.jpg", alt: "Freshwater prawns (chingri)", kind: "photo" },
  { id: "mishti-mela", file: "Traditional_Mishti_at_Mishti_Mela_2024_62.jpg", alt: "Trays of traditional Bengali sweets at a mishti fair", kind: "photo" },
  { id: "mishti-doi", file: "Famous_Curd_of_Bogra_Bangladesh.jpg", alt: "Clay pots of Bogura's sweet curd", kind: "photo" },
  { id: "sandesh", file: "Bengali_Sandesh_-_1.jpg", alt: "Sandesh, a delicate sweet of fresh chhena", kind: "photo" },
  { id: "roshogolla", file: "Bengali_orange_rasgulla.jpg", alt: "Roshogolla in syrup", kind: "photo" },
];

export const media: Record<string, MediaAsset> = Object.fromEntries(list.map((m) => [m.id, m]));
export const mediaList = list;
