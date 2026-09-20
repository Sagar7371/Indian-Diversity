const STATES = [
  {
    "name": "Andhra Pradesh",
    "language": "Telugu",
    "food": "Pulihora, Gongura Pachadi",
    "dress": "Kuchipudi costume sarees",
    "festival": "Ugadi",
    "art": "Kalamkari",
    "heritage": "Tirupati, Amaravati",
    "dance": "Kuchipudi",
    "region": "South",
    "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Arunachal Pradesh",
    "language": "Nyishi, Adi, Monpa",
    "food": "Thukpa, bamboo-shoot dishes",
    "dress": "Tribal shawls & beadwork",
    "festival": "Losar, Torgya",
    "art": "Bamboo & cane craft",
    "heritage": "Tawang Monastery",
    "dance": "Ponung",
    "region": "North-East",
    "image": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Assam",
    "language": "Assamese",
    "food": "Assam Tea, Khar, Masor Tenga",
    "dress": "Mekhela Chador",
    "festival": "Bihu",
    "art": "Muga silk weaving",
    "heritage": "Kaziranga, Kamakhya Temple",
    "dance": "Bihu",
    "region": "North-East",
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Bihar",
    "language": "Bhojpuri, Maithili, Hindi",
    "food": "Litti Chokha, Sattu",
    "dress": "Cotton sarees & dhoti",
    "festival": "Chhath Puja",
    "art": "Madhubani art",
    "heritage": "Bodh Gaya, Nalanda",
    "dance": "Jat-Jatin",
    "region": "East",
    "image": "https://images.unsplash.com/photo-1598091383021-15d8a8b7e7f1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Chhattisgarh",
    "language": "Chhattisgarhi",
    "food": "Chila, Faraa",
    "dress": "Tribal handwoven cotton",
    "festival": "Bastar Dussehra",
    "art": "Dhokra craft",
    "heritage": "Chitrakote Falls",
    "dance": "Panthi",
    "region": "Central",
    "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Goa",
    "language": "Konkani",
    "food": "Fish Curry Rice, Vindaloo",
    "dress": "Kunbi saree",
    "festival": "Goa Carnival",
    "art": "Azulejo tilework",
    "heritage": "Basilica of Bom Jesus",
    "dance": "Fugdi",
    "region": "West",
    "image": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Gujarat",
    "language": "Gujarati",
    "food": "Dhokla, Thepla, Undhiyu",
    "dress": "Chaniya Choli, Kediyu",
    "festival": "Navratri, Rann Utsav",
    "art": "Bandhani, Patola",
    "heritage": "Somnath, Rann of Kutch",
    "dance": "Garba",
    "region": "West",
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Haryana",
    "language": "Haryanvi, Hindi",
    "food": "Bajra Khichdi, Kadhi",
    "dress": "Ghagra with Phulkari dupatta",
    "festival": "Teej, Gugga Naumi",
    "art": "Phulkari embroidery",
    "heritage": "Kurukshetra",
    "dance": "Dhamal",
    "region": "North",
    "image": "https://images.unsplash.com/photo-1598091383021-15d8a8b7e7f1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Himachal Pradesh",
    "language": "Pahari, Hindi",
    "food": "Siddu, Dham",
    "dress": "Himachali cap & Chamba Rumal",
    "festival": "Kullu Dussehra",
    "art": "Chamba embroidery",
    "heritage": "Shimla, Manali",
    "dance": "Nati",
    "region": "North",
    "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Jharkhand",
    "language": "Santhali, Hindi",
    "food": "Dhuska, Pittha",
    "dress": "Panchi/Parhan attire",
    "festival": "Sarhul, Karma",
    "art": "Sohrai painting",
    "heritage": "Baidyanath Dham",
    "dance": "Chhau",
    "region": "East",
    "image": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Karnataka",
    "language": "Kannada",
    "food": "Bisi Bele Bath, Mysore Pak",
    "dress": "Mysore silk saree",
    "festival": "Mysuru Dasara",
    "art": "Channapatna toys",
    "heritage": "Hampi, Mysore Palace",
    "dance": "Yakshagana",
    "region": "South",
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Kerala",
    "language": "Malayalam",
    "food": "Appam, Puttu, Sadya",
    "dress": "Kasavu Saree/Mundu",
    "festival": "Onam",
    "art": "Mural painting",
    "heritage": "Backwaters, Munnar",
    "dance": "Kathakali",
    "region": "South",
    "image": "https://images.unsplash.com/photo-1598091383021-15d8a8b7e7f1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Madhya Pradesh",
    "language": "Hindi",
    "food": "Poha, Bhutte ka Kees",
    "dress": "Bagh print sarees",
    "festival": "Ujjain Kumbh",
    "art": "Gond art",
    "heritage": "Khajuraho, Sanchi Stupa",
    "dance": "Matki",
    "region": "Central",
    "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Maharashtra",
    "language": "Marathi",
    "food": "Puran Poli, Vada Pav, Misal",
    "dress": "Nauvari saree",
    "festival": "Ganesh Chaturthi",
    "art": "Warli art",
    "heritage": "Ajanta-Ellora, Gateway of India",
    "dance": "Lavani",
    "region": "West",
    "image": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Manipur",
    "language": "Manipuri",
    "food": "Eromba, Chak-hao",
    "dress": "Phanek & Innaphi",
    "festival": "Yaoshang",
    "art": "Dance costume weaving",
    "heritage": "Loktak Lake",
    "dance": "Manipuri",
    "region": "North-East",
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Meghalaya",
    "language": "Khasi, Garo",
    "food": "Jadoh, pork dishes",
    "dress": "Jainsem",
    "festival": "Wangala Festival",
    "art": "Bamboo & cane craft",
    "heritage": "Living Root Bridges",
    "dance": "Wangala",
    "region": "North-East",
    "image": "https://images.unsplash.com/photo-1598091383021-15d8a8b7e7f1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Mizoram",
    "language": "Mizo",
    "food": "Bai, bamboo-shoot dishes",
    "dress": "Puanchei",
    "festival": "Chapchar Kut",
    "art": "Puan textiles",
    "heritage": "Reiek, Champhai",
    "dance": "Cheraw",
    "region": "North-East",
    "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Nagaland",
    "language": "Naga dialects, English",
    "food": "Smoked pork, bamboo shoot",
    "dress": "Naga tribal shawls",
    "festival": "Hornbill Festival",
    "art": "Wood carving",
    "heritage": "Kohima",
    "dance": "Chang Lo",
    "region": "North-East",
    "image": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Odisha",
    "language": "Odia",
    "food": "Pakhala, Chhena Poda",
    "dress": "Sambalpuri saree",
    "festival": "Rath Yatra",
    "art": "Pattachitra",
    "heritage": "Konark Sun Temple, Puri",
    "dance": "Odissi",
    "region": "East",
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Punjab",
    "language": "Punjabi",
    "food": "Sarson da Saag, Makki di Roti",
    "dress": "Phulkari suit/Turban",
    "festival": "Baisakhi",
    "art": "Phulkari & Juti",
    "heritage": "Golden Temple",
    "dance": "Bhangra",
    "region": "North",
    "image": "https://images.unsplash.com/photo-1598091383021-15d8a8b7e7f1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Rajasthan",
    "language": "Rajasthani, Hindi",
    "food": "Dal Baati Churma, Gatte ki Sabzi",
    "dress": "Ghagra, Bandhani, Safa",
    "festival": "Teej, Desert Festival",
    "art": "Blue Pottery, Miniature Painting",
    "heritage": "Jaipur, Jodhpur, Jaisalmer",
    "dance": "Ghoomar",
    "region": "West",
    "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Sikkim",
    "language": "Nepali, Bhutia, Lepcha",
    "food": "Momos, Thukpa",
    "dress": "Bakhu",
    "festival": "Losar",
    "art": "Thangka painting",
    "heritage": "Rumtek Monastery",
    "dance": "Cham",
    "region": "North-East",
    "image": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Tamil Nadu",
    "language": "Tamil",
    "food": "Dosa, Sambar, Filter Coffee",
    "dress": "Kanjeevaram Saree, Veshti",
    "festival": "Pongal",
    "art": "Tanjore painting",
    "heritage": "Meenakshi Temple, Thanjavur",
    "dance": "Bharatanatyam",
    "region": "South",
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Telangana",
    "language": "Telugu",
    "food": "Hyderabadi Biryani, Sarva Pindi",
    "dress": "Pochampally Ikat saree",
    "festival": "Bathukamma",
    "art": "Nirmal & Cherial art",
    "heritage": "Charminar, Golconda Fort",
    "dance": "Perini",
    "region": "South",
    "image": "https://images.unsplash.com/photo-1598091383021-15d8a8b7e7f1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Tripura",
    "language": "Bengali, Kokborok",
    "food": "Mui Borok, bamboo dishes",
    "dress": "Rignai & Risa",
    "festival": "Kharchi Puja",
    "art": "Bamboo/cane craft",
    "heritage": "Ujjayanta Palace",
    "dance": "Hojagiri",
    "region": "North-East",
    "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Uttar Pradesh",
    "language": "Hindi, Urdu",
    "food": "Kebabs, Petha, Chaat",
    "dress": "Chikankari suits",
    "festival": "Kumbh Mela, Diwali",
    "art": "Chikankari, Zardozi",
    "heritage": "Taj Mahal, Varanasi",
    "dance": "Kathak",
    "region": "North",
    "image": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "Uttarakhand",
    "language": "Garhwali, Kumaoni",
    "food": "Aloo ke Gutke, Bal Mithai",
    "dress": "Pichora, Ghagra-Choli",
    "festival": "Haridwar Kumbh, Nanda Devi Mela",
    "art": "Aipan art",
    "heritage": "Kedarnath, Rishikesh",
    "dance": "Chholiya",
    "region": "North",
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "name": "West Bengal",
    "language": "Bengali",
    "food": "Macher Jhol, Rasgulla, Sandesh",
    "dress": "Tant/Garad saree, Dhoti-Panjabi",
    "festival": "Durga Puja",
    "art": "Kantha, Patachitra",
    "heritage": "Victoria Memorial, Sundarbans",
    "dance": "Baul",
    "region": "East",
    "image": "https://images.unsplash.com/photo-1598091383021-15d8a8b7e7f1?auto=format&fit=crop&w=1200&q=80"
  }
];


// public class Main {
//   public static void Main(String args[]) {
//     int arr[]= {10,20,30,40,50,60,70};
//     int left = 0; 
//     int right = arr.length-1;
//     int target=60;
//     boolean found = false;
//     while (left <= right ) {
//       int mid = (left +right-left)/2
//     }
//   }
// }