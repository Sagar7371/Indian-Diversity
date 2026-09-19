import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import indiaMap from '@svg-maps/india';
import { Search, ArrowRight, Menu, Languages, Utensils, Crown, Music, Palette, Landmark, BookOpen, CalendarDays, Shuffle, X, ExternalLink, Building2, Users, Shield, Mail, Instagram } from 'lucide-react';
import './styles.css';

const states = [
  { name: 'Andhra Pradesh', region: 'South India', languages: 'Telugu, Urdu', dress: 'Dhoti / Saree', food: 'Pulihora, Gongura', festival: 'Ugadi, Sankranti', dance: 'Kuchipudi, Kolatam', art: 'Kalamkari', heritage: 'Tirupati, Lepakshi', tradition: 'Handloom weaving and coastal temple traditions' },
  { name: 'Arunachal Pradesh', region: 'North-East India', languages: 'English + many indigenous languages', dress: 'Tribal woven attire', food: 'Thukpa, bamboo-shoot dishes', festival: 'Losar, Nyokum', dance: 'Ponung, Aji Lhamu', art: 'Traditional weaving', heritage: 'Tawang Monastery', tradition: 'Rich indigenous textile and community traditions' },
  { name: 'Assam', region: 'North-East India', languages: 'Assamese, Bodo, Bengali', dress: 'Mekhela Chador, Gamosa', food: 'Khar, Masor Tenga', festival: 'Bihu', dance: 'Bihu dance, Sattriya', art: 'Jaapi and weaving', heritage: 'Sivasagar monuments', tradition: 'Brahmaputra valley cultural traditions' },
  { name: 'Bihar', region: 'East India', languages: 'Hindi, Maithili, Bhojpuri, Urdu', dress: 'Saree, Dhoti-Kurta', food: 'Litti Chokha, Thekua', festival: 'Chhath Puja', dance: 'Jat-Jatin', art: 'Madhubani painting', heritage: 'Nalanda, Bodh Gaya', tradition: 'Folk painting, literature and Buddhist heritage' },
  { name: 'Chhattisgarh', region: 'Central India', languages: 'Hindi, Chhattisgarhi, Gondi', dress: 'Kosa silk saree', food: 'Chila, Fara', festival: 'Bastar Dussehra', dance: 'Panthi, Raut Nacha', art: 'Bell metal craft', heritage: 'Sirpur, Bastar', tradition: 'Adivasi arts, metalwork and forest-linked knowledge' },
  { name: 'Goa', region: 'West India', languages: 'Konkani, Marathi, English', dress: 'Kunbi saree / regional attire', food: 'Fish curry rice, Bebinca', festival: 'Shigmo, Sao Joao', dance: 'Fugdi, Dekhnni', art: 'Azulejo-inspired tile work', heritage: 'Old Goa churches', tradition: 'Konkan, Lusophone and contemporary influences' },
  { name: 'Gujarat', region: 'West India', languages: 'Gujarati, Hindi', dress: 'Chaniya Choli, Kediyu', food: 'Dhokla, Thepla, Undhiyu', festival: 'Navratri', dance: 'Garba, Dandiya', art: 'Bandhani, Patola', heritage: 'Rani ki Vav, Dholavira', tradition: 'Textiles, crafts and mercantile culture' },
  { name: 'Haryana', region: 'North India', languages: 'Hindi, Haryanvi, Punjabi', dress: 'Ghagra-Kurti, Dhoti-Kurta', food: 'Bajra roti, Churma', festival: 'Teej, Baisakhi', dance: 'Dhamal, Khoria', art: 'Phulkari and rural crafts', heritage: 'Rakhigarhi', tradition: 'Agrarian folk culture and wrestling traditions' },
  { name: 'Himachal Pradesh', region: 'Himalayan India', languages: 'Hindi, Pahari varieties', dress: 'Himachali cap, woollens', food: 'Dham, Siddu', festival: 'Kullu Dussehra', dance: 'Nati', art: 'Chamba rumal', heritage: 'Shimla, monasteries and temples', tradition: 'Mountain architecture, weaving and local festivals' },
  { name: 'Jammu and Kashmir', region: 'Himalayan India', languages: 'Kashmiri, Dogri, Urdu, Hindi', dress: 'Pheran and traditional woollens', food: 'Rogan josh, dum aloo, kahwa', festival: 'Baisakhi, Herath, Tulip Festival', dance: 'Rouff and Hafiza', art: 'Pashmina, carpet weaving and papier-mache', heritage: 'Srinagar, Gulmarg, Vaishno Devi', tradition: 'Mountain heritage shaped by Kashmir, Dogra and Ladakhi influences' },
  { name: 'Jharkhand', region: 'East India', languages: 'Hindi, Santali, Nagpuri, Kurukh', dress: 'Regional sarees and tribal attire', food: 'Dhuska, Rugra', festival: 'Sarhul, Sohrai', dance: 'Chhau, Jhumar', art: 'Sohrai and Khovar', heritage: 'Maluti temples', tradition: 'Indigenous art, ecology and community festivals' },
  { name: 'Karnataka', region: 'South India', languages: 'Kannada, Tulu, Konkani, Urdu', dress: 'Mysore silk saree, Panche', food: 'Bisi Bele Bath, Ragi Mudde', festival: 'Mysuru Dasara, Ugadi', dance: 'Yakshagana, Dollu Kunitha', art: 'Mysore painting', heritage: 'Hampi, Pattadakal', tradition: 'Classical literature, temple arts and crafts' },
  { name: 'Kerala', region: 'South India', languages: 'Malayalam, English', dress: 'Kasavu saree, Mundu', food: 'Appam, Sadya, Puttu', festival: 'Onam, Vishu', dance: 'Kathakali, Mohiniyattam', art: 'Mural painting, coir craft', heritage: 'Padmanabhapuram, backwaters', tradition: 'Ayurveda, performing arts and maritime culture' },
  { name: 'Madhya Pradesh', region: 'Central India', languages: 'Hindi, Bundeli, Malvi, Gondi', dress: 'Chanderi/Maheshwari sarees', food: 'Poha, Bhutte ka Kees', festival: 'Khajuraho Dance Festival', dance: 'Rai, Matki', art: 'Gond art', heritage: 'Khajuraho, Sanchi', tradition: 'Tribal art, textiles and historic kingdoms' },
  { name: 'Maharashtra', region: 'West India', languages: 'Marathi, Hindi, Urdu', dress: 'Nauvari saree, Dhoti-Kurta', food: 'Pav Bhaji, Puran Poli, Misal', festival: 'Ganesh Chaturthi, Gudi Padwa', dance: 'Lavani, Powada', art: 'Warli painting', heritage: 'Ajanta-Ellora, forts', tradition: 'Bhakti literature, theatre and urban-rural cultural exchange' },
  { name: 'Manipur', region: 'North-East India', languages: 'Meitei, English, tribal languages', dress: 'Phanek, Innaphi', food: 'Eromba, Singju', festival: 'Yaoshang, Lai Haraoba', dance: 'Manipuri Raas', art: 'Handloom and bamboo craft', heritage: 'Kangla Fort', tradition: 'Vaishnav, indigenous and martial arts traditions' },
  { name: 'Meghalaya', region: 'North-East India', languages: 'Khasi, Garo, English', dress: 'Jainsem, Dakmanda', food: 'Jadoh, Tungrymbai', festival: 'Wangala, Nongkrem', dance: 'Wangala, Shad Suk Mynsiem', art: 'Cane and bamboo craft', heritage: 'Living root bridges', tradition: 'Matri-heritage communities and ecological knowledge' },
  { name: 'Mizoram', region: 'North-East India', languages: 'Mizo, English', dress: 'Puan', food: 'Bai, Vawksa', festival: 'Chapchar Kut', dance: 'Cheraw', art: 'Textile weaving', heritage: 'Reiek', tradition: 'Community singing, weaving and bamboo crafts' },
  { name: 'Nagaland', region: 'North-East India', languages: 'English, Nagamese, many Naga languages', dress: 'Naga shawls and traditional attire', food: 'Smoked pork, axone dishes', festival: 'Hornbill Festival', dance: 'War dances and folk forms', art: 'Beadwork and weaving', heritage: 'Kisama heritage village', tradition: 'Distinct Naga communities, textiles and oral traditions' },
  { name: 'Odisha', region: 'East India', languages: 'Odia, Sambalpuri varieties', dress: 'Sambalpuri saree, Dhoti', food: 'Pakhala, Dalma', festival: 'Rath Yatra, Nuakhai', dance: 'Odissi, Chhau', art: 'Pattachitra, applique', heritage: 'Konark Sun Temple, Puri', tradition: 'Temple culture, textiles and classical arts' },
  { name: 'Punjab', region: 'North India', languages: 'Punjabi, Hindi', dress: 'Salwar Kameez, Turban', food: 'Makki di Roti, Sarson da Saag', festival: 'Baisakhi, Lohri', dance: 'Bhangra, Giddha', art: 'Phulkari', heritage: 'Golden Temple, forts', tradition: 'Punjabi poetry, music and agricultural heritage' },
  { name: 'Rajasthan', region: 'West India', languages: 'Hindi, Rajasthani varieties', dress: 'Ghagra, Angarkha, Turban', food: 'Dal Baati Churma, Gatte', festival: 'Gangaur, Teej', dance: 'Ghoomar, Kalbelia', art: 'Miniature painting, blue pottery', heritage: 'Forts and havelis', tradition: 'Desert crafts, music and courtly traditions' },
  { name: 'Sikkim', region: 'Himalayan India', languages: 'Nepali, Sikkimese, Lepcha, Bhutia', dress: 'Bakhu, traditional coats', food: 'Momos, Thukpa', festival: 'Losar, Pang Lhabsol', dance: 'Cham', art: 'Thangka painting', heritage: 'Rumtek Monastery', tradition: 'Himalayan Buddhist and indigenous heritage' },
  { name: 'Tamil Nadu', region: 'South India', languages: 'Tamil, English', dress: 'Kanjeevaram saree, Veshti', food: 'Dosa, Pongal, Chettinad dishes', festival: 'Pongal, Tamil New Year', dance: 'Bharatanatyam, Karagattam', art: 'Tanjore painting, bronze casting', heritage: 'Brihadisvara, Meenakshi Temple', tradition: 'Tamil literature, temple architecture and classical arts' },
  { name: 'Telangana', region: 'South India', languages: 'Telugu, Urdu', dress: 'Pochampally ikat, regional sarees', food: 'Hyderabadi biryani, Sarva Pindi', festival: 'Bathukamma, Bonalu', dance: 'Perini, Lambadi folk forms', art: 'Pochampally Ikat, Cheriyal', heritage: 'Charminar, Ramappa Temple', tradition: 'Deccan, Telugu and Dakhni cultural influences' },
  { name: 'Tripura', region: 'North-East India', languages: 'Bengali, Kokborok, English', dress: 'Rignai, Risa', food: 'Mui Borok dishes', festival: 'Kharchi Puja, Garia', dance: 'Hojagiri', art: 'Bamboo and cane craft', heritage: 'Ujjayanta Palace, Unakoti', tradition: 'Indigenous and Bengali cultural interactions' },
  { name: 'Uttar Pradesh', region: 'North India', languages: 'Hindi, Urdu, Awadhi, Braj', dress: 'Saree, Kurta-Pajama, regional attire', food: 'Awadhi biryani, Kachori, Petha', festival: 'Holi, Diwali, Ram Navami', dance: 'Kathak, Raslila', art: 'Chikankari, brass craft', heritage: 'Taj Mahal, Varanasi, Sarnath', tradition: 'Ganga-Jamuni cultural exchange, literature and crafts' },
  { name: 'Uttarakhand', region: 'Himalayan India', languages: 'Hindi, Garhwali, Kumaoni', dress: 'Ghagra-Pichora, woollens', food: 'Kafuli, Aloo ke Gutke', festival: 'Harela, Nanda Devi Raj Jat', dance: 'Chholiya, Jhora', art: 'Aipan', heritage: 'Kedarnath, Jageshwar, Valley of Flowers', tradition: 'Mountain ecology, pilgrimage and folk traditions' },
  { name: 'West Bengal', region: 'East India', languages: 'Bengali, Hindi, Nepali', dress: 'Taant/Baluchari saree, Dhoti', food: 'Macher Jhol, Mishti Doi', festival: 'Durga Puja, Poila Boishakh', dance: 'Chhau, Gaudiya traditions', art: 'Kantha, Kalighat painting', heritage: 'Victoria Memorial, Bishnupur temples', tradition: 'Literature, theatre, music and craft traditions' }
];

const politicalData = {
  lastVerified: '17 September 2026 · Re-check state office-holders before publication',
  primeMinister: {
    name: 'Narendra Modi',
    office: 'Prime Minister of India',
    since: '9 June 2024',
    image: 'https://www.pmindia.gov.in/wp-content/uploads/2018/04/PMO-Profile-Photo.jpg',
    source: 'https://www.pmindia.gov.in/en/pms-profile/'
  },
  president: { name: 'Droupadi Murmu', office: 'President of India', source: 'https://www.presidentofindia.gov.in/' },
  states: [
    ['Andhra Pradesh', 'Amaravati', 'Chandrababu Naidu', 'TDP', 'South India', 'https://www.ap.gov.in/'],
    ['Arunachal Pradesh', 'Itanagar', 'Pema Khandu', 'BJP', 'North-East India', 'https://arunachalpradesh.gov.in/'],
    ['Assam', 'Dispur', 'Himanta Biswa Sarma', 'BJP', 'North-East India', 'https://assam.gov.in/'],
    ['Bihar', 'Patna', 'Nitish Kumar', 'JD(U)', 'East India', 'https://state.bihar.gov.in/'],
    ['Chhattisgarh', 'Raipur', 'Vishnu Deo Sai', 'BJP', 'Central India', 'https://cgstate.gov.in/'],
    ['Goa', 'Panaji', 'Pramod Sawant', 'BJP', 'West India', 'https://www.goa.gov.in/'],
    ['Gujarat', 'Gandhinagar', 'Bhupendra Patel', 'BJP', 'West India', 'https://gujaratindia.gov.in/'],
    ['Haryana', 'Chandigarh', 'Nayab Singh Saini', 'BJP', 'North India', 'https://www.haryana.gov.in/'],
    ['Himachal Pradesh', 'Shimla', 'Sukhvinder Singh Sukhu', 'INC', 'Himalayan India', 'https://himachal.nic.in/'],
    ['Jharkhand', 'Ranchi', 'Hemant Soren', 'JMM', 'East India', 'https://www.jharkhand.gov.in/'],
    ['Karnataka', 'Bengaluru', 'Siddaramaiah', 'INC', 'South India', 'https://www.karnataka.gov.in/'],
    ['Kerala', 'Thiruvananthapuram', 'Pinarayi Vijayan', 'CPI(M)', 'South India', 'https://kerala.gov.in/'],
    ['Madhya Pradesh', 'Bhopal', 'Mohan Yadav', 'BJP', 'Central India', 'https://mp.gov.in/'],
    ['Maharashtra', 'Mumbai', 'Devendra Fadnavis', 'BJP', 'West India', 'https://www.maharashtra.gov.in/'],
    ['Manipur', 'Imphal', 'Yumnam Khemchand Singh', 'BJP', 'North-East India', 'https://manipur.gov.in/'],
    ['Meghalaya', 'Shillong', 'Conrad K. Sangma', 'NPP', 'North-East India', 'https://meghalaya.gov.in/'],
    ['Mizoram', 'Aizawl', 'Lalduhoma', 'ZPM', 'North-East India', 'https://mizoram.gov.in/'],
    ['Nagaland', 'Kohima', 'Neiphiu Rio', 'NDPP', 'North-East India', 'https://nagaland.gov.in/'],
    ['Odisha', 'Bhubaneswar', 'Mohan Charan Majhi', 'BJP', 'East India', 'https://odisha.gov.in/'],
    ['Punjab', 'Chandigarh', 'Bhagwant Mann', 'AAP', 'North India', 'https://punjab.gov.in/'],
    ['Rajasthan', 'Jaipur', 'Bhajan Lal Sharma', 'BJP', 'West India', 'https://rajasthan.gov.in/'],
    ['Sikkim', 'Gangtok', 'Prem Singh Tamang', 'SKM', 'Himalayan India', 'https://sikkim.gov.in/'],
    ['Tamil Nadu', 'Chennai', 'M. K. Stalin', 'DMK', 'South India', 'https://www.tn.gov.in/'],
    ['Telangana', 'Hyderabad', 'A. Revanth Reddy', 'INC', 'South India', 'https://www.telangana.gov.in/'],
    ['Tripura', 'Agartala', 'Manik Saha', 'BJP', 'North-East India', 'https://tripura.gov.in/'],
    ['Uttar Pradesh', 'Lucknow', 'Yogi Adityanath', 'BJP', 'North India', 'https://up.gov.in/'],
    ['Uttarakhand', 'Dehradun', 'Pushkar Singh Dhami', 'BJP', 'Himalayan India', 'https://uk.gov.in/'],
    ['West Bengal', 'Kolkata', 'Mamata Banerjee', 'AITC', 'East India', 'https://wb.gov.in/' ]
  ].map(([name, capital, chiefMinister, party, region, source]) => ({ name, capital, region, chiefMinister, party, source, governor: 'See official state profile', speaker: 'See official legislative assembly profile', opposition: 'See official legislative assembly profile' }))
};

const politicalParties = [
  ['Bharatiya Janata Party', 'National', 'https://www.bjp.org/'],
  ['Indian National Congress', 'National', 'https://inc.in/'],
  ['Aam Aadmi Party', 'National', 'https://aamaadmiparty.org/'],
  ['Communist Party of India (Marxist)', 'National', 'https://cpim.org/'],
  ['Dravida Munnetra Kazhagam', 'State', 'https://www.dmk.in/'],
  ['Biju Janata Dal', 'State', 'https://www.bjdodisha.org.in/']
];

const sections = [
  ['Languages', 'Multilingual India', 'Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Malayalam, Kannada, Assamese and many more.'],
  ['Traditional Dresses', 'Textiles & identity', 'Regional clothing reflects climate, craft, history and local aesthetics; examples include Kanjeevaram, Phulkari, Bandhani and Pochampally.'],
  ['Cuisine', 'A taste of India', 'From litti chokha and dal baati to appam, pakhala and momos—food traditions vary within every region.'],
  ['Festivals', 'Celebrating together', 'Diwali, Eid, Christmas, Holi, Onam, Pongal, Bihu, Baisakhi, Durga Puja and many local festivals.'],
  ['Music & Dance', 'Rhythms of India', 'Classical traditions such as Bharatanatyam, Kathak, Odissi and Manipuri meet vibrant folk traditions.'],
  ['Art & Handicrafts', 'Living creativity', 'Madhubani, Warli, Pattachitra, Kalamkari, Phulkari, Gond, Chikankari and countless local crafts.'],
  ['Architecture', 'Heritage in stone', 'Temples, mosques, churches, stupas, forts, stepwells, palaces and living historic cities tell many stories.'],
  ['Knowledge', 'Ideas & traditions', 'Yoga, Ayurveda, meditation, classical literature, local ecological knowledge and traditional learning systems.']
];

const sportsPlayers = [
  { name: 'Sachin Tendulkar', sport: 'Cricket', achievement: 'First player to score a double century in ODI cricket; member of India’s 2011 World Cup-winning team.', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=700&q=80' },
  { name: 'M. S. Dhoni', sport: 'Cricket', achievement: 'Captain of India’s 2007 T20 World Cup and 2011 ODI World Cup winning teams.', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=700&q=80' },
  { name: 'Virat Kohli', sport: 'Cricket', achievement: 'India’s leading modern run scorer and Player of the Tournament at the 2014 and 2023 ODI World Cups.', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=700&q=80' },
  { name: 'Neeraj Chopra', sport: 'Athletics', achievement: 'India’s first Olympic track-and-field gold medallist and World Champion in javelin throw.', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=700&q=80' },
  { name: 'P. V. Sindhu', sport: 'Badminton', achievement: 'Olympic silver and bronze medallist, and World Champion in women’s singles badminton.', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=700&q=80' },
  { name: 'Mary Kom', sport: 'Boxing', achievement: 'Six-time World Champion and Olympic bronze medallist who transformed Indian women’s boxing.', image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=700&q=80' },
  { name: 'Abhinav Bindra', sport: 'Shooting', achievement: 'India’s first individual Olympic gold medallist, winning the 10m air rifle title in 2008.', image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=700&q=80' },
  { name: 'Sakshi Malik', sport: 'Wrestling', achievement: 'India’s first female wrestler to win an Olympic medal, taking bronze at Rio 2016.', image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=700&q=80' },
  { name: 'Viswanathan Anand', sport: 'Chess', achievement: 'Five-time World Chess Champion and India’s first undisputed chess world champion.', image: 'https://images.unsplash.com/photo-1586165368502-1BAD197a6461?auto=format&fit=crop&w=700&q=80' },
  { name: 'Hima Das', sport: 'Athletics', achievement: 'The first Indian track athlete to win a gold medal at an IAAF global competition.', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=700&q=80' },
  { name: 'Dipa Karmakar', sport: 'Gymnastics', achievement: 'The first Indian female gymnast to compete at the Olympics and a pioneer of the Produnova vault.', image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=700&q=80' },
  { name: 'Avani Lekhara', sport: 'Para Shooting', achievement: 'The first Indian woman to win two Paralympic gold medals, in shooting at Tokyo 2020.', image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=700&q=80' }
];

const cricketPlayers = [
  { name: 'Kapil Dev', role: 'All-rounder & former captain', achievement: 'Led India to its first Cricket World Cup title in 1983.', details: 'Kapil Dev was one of India’s finest fast-bowling all-rounders. His leadership, athleticism and unforgettable 175 against Zimbabwe helped create India’s first World Cup winning story.', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80', highlights: '1983 World Cup captain; 434 Test wickets; 5,248 Test runs' },
  { name: 'Sunil Gavaskar', role: 'Opening batter', achievement: 'The first batter to reach 10,000 Test runs.', details: 'Sunil Gavaskar set a new standard for opening batters with his technique, concentration and courage against the fastest bowlers of his era.', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80', highlights: 'First 10,000 Test runs; 34 Test centuries; 1983 World Cup winner' },
  { name: 'Sachin Tendulkar', role: 'Batter', achievement: 'First player to score a double century in ODI cricket and a member of the 2011 World Cup winning team.', details: 'Sachin Tendulkar’s international career lasted more than two decades. His consistency, technique and influence made him one of the most important figures in world cricket.', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=900&q=80', highlights: '100 international centuries; 2011 World Cup winner; 200 Test matches' },
  { name: 'M. S. Dhoni', role: 'Wicketkeeper-batter & captain', achievement: 'Captain of India’s 2007 T20 World Cup and 2011 ODI World Cup winning teams.', details: 'M. S. Dhoni became known for calm decision-making, sharp wicketkeeping and finishing matches under pressure. He is the only captain to win the three major ICC limited-overs trophies.', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80', highlights: '2007 T20 World Cup; 2011 ODI World Cup; 2013 Champions Trophy' },
  { name: 'Virat Kohli', role: 'Top-order batter', achievement: 'One of India’s leading modern run scorers and Player of the Tournament at the 2023 ODI World Cup.', details: 'Virat Kohli is celebrated for his fitness, intensity and consistency across formats. His chase batting and leadership helped define a new generation of Indian cricket.', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80', highlights: '2023 ODI World Cup Player of the Tournament; 50 ODI centuries; former India captain' },
  { name: 'Rohit Sharma', role: 'Opening batter & former captain', achievement: 'Captain of India’s 2024 T20 World Cup winning team and holder of the highest ODI individual score.', details: 'Rohit Sharma combines timing, power and elegant stroke play. His leadership and attacking approach were central to India’s 2024 T20 World Cup campaign.', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=900&q=80', highlights: '2024 T20 World Cup captain; 264 ODI runs in one innings; two-time T20 World Cup winner' },
  { name: 'Rahul Dravid', role: 'Batter & former coach', achievement: 'A member of India’s 2007 and 2011 World Cup squads and coach of the 2024 T20 World Cup winning team.', details: 'Rahul Dravid was known as “The Wall” for his patience and technique. As coach, he helped build the team culture that lifted the 2024 T20 World Cup.', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80', highlights: '13,288 Test runs; 2018 U19 World Cup coach; 2024 T20 World Cup coach' },
  { name: 'Jasprit Bumrah', role: 'Fast bowler', achievement: 'Player of the Tournament in India’s 2024 T20 World Cup winning campaign.', details: 'Jasprit Bumrah changed the possibilities of Indian fast bowling with his unusual action, control and ability to perform in decisive moments.', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80', highlights: '2024 T20 World Cup Player of the Tournament; elite all-format fast bowler' },
  { name: 'Anil Kumble', role: 'Leg-spinner & former captain', achievement: 'India’s leading Test wicket-taker and one of the most respected bowlers in cricket history.', details: 'Anil Kumble’s accuracy, patience and competitive spirit made him a match-winning spinner. He remains India’s most successful Test bowler.', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80', highlights: '619 Test wickets; 10 wickets in one Test innings; 1996 World Cup squad' },
  { name: 'Mithali Raj', role: 'Batter & former captain', achievement: 'India’s former women’s cricket captain and one of the highest run scorers in women’s international cricket.', details: 'Mithali Raj led Indian women’s cricket for years with grace, discipline and remarkable consistency, inspiring a wider audience for the women’s game.', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80', highlights: '7,000+ ODI runs; two-time ODI World Cup finalist; former India captain' },
  { name: 'Jhulan Goswami', role: 'Fast bowler', achievement: 'One of women’s cricket’s most successful fast bowlers and a World Cup finalist with India.', details: 'Jhulan Goswami brought pace, movement and longevity to women’s cricket. Her career helped establish fast bowling as a major strength for Indian women.', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80', highlights: '2007 ICC Women’s Player of the Year; 2005 and 2017 World Cup finalist' },
  { name: 'Harmanpreet Kaur', role: 'All-rounder & captain', achievement: 'Known for her historic 171 not out in the 2017 Women’s World Cup semi-final.', details: 'Harmanpreet Kaur is one of India’s most powerful all-rounders. Her fearless batting has become a landmark in the growth of women’s cricket.', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=900&q=80', highlights: '171* in 2017 World Cup; 2018 T20I captain; India women’s leader' }
];

const sportsDisciplines = [
  { name: 'Cricket', note: 'From local grounds to World Cup victories, cricket is played and followed across every region of India.', icon: '🏏' },
  { name: 'Hockey', note: 'India’s national sport legacy includes eight Olympic gold medals and a proud modern revival.', icon: '🏑' },
  { name: 'Badminton', note: 'Indian shuttlers have built a strong international presence through Olympic and world championship success.', icon: '🏸' },
  { name: 'Athletics', note: 'Javelin, sprinting and track-and-field champions have created new inspiration for young athletes.', icon: '🏃' },
  { name: 'Wrestling & Boxing', note: 'Indian grapplers and boxers combine traditional strength with world-class competitive training.', icon: '🥊' },
  { name: 'Chess & Shooting', note: 'India’s strategic and precision sports tradition now includes global champions and a new generation of stars.', icon: '♟' },
  { name: 'Football', note: 'Football culture thrives through national leagues, state competitions and passionate local communities.', icon: '⚽' },
  { name: 'Para-Sports', note: 'Indian para-athletes continue to break barriers and win medals on the world stage.', icon: '🏅' }
];

const winningMoments = [
  { year: '1983', title: 'First Cricket World Cup', text: 'Kapil Dev’s team defeated the West Indies at Lord’s, changing the place of cricket in India forever.', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80' },
  { year: '2007', title: 'First T20 World Cup', text: 'M. S. Dhoni led a young Indian team to the inaugural ICC Men’s T20 World Cup title.', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80' },
  { year: '2011', title: 'Home World Cup Triumph', text: 'India won the ODI World Cup on home soil, with Dhoni finishing the final with a famous six.', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=900&q=80' },
  { year: '2016', title: 'Rio Wrestling Medal', text: 'Sakshi Malik became India’s first female wrestler to win an Olympic medal.', image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80' },
  { year: '2018', title: 'Asian Games Javelin Gold', text: 'Neeraj Chopra’s Asian Games victory marked the rise of a new athletics icon.', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80' },
  { year: '2020', title: 'Historic Olympic Gold', text: 'Neeraj Chopra won India’s first Olympic athletics gold in the javelin throw at Tokyo.', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80' },
  { year: '2022', title: 'Chess Olympiad Momentum', text: 'India’s young chess teams delivered strong performances and showed the depth of the country’s chess culture.', image: 'https://images.unsplash.com/photo-1586165368502-1BAD197a6461?auto=format&fit=crop&w=900&q=80' },
  { year: '2024', title: 'T20 World Cup Glory', text: 'India lifted the Men’s T20 World Cup after an unbeaten campaign and a dramatic final.', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80' }
];

const regionProfiles = [
  { name: 'North India', states: 'Punjab, Haryana, Delhi, Uttar Pradesh, Uttarakhand, Himachal Pradesh, Rajasthan', languages: 'Hindi, Punjabi, Haryanvi, Kumaoni, Garhwali, Urdu', dress: 'Salwar Kameez, Ghagra, Turban, Pahari woolens', food: 'Chole Bhature, Paratha, Rajma, Dal Makhani, Chaat', festivals: 'Diwali, Holi, Baisakhi, Teej, Kullu Dussehra', dance: 'Kathak, Bhangra, Giddha, Nati', art: 'Phulkari, Kangra painting, Chikankari', heritage: 'Taj Mahal, Varanasi, Golden Temple, Qutub Minar' },
  { name: 'South India', states: 'Tamil Nadu, Karnataka, Kerala, Telangana, Andhra Pradesh', languages: 'Tamil, Telugu, Kannada, Malayalam, Tulu, Konkani', dress: 'Veshti, Kanjeevaram Saree, Mundu, Mysore silk', food: 'Dosa, Idli, Sambar, Appam, Biryani, Ragi Mudde', festivals: 'Onam, Pongal, Ugadi, Mysuru Dasara, Bonalu', dance: 'Bharatanatyam, Kathakali, Kuchipudi, Yakshagana', art: 'Mysore painting, bronze casting, mural art', heritage: 'Hampi, Meenakshi Temple, Belur, Srirangam' },
  { name: 'East India', states: 'West Bengal, Bihar, Odisha, Jharkhand', languages: 'Bengali, Odia, Maithili, Bhojpuri, Santali', dress: 'Sarees, Dhoti, Sambalpuri textiles, Gamcha', food: 'Macher Jhol, Rasgulla, Litti Chokha, Pakhala', festivals: 'Durga Puja, Rath Yatra, Chhath, Nuakhai', dance: 'Odissi, Chhau, Jhumur, Dandiya-inspired folk forms', art: 'Madhubani, Pattachitra, Kantha', heritage: 'Konark, Nalanda, Bishnupur, Bodh Gaya' },
  { name: 'West India', states: 'Gujarat, Maharashtra, Goa, Rajasthan', languages: 'Gujarati, Marathi, Konkani, Rajasthani', dress: 'Chaniya Choli, Nauvari Saree, Bandhani, Ghagra', food: 'Dhokla, Thepla, Pav Bhaji, Seafood, Dal Baati', festivals: 'Navratri, Ganesh Chaturthi, Shigmo, Teej', dance: 'Garba, Lavani, Dandiya, Ghoomar', art: 'Warli, Bandhani, Blue Pottery, Goa tile art', heritage: 'Ajanta, Ellora, Hampi, Rani ki Vav, Old Goa' },
  { name: 'Central India', states: 'Madhya Pradesh, Chhattisgarh', languages: 'Hindi, Chhattisgarhi, Bundeli, Gondi', dress: 'Maheshwari sarees, tribal attire, regional weaves', food: 'Poha, Bhutte ka Kees, Fara, Chila', festivals: 'Bastar Dussehra, Khajuraho Dance Festival', dance: 'Rai, Panthi, Matki, Gaur Maria dance', art: 'Gond art, bell metal craft, tribal painting', heritage: 'Sanchi, Khajuraho, Sirpur, Bastar' },
  { name: 'North-East India', states: 'Assam, Arunachal Pradesh, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Sikkim', languages: 'Assamese, Mizo, Khasi, Meitei, Nepali, Bodo, Naga languages', dress: 'Mekhela Chador, Puan, Phanek, Gho, traditional shawls', food: 'Khar, Momos, Thukpa, Eromba, Jadoh, Bamboo shoot dishes', festivals: 'Bihu, Hornbill, Losar, Wangala, Yaoshang', dance: 'Bihu, Manipuri Raas, Cheraw, Cham, Ponung', art: 'Bamboo weaving, cane craft, handloom, tribal beadwork', heritage: 'Tawang, Kaziranga, living root bridges, Kangla' },
  { name: 'Himalayan Region', states: 'Himachal Pradesh, Uttarakhand, Sikkim, Arunachal Pradesh', languages: 'Hindi, Pahari, Nepali, Lepcha, Bhutia, Sikkimese', dress: 'Woolen shawls, Bakhu, traditional mountain attire', food: 'Dham, Siddu, Kafuli, Thukpa, Momos', festivals: 'Kullu Dussehra, Losar, Nanda Devi Raj Jat', dance: 'Nati, Cham, folk mountain dances', art: 'Thangka, Aipan, Chamba Rumal', heritage: 'Kedarnath, Gangotri, Rumtek, monasteries' }
];

const languageCards = [
  { name: 'Hindi', script: 'देवनागरी', note: 'One of the most widely spoken languages in India and a major link language across states.' },
  { name: 'Bengali', script: 'বাংলা', note: 'The official language of West Bengal and part of the eastern cultural sphere.' },
  { name: 'Tamil', script: 'தமிழ்', note: 'A classical language with a long literary and temple tradition in South India.' },
  { name: 'Telugu', script: 'తెలుగు', note: 'A major South Indian language with rich literary, musical and folk traditions.' },
  { name: 'Marathi', script: 'मराठी', note: 'A vibrant language tied to Maharashtra’s literature, theatre and folk culture.' },
  { name: 'Gujarati', script: 'ગુજરાતી', note: 'Known for its literary heritage, business traditions and vibrant festivals.' },
  { name: 'Punjabi', script: 'ਪੰਜਾਬੀ', note: 'Strongly tied to music, agriculture, diaspora culture and folk traditions.' },
  { name: 'Malayalam', script: 'മലയാളം', note: 'Associated with Kerala’s literary heritage, performing arts and social reform.' },
  { name: 'Kannada', script: 'ಕನ್ನಡ', note: 'The language of Karnataka’s classical and regional artistic traditions.' },
  { name: 'Assamese', script: 'অসমীয়া', note: 'Essential to Assam’s cultural life, literature and festivals.' }
];

const dressCards = [
  { state: 'Punjab', name: 'Salwar Kameez & Turban', summary: 'Comfortable, elegant and symbolic of regional identity and community values.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPeX4TAWdv-dodUA5kSi-GF1FYb6b28h6JbofLz6F9yy7CCZwGJqfG_1iT&s=10' },
  { state: 'Gujarat', name: 'Chaniya Choli & Kediyu', summary: 'Worn during festivals and celebrations, especially during Navratri and community gatherings.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREul9buio9LX01BcJf2mTaUeya1AuM2GLZoJy_y_O-uQ&s=10' },
  { state: 'Rajasthan', name: 'Ghagra, Bandhani & Lehengas', summary: 'Reflecting the desert climate, royal heritage and rich textile crafts.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8P6ohwlKaRFNV_fx1j041gmbSChclCVVSJS_kwLt5kGb5qNiqKOQWCsI&s=10' },
  { state: 'West Bengal', name: 'Saree & Dhoti', summary: 'Traditional draping with strong connections to Bengali culture, rituals and family life.', image: 'https://images.unsplash.com/photo-1593030761757-71fae45b9345?auto=format&fit=crop&w=900&q=80' },
  { state: 'Maharashtra', name: 'Nauvari Saree & Dhoti', summary: 'A strong signature of Marathi tradition and regional craftsmanship.', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80' },
  { state: 'South India', name: 'Veshti & Kanjeevaram Saree', summary: 'Associated with temple traditions, weddings, classical dance and ritual life.', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' },
  { state: 'Kashmir', name: 'Pheran & Shawls', summary: 'Designed for cold climates and woven traditions rooted in local aesthetics.', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' },
  { state: 'North-East India', name: 'Regional Traditional Attire', summary: 'Highly diverse across communities, woven with local fibers, motifs and identity markers.', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' }
];

const cuisineCards = [
  { name: 'Chole Bhature', region: 'North India', description: 'A beloved North Indian combination known for its rich taste and festive appeal.', background: 'Strongly linked with Punjabi and Delhi food culture.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHU1fByG8YckA7rontk1UPdQ7a-1pGNStJ1YIEAwwZwixNh96YthNHaAN0&s=10' },
  { name: 'Dosa & Idli', region: 'South India', description: 'Popular breakfast foods with a deep connection to regional culinary traditions and fermentation practices.', background: 'A defining part of Karnataka, Tamil Nadu and Kerala cuisine.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPrtAye7W25iT0_Tj2tcCN6Rs3TWj6mJ-Y3lVhMn9LyK1RDIBqy2sLOCHU&s=10' },
  { name: 'Macher Jhol', region: 'East India', description: 'A classic fish curry strongly associated with Bengali food traditions.', background: 'Known for its use of mustard, spices and local river fish.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJAB8MznBrRaUjsjaigsBEE00m9PBrXxII4LfG6MaMUw&s' },
  { name: 'Dhokla', region: 'West India', description: 'A fluffy vegetarian snack celebrated for its lightness and taste.', background: 'Closely associated with Gujarati cuisine and street food culture.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80' },
  { name: 'Momos', region: 'North-East India', description: 'A much-loved regional snack, often served with spicy chutneys and local flavor variations.', background: 'A common food tradition across Himalayan and North-Eastern communities.', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80' },
  { name: 'Thepla & Undhiyu', region: 'Gujarat', description: 'Recognized for their festive and family-centered food culture.', background: 'Often associated with travel, craft, and seasonal celebrations.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80' }
];

const festivalCards = [
  { name: 'Diwali', region: 'Across India', season: 'October–November', significance: 'Festival of lights and the victory of light over darkness.', celebration: 'Lakshmi worship, lights, sweets, rangoli, family gatherings and fireworks.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjIUQ4T5fmPRArSBs_hYPnl4EG1UGPocUg6P595X2TWA&s=10' },
  { name: 'Holi', region: 'North and West India', season: 'March', significance: 'Festival of colours and spring celebration.', celebration: 'Playful colour throwing, music, community gatherings and sweets.', image: 'https://c4.wallpaperflare.com/wallpaper/204/211/713/color-colours-festival-hindu-wallpaper-preview.jpg' },
  { name: 'Onam', region: 'Kerala', season: 'August–September', significance: 'A harvest festival with strong community and family traditions.', celebration: 'Pookalam, sadya meals, boat races and cultural performances.', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80' },
  { name: 'Pongal', region: 'Tamil Nadu', season: 'January', significance: 'A harvest festival celebrating abundance and gratitude.', celebration: 'Preparing pongal, decorating homes and symbolic festive rituals.', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80' },
  { name: 'Durga Puja', region: 'West Bengal', season: 'September–October', significance: 'A major festival honouring the divine feminine and artistic expression.', celebration: 'Idol worship, community gatherings, food and cultural programmes.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' },
  { name: 'Bihu', region: 'Assam', season: 'April', significance: 'A spring festival marking agricultural cycles and seasonal renewal.', celebration: 'Dance, music, feasts and community festivities.', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80' }
];

const musicCards = [
  { type: 'Classical', name: 'Bharatanatyam', note: 'A classical dance tradition of Tamil Nadu known for its precise gestures and storytelling.', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' },
  { type: 'Classical', name: 'Kathak', note: 'A North Indian classical dance tradition associated with storytelling and rhythmic footwork.', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80' },
  { type: 'Classical', name: 'Kathakali', note: 'A vibrant Kerala tradition with expressive face makeup and dramatic movement.', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80' },
  { type: 'Classical', name: 'Odissi', note: 'A classical form from Odisha known for its sculptural posture and grace.', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80' },
  { type: 'Folk', name: 'Bhangra', note: 'Popular folk dance from Punjab, often associated with harvest and community joy.', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' },
  { type: 'Folk', name: 'Garba', note: 'A festive dance tradition centred on devotion, rhythm and community participation.', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80' }
];

const artCards = [
  { name: 'Madhubani', state: 'Bihar', background: 'A traditional painting form known for bright colours and symbolic motifs.', note: 'Often done by women and rooted in folk storytelling.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_pemVYwt0prmTHB0ll7ahDBLGlLd7QY4i5G3oUOR3WBVAVZYVOtCJhJk&s=10' },
  { name: 'Warli', state: 'Maharashtra', background: 'A tribal art tradition using geometric patterns and scenes from daily life.', note: 'Strongly linked with village culture and natural surroundings.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' },
  { name: 'Pattachitra', state: 'Odisha', background: 'Traditional painted cloth or scrolls depicting mythological narratives.', note: 'Known for storytelling and temple-linked visual traditions.', image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80' },
  { name: 'Phulkari', state: 'Punjab', background: 'Decorative embroidery once associated with gifting and festive celebration.', note: 'A beautiful example of household craft and textile artistry.', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' },
  { name: 'Gond Art', state: 'Central India', background: 'A vibrant tribal art tradition with story-telling motifs and nature-based themes.', note: 'Popular in Madhya Pradesh and adjoining areas.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' },
  { name: 'Chikankari', state: 'Uttar Pradesh', background: 'Delicate white-on-white embroidery traditionally associated with Lucknow.', note: 'A craft with rich cultural and urban heritage links.', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80' }
];

const heritageCards = [
  { name: 'Taj Mahal', location: 'Agra, Uttar Pradesh', style: 'Mughal architecture', significance: 'A symbol of artistic, architectural and historical continuity in Indian heritage.', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80' },
  { name: 'Konark Sun Temple', location: 'Odisha', style: 'Kalinga temple architecture', significance: 'An iconic example of temple design and solar symbolism.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCW-DLomhLI6GSdgHTfcKLLBKnvAvVZzNFXk_Qm2Fztg&s=10' },
  { name: 'Golden Temple', location: 'Amritsar, Punjab', style: 'Sikh architecture', significance: 'A living spiritual and community landmark of faith and service.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' },
  { name: 'Sanchi Stupa', location: 'Madhya Pradesh', style: 'Buddhist architecture', significance: 'One of the oldest and most important Buddhist monuments in India.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVJQqm91jtCFpiDhTCusEGJFgGmCdiphv35bE-jTW2XQ&s=10' },
  { name: 'Hampi', location: 'Karnataka', style: 'Vijayanagara architecture', significance: 'A major site reflecting the grandeur of the Deccan kingdoms.', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80' },
  { name: 'Meenakshi Temple', location: 'Madurai, Tamil Nadu', style: 'Dravidian temple architecture', significance: 'Notable for sculptural detail, rituals and urban temple culture.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' }
];

const knowledgeCards = [
  { title: 'Yoga', description: 'Yoga brings together movement, breath and concentration. Its many schools connect physical discipline with self-awareness and contemplative practice.', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80' },
  { title: 'Ayurveda', description: 'Ayurveda views wellbeing through balance, daily routines, food and observation of the body. It remains part of India’s living health and wellness heritage.', image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=900&q=80' },
  { title: 'Meditation', description: 'Meditative practices appear across Indian philosophical and spiritual traditions. They encourage attention, reflection and a calmer relationship with everyday experience.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80' },
  { title: 'Traditional Education', description: 'Gurukuls, temple learning, manuscripts and oral teaching preserved knowledge across generations. Storytelling and practice often worked alongside formal study.', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80' },
  { title: 'Indian Philosophy', description: 'Vedanta, Samkhya, Nyaya, Buddhism and many other traditions asked deep questions about knowledge, ethics, reality and the self.', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80' },
  { title: 'Agricultural Knowledge', description: 'Farmers have developed local knowledge of seasons, soil, seed diversity and water. This ecological understanding continues to shape sustainable rural life.', image: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=900&q=80' }
];

const modernCards = [
  { title: 'Social Media & Digital Culture', description: 'Creators use reels, podcasts and online communities to share regional music, dance, recipes and languages with audiences far beyond their home state.', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=900&q=80' },
  { title: 'Bollywood & Regional Cinema', description: 'Films carry stories, music and social ideas across the country. Regional cinema also gives local languages and communities a powerful public voice.', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80' },
  { title: 'Urbanization & Migration', description: 'People move for education, work and opportunity, creating new neighbourhoods where languages, food and festivals meet every day.', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80' },
  { title: 'Fusion Cuisine', description: 'Chefs and families reinterpret regional recipes with new ingredients and techniques, allowing tradition to evolve without losing its memory.', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80' },
  { title: 'Modern Fashion', description: 'Handloom, embroidery and heritage textiles are entering contemporary clothing, connecting craft communities with new designers and audiences.', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80' },
  { title: 'Digital Preservation', description: 'Museums, archives and community projects are recording oral histories, performances and endangered languages for future generations.', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80' }
];

const galleryItems = [
  { name: 'Taj Mahal', category: 'Heritage', image: heritageCards[0].image },
  { name: 'Konark Sun Temple', category: 'Architecture', image: heritageCards[1].image },
  { name: 'Sanchi Stupa', category: 'Heritage', image: heritageCards[3].image },
  { name: 'Salwar Kameez & Turban', category: 'Traditional Dress', image: dressCards[0].image },
  { name: 'Chaniya Choli & Kediyu', category: 'Traditional Dress', image: dressCards[1].image },
  { name: 'Ghagra, Bandhani & Lehengas', category: 'Traditional Dress', image: dressCards[2].image },
  { name: 'Chole Bhature', category: 'Cuisine', image: cuisineCards[0].image },
  { name: 'Dosa & Idli', category: 'Cuisine', image: cuisineCards[1].image },
  { name: 'Macher Jhol', category: 'Cuisine', image: cuisineCards[2].image },
  { name: 'Diwali', category: 'Festival', image: festivalCards[0].image },
  { name: 'Holi', category: 'Festival', image: festivalCards[1].image },
  { name: 'Madhubani', category: 'Art & Craft', image: artCards[0].image }
];

const calendarItems = [
  { month: 'January', festival: 'Pongal', region: 'Tamil Nadu', description: 'Harvest and gratitude festival marked by festive food and rituals.' },
  { month: 'March', festival: 'Holi', region: 'North and West India', description: 'Festival of colours celebrating spring and community joy.' },
  { month: 'April', festival: 'Bihu', region: 'Assam', description: 'A spring festival of music, dance and agricultural celebration.' },
  { month: 'August–September', festival: 'Onam', region: 'Kerala', description: 'Harvest festival with feasts, flower carpets and boat races.' },
  { month: 'September–October', festival: 'Durga Puja', region: 'West Bengal', description: 'Artistic festival with worship, community gatherings and cultural programmes.' },
  { month: 'October–November', festival: 'Diwali', region: 'Across India', description: 'Festival of lights with prayers, sweets and celebration across communities.' }
];

const facts = [
  'India has 28 states and 8 Union Territories.',
  'Sattriya is a classical dance tradition associated with Assam.',
  'Pattachitra is a traditional painting tradition strongly associated with Odisha.',
  'Warli painting is associated with Maharashtra.',
  'The living root bridges of Meghalaya demonstrate remarkable local ecological knowledge.',
  'Pochampally is renowned for its ikat textile tradition in Telangana.',
  'Aipan is a traditional decorative art associated with Uttarakhand.',
  'Madhubani painting is strongly associated with Bihar.'
];

function getStateImage(name, index) {
  const base = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
  return base + '&sig=' + (index + 7);
}

const mapColors = ['#f59e8b', '#8dd3c7', '#80b1d3', '#bebada', '#fb8072', '#b3de69', '#fccde5', '#bc80bd', '#ffed6f', '#a6d854'];
const mapLabelPositions = {
  'Jammu and Kashmir': [118, 95],
  'Himachal Pradesh': [180, 137],
  Uttarakhand: [245, 164],
  Punjab: [153, 184],
  Haryana: [177, 230],
  Rajasthan: [93, 290],
  Gujarat: [89, 390],
  'Uttar Pradesh': [282, 260],
  Bihar: [379, 314],
  Sikkim: [438, 187],
  'West Bengal': [449, 376],
  Assam: [510, 260],
  'Arunachal Pradesh': [480, 165],
  Nagaland: [530, 230],
  Manipur: [529, 290],
  Mizoram: [500, 350],
  Tripura: [470, 336],
  Meghalaya: [465, 277],
  'Madhya Pradesh': [218, 337],
  Chhattisgarh: [322, 390],
  Jharkhand: [362, 380],
  Odisha: [390, 443],
  Maharashtra: [210, 472],
  Goa: [194, 546],
  Karnataka: [232, 560],
  Telangana: [304, 486],
  'Andhra Pradesh': [345, 555],
  'Tamil Nadu': [280, 628],
  Kerala: [210, 625]
};

const featureDetailsByState = {
  Bihar: {
    Food: {
      title: 'Bihar Food Traditions',
      sectionLabel: 'BIHAR · FOOD TRADITIONS',
      items: [
        {
          title: 'Litti Chokha',
          image: 'https://i.pinimg.com/474x/c6/fd/5e/c6fd5eaab7d160685a2bc0d0a90f9add.jpg',
          summary: 'A smoky wheat-and-sattu dish that is one of Bihar’s best-known food traditions.',
          process: 'Whole-wheat dough is filled with roasted gram flour, garlic, herbs and mustard oil. The litti is baked or roasted over a fire, then served with mashed roasted eggplant, tomato and potato chokha.',
          speciality: 'The roasted filling, mustard oil and fire-cooked flavour make litti chokha hearty, portable and deeply connected to everyday village cooking.'
        },
        {
          title: 'Thekua',
          image: 'https://i.pinimg.com/736x/e5/10/5c/e5105c7c28b7383bd9cce63f9b134944.jpg',
          summary: 'A crisp, lightly sweet wheat snack closely associated with Bihar and Chhath Puja.',
          process: 'Wheat flour is mixed with jaggery syrup, ghee, coconut and dry fruits. The dough is shaped in a wooden mould or by hand, then deep-fried until golden and firm.',
          speciality: 'Thekua stays fresh for several days and is prepared as a sacred prasad, giving this simple snack a strong ritual and cultural meaning.'
        }
      ],
    },
    'Traditional dress': {
      title: 'Bihar Saree and Dhoti-Kurta',
      image: 'https://images.unsplash.com/photo-1593030761757-71fae45b9345?auto=format&fit=crop&w=1100&q=85',
      summary: 'Practical regional clothing shaped by climate, ceremony and handloom traditions.',
      process: 'Cotton and silk fabrics are woven, dyed and draped for daily life, festivals and weddings. The saree and dhoti-kurta remain common traditional forms, often styled with local textiles and jewellery.',
      speciality: 'Clothing carries family customs and regional identity, while handloom work keeps weaving knowledge alive across communities.'
    },
    Festivals: {
      title: 'Chhath Puja',
      image: 'https://images.unsplash.com/photo-1602524814455-0aa0d0c4baa3?auto=format&fit=crop&w=1100&q=85',
      summary: 'A disciplined four-day festival dedicated to the Sun and gratitude for life, harvest and wellbeing.',
      process: 'Families prepare prasad, observe ritual cleanliness, fast and gather at rivers or ponds for evening and morning offerings to the setting and rising Sun.',
      speciality: 'The strong connection between family, community, water bodies and the Sun makes Chhath one of Bihar’s most distinctive living traditions.'
    },
    'Art & craft': {
      title: 'Madhubani Painting',
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1100&q=85',
      summary: 'A vibrant folk painting tradition from the Mithila region, filled with symbolic lines, figures and patterns.',
      process: 'Artists prepare a surface, sketch symbolic forms and fill them with natural or bright colours. Borders, repeated motifs and fine line work give each painting its visual rhythm.',
      speciality: 'Madhubani connects domestic art, mythology, nature and storytelling, and has grown from wall and floor painting into a respected contemporary craft.'
    },
    Heritage: {
      title: 'Bihar Heritage',
      sectionLabel: 'BIHAR · HERITAGE',
      summary: 'Two different heritage destinations that connect Bihar with Buddhist learning, pilgrimage and ancient knowledge networks.',
      items: [
        {
          title: 'Nalanda',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd442S9KryZZY3xYrOfpWYiNYQjLQ4bpu6NR0dBkZu1RZ1oeTPoIz7d3k&s=10',
          summary: 'The ruins of Nalanda preserve the memory of one of the ancient world’s great centres of learning.',
          process: 'Visitors walk through monastery courtyards, lecture spaces and archaeological remains that reveal how students and scholars lived and studied here.',
          speciality: 'Nalanda represents Bihar’s deep connection with scholarship, Buddhist philosophy, international exchange and ancient architecture.'
        },
        {
          title: 'Bodh Gaya',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2js6c0ZqDvjz9tdV4qf76nnAZY-xkXcI8lA6pX2H2Hw&s=10',
          summary: 'A major Buddhist pilgrimage destination associated with the Buddha’s enlightenment.',
          process: 'Pilgrims visit the Mahabodhi Temple complex, meditate near the sacred Bodhi Tree and take part in prayer, chanting and quiet reflection.',
          speciality: 'Bodh Gaya brings together spiritual practice, living pilgrimage and heritage architecture visited by people from Buddhist communities around the world.'
        }
      ]
    }
  }
};

function StateDetailPage() {
  const { stateName } = useParams();
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [activeFoodImage, setActiveFoodImage] = useState(null);
  const featureDetailRef = useRef(null);
  const state = states.find((item) => item.name === decodeURIComponent(stateName || ''));

  useEffect(() => {
    if (selectedFeature) {
      featureDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedFeature]);

  if (!state) {
    return (
      <div className="app theme-light detailPage">
        <main className="detailNotFound">
          <div className="eyebrow dark">CULTURAL PROFILE</div>
          <h1>State profile not found</h1>
          <button className="primary" type="button" onClick={() => navigate('/')}>
            Back to explore <ArrowRight size={16} />
          </button>
        </main>
      </div>
    );
  }

  const details = [
    ['Languages', state.languages, Languages, null],
    ['Traditional dress', state.dress, Crown, 'Traditional dress'],
    ['Food', state.food, Utensils, 'Food'],
    ['Festivals', state.festival, CalendarDays, 'Festivals'],
    ['Music & dance', state.dance, Music, null],
    ['Art & craft', state.art, Palette, 'Art & craft'],
    ['Heritage', state.heritage, Landmark, 'Heritage']
  ];
  const stateFeatureDetails = featureDetailsByState[state.name] || {};

  return (
    <div className="app theme-light detailPage">
      <header className="nav detailNav">
        <button className="brand" type="button" onClick={() => navigate('/')}>
          <span className="brandMark">✦</span>
          Indian Culture
        </button>
        <button className="backButton" type="button" onClick={() => navigate(-1)}>
          <ArrowRight className="backIcon" size={16} /> Back to explorer
        </button>
      </header>

      <main className="stateDetailMain">
        <button className="detailBackLink" type="button" onClick={() => navigate('/#states')}>
          <ArrowRight className="backIcon" size={16} /> All states
        </button>
        <section className="stateDetailHero">
          <img src={getStateImage(state.name, state.name.length)} alt={state.name} />
          <div className="stateDetailHeroText">
            <div className="eyebrow">{state.region}</div>
            <h1>{state.name}</h1>
            <p>{state.tradition}</p>
          </div>
        </section>

        <section className="detailContent">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">A CLOSER LOOK</div>
              <h2>The cultural character of {state.name}</h2>
              <p>Explore the living traditions, food, celebrations and heritage that make this state distinctive.</p>
            </div>
          </div>
          <div className="detailPageGrid">
            {details.map(([label, value, Icon, featureKey]) => (
              <article
                className={featureKey && stateFeatureDetails[featureKey] ? 'detailPageCard isInteractive' : 'detailPageCard'}
                key={label}
                onClick={() => featureKey && stateFeatureDetails[featureKey] && setSelectedFeature(stateFeatureDetails[featureKey])}
                role={featureKey && stateFeatureDetails[featureKey] ? 'button' : undefined}
                tabIndex={featureKey && stateFeatureDetails[featureKey] ? 0 : undefined}
                onKeyDown={(event) => {
                  if ((event.key === 'Enter' || event.key === ' ') && featureKey && stateFeatureDetails[featureKey]) setSelectedFeature(stateFeatureDetails[featureKey]);
                }}
              >
                <Icon size={22} />
                <div><span>{label}</span><strong>{value}</strong>{featureKey && stateFeatureDetails[featureKey] && <small>View photo and details <ArrowRight size={13} /></small>}</div>
              </article>
            ))}
          </div>
          {selectedFeature && (
            <article ref={featureDetailRef} className={selectedFeature.items ? 'featureDetailPanel foodFeaturePanel' : 'featureDetailPanel'}>
              {selectedFeature.items ? (
                <div className="foodFeatureSections">
                  <div className="eyebrow dark">{selectedFeature.sectionLabel || `${state.name.toUpperCase()} · FEATURED CULTURE`}</div>
                  <h3>{selectedFeature.title}</h3>
                  <p className="featureDetailSummary">{selectedFeature.summary || 'Explore these distinct cultural features, each with its own history and importance.'}</p>
                  {selectedFeature.items.map((item, index) => (
                    <section className={activeFoodImage === item.title ? 'foodFeatureSection isActive' : 'foodFeatureSection'} key={item.title}>
                      <button
                        className={activeFoodImage === item.title ? 'foodPhotoButton isClicked' : 'foodPhotoButton'}
                        type="button"
                        onClick={() => setActiveFoodImage((current) => current === item.title ? null : item.title)}
                        aria-label={`Highlight ${item.title} photo`}
                      >
                        <img src={item.image} alt={item.title} />
                      </button>
                      <div>
                        <span className="foodSectionNumber">0{index + 1}</span>
                        <h4>{item.title}</h4>
                        <p>{item.summary}</p>
                        <b>How it is made</b>
                        <p>{item.process}</p>
                        <b>What makes it special</b>
                        <p>{item.speciality}</p>
                      </div>
                    </section>
                  ))}
                  <button className="detailCloseButton" type="button" onClick={() => setSelectedFeature(null)}>Close details <X size={15} /></button>
                </div>
              ) : (
                <>
                  <div className={selectedFeature.images ? 'featureDetailGallery' : 'featureDetailGallery singleImage'}>
                    {(selectedFeature.images || [[selectedFeature.image, selectedFeature.title]]).map(([image, caption]) => (
                      <figure key={image}>
                        <img src={image} alt={caption} />
                        <figcaption>{caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                  <div className="featureDetailBody">
                    <div className="eyebrow dark">{state.name.toUpperCase()} · FEATURED CULTURE</div>
                    <h3>{selectedFeature.title}</h3>
                    <p className="featureDetailSummary">{selectedFeature.summary}</p>
                    <div className="featureDetailColumns">
                      <div><b>How it is made / celebrated</b><p>{selectedFeature.process}</p></div>
                      <div><b>What makes it special</b><p>{selectedFeature.speciality}</p></div>
                    </div>
                    <button className="detailCloseButton" type="button" onClick={() => setSelectedFeature(null)}>Close details <X size={15} /></button>
                  </div>
                </>
              )}
            </article>
          )}
          <div className="detailPageNote">
            <BookOpen size={22} />
            <div><strong>Keep exploring</strong><p>Culture changes across communities and districts. Use this profile as a starting point, then compare {state.name} with another state.</p></div>
          </div>
          <button className="primary detailExploreButton" type="button" onClick={() => navigate('/#compare')}>
            Compare states <ArrowRight size={16} />
          </button>
        </section>
      </main>
    </div>
  );
}

function App() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [selected, setSelected] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [compareA, setCompareA] = useState('Punjab');
  const [compareB, setCompareB] = useState('Kerala');
  const [mapFocus, setMapFocus] = useState('Punjab');
  const [theme, setTheme] = useState('light');
  const [cricketOpen, setCricketOpen] = useState(false);
  const [selectedCricketer, setSelectedCricketer] = useState(null);
  const [showAllStates, setShowAllStates] = useState(false);
  const [politicalSearch, setPoliticalSearch] = useState('');
  const [politicalRegion, setPoliticalRegion] = useState('All');
  const [selectedPoliticalState, setSelectedPoliticalState] = useState(null);
  const [showAllPoliticalStates, setShowAllPoliticalStates] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState('');
  const navigate = useNavigate();

  const regions = ['All', 'North India', 'South India', 'East India', 'West India', 'Central India', 'North-East India', 'Himalayan India'];

  const filteredStates = useMemo(() => {
    return states.filter((state) => {
      const matchRegion = region === 'All' || state.region === region;
      const text = Object.values(state).join(' ').toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [search, region]);

  const activeMapState = states.find((state) => state.name === mapFocus) || states[0];
  const activePoliticalState = politicalData.states.find((state) => state.name === activeMapState.name) || politicalData.states[0];
  const leftState = states.find((state) => state.name === compareA) || states[0];
  const rightState = states.find((state) => state.name === compareB) || states[1];
  const visibleStates = showAllStates || search || region !== 'All' ? filteredStates : filteredStates.slice(0, 4);
  const politicalStates = politicalData.states.filter((state) => {
    const searchText = Object.values(state).join(' ').toLowerCase();
    return (politicalRegion === 'All' || state.region === politicalRegion) && searchText.includes(politicalSearch.toLowerCase());
  });
  const visiblePoliticalStates = showAllPoliticalStates || politicalSearch || politicalRegion !== 'All' ? politicalStates : politicalStates.slice(0, 4);

  const compareFields = [
    { key: 'region', label: 'Region' },
    { key: 'languages', label: 'Language' },
    { key: 'food', label: 'Dish / Food' },
    { key: 'dress', label: 'Traditional Dress' },
    { key: 'festival', label: 'Festival' },
    { key: 'dance', label: 'Dance' },
    { key: 'art', label: 'Art / Craft' },
    { key: 'heritage', label: 'Heritage' },
    { key: 'tradition', label: 'Cultural Tradition' }
  ];

  const openState = (state) => {
    setMapFocus(state.name);
    navigate(`/state/${encodeURIComponent(state.name)}`);
  };

  const navScroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };

  return (
    <div className={theme === 'dark' ? 'app theme-dark' : 'app theme-light'}>
      <header className="nav">
        <div className="brand" onClick={() => navScroll('home')}>
          <span className="brandMark">✦</span>
          Indian Culture
        </div>

        <button className="hamb" onClick={() => setMobileMenu((v) => !v)}>
          <Menu />
        </button>

        <nav className={mobileMenu ? 'open' : ''}>
          {[['home', 'Home'], ['states', 'Explore States'], ['languages', 'Culture'], ['sports', 'Sports'], ['politics', 'Governance'], ['about', 'About']].map(([id, label]) => (
            <button key={id} onClick={() => navScroll(id)}>
              {label}
            </button>
          ))}
          <button className="themeToggle" onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <div className="search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                navScroll('states');
              }}
              placeholder="Search culture..."
            />
          </div>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="heroOverlay">
            <div className="eyebrow">IN A LIVING CULTURAL JOURNEY</div>
            <h1>
              Diversity of
              <br />
              <span>Indian Culture</span>
            </h1> 
            <h2>Unity in Diversity</h2>
            <p>Explore languages, food, festivals, arts, traditions and stories across all 28 states of India.</p>
            <div className="actions">
              <button className="primary" onClick={() => navScroll('states')}>
                Explore States <ArrowRight />
              </button>
              <button className="ghost" onClick={() => navScroll('map')}>
                View Map
              </button>
            </div>

            <div className="quickNavGrid">
              {[
                ['States & Regions', 'states'],
                ['Languages', 'languages'],
                ['Cuisine', 'cuisine'],
                ['Festivals', 'festivals'],
                ['Sports', 'sports'],
                ['Politics & Governance', 'politics']
              ].map(([label, target], index) => (
                <button key={label} type="button" className="quickNavCard" onClick={() => navScroll(target)}>
                  <span className="quickNavIndex">{String(index + 1).padStart(2, '0')}</span>
                  <span>{label}</span>
                  <ArrowRight className="quickNavArrow" size={15} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="intro">
          <div>
            <div className="eyebrow dark">INDIA, IN MANY VOICES</div>
            <h2>One country, many cultural worlds.</h2>
          </div>
          <p>
            India's cultural landscape is shaped by many languages, communities, landscapes, histories and artistic traditions.
            Explore examples rather than treating any state as culturally uniform.
          </p>
        </section>

        <section className="section regionSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">GEOGRAPHICAL & REGIONAL DIVERSITY</div>
              <h2>India's regional landscapes</h2>
              <p>Every region carries a distinct blend of climate, language, food, dress, heritage and culture.</p>
            </div>
          </div>

          <div className="regionGrid">
            {regionProfiles.map((region) => (
              <article key={region.name} className="regionCard">
                <h3>{region.name}</h3>
                <p><b>Major states:</b> {region.states}</p>
                <p><b>Languages:</b> {region.languages}</p>
                <p><b>Dress:</b> {region.dress}</p>
                <p><b>Food:</b> {region.food}</p>
                <p><b>Festivals:</b> {region.festivals}</p>
                <p><b>Dance/Music:</b> {region.dance}</p>
                <p><b>Art:</b> {region.art}</p>
                <p><b>Heritage:</b> {region.heritage}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="languages" className="section languageSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">LANGUAGES & SCRIPTS</div>
              <h2>A multilingual nation</h2>
              <p>India is home to many languages, scripts and oral traditions, each shaping everyday life, literature and identity.</p>
            </div>
          </div>

          <div className="languageGrid">
            {languageCards.map((item) => (
              <article key={item.name} className="miniCard languageCard">
                <div className="scriptBadge">{item.script}</div>
                <h3>{item.name}</h3>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="dresses" className="section dressSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">TRADITIONAL DRESSES</div>
              <h2>Regional identity in cloth</h2>
              <p>Fabrics, drapes and garments vary with climate, heritage, craft and local meaning.</p>
            </div>
          </div>

          <div className="cardGrid">
            {dressCards.map((dress) => (
              <article key={dress.state} className="featureCard">
                <img src={dress.image} alt={dress.name} />
                <div className="featureText">
                  <span>{dress.state}</span>
                  <h3>{dress.name}</h3>
                  <p>{dress.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="cuisine" className="section cuisineSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">INDIAN CUISINE</div>
              <h2>A taste of every region</h2>
              <p>Food traditions reflect local agriculture, climate, rituals and social life.</p>
            </div>
          </div>

          <div className="cardGrid">
            {cuisineCards.map((food) => (
              <article key={food.name} className="featureCard">
                <img src={food.image} alt={food.name} />
                <div className="featureText">
                  <span>{food.region}</span>
                  <h3>{food.name}</h3>
                  <p>{food.description}</p>
                  <small>{food.background}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="festivals" className="section festivalSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">FESTIVALS</div>
              <h2>Celebrations across communities</h2>
              <p>Festivals bring communities together and also reflect local rituals and seasonal rhythms.</p>
            </div>
          </div>

          <div className="cardGrid">
            {festivalCards.map((festival) => (
              <article key={festival.name} className="featureCard">
                <img src={festival.image} alt={festival.name} />
                <div className="featureText">
                  <span>{festival.region}</span>
                  <h3>{festival.name}</h3>
                  <p><b>Season:</b> {festival.season}</p>
                  <p>{festival.significance}</p>
                  <small>{festival.celebration}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="music" className="section musicSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">MUSIC & DANCE</div>
              <h2>Rhythm, art and identity</h2>
              <p>India's classical and folk traditions continue to inspire performance, memory and community culture.</p>
            </div>
          </div>

          <div className="cardGrid">
            {musicCards.map((item) => (
              <article key={item.name} className="featureCard">
                <img src={item.image} alt={item.name} />
                <div className="featureText">
                  <span>{item.type}</span>
                  <h3>{item.name}</h3>
                  <p>{item.note}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="art" className="section artSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">ART & HANDICRAFTS</div>
              <h2>Living traditions of making</h2>
              <p>Traditional art forms preserve memory, symbolism and community identity in visible form.</p>
            </div>
          </div>

          <div className="cardGrid">
            {artCards.map((art) => (
              <article key={art.name} className="featureCard">
                <img src={art.image} alt={art.name} />
                <div className="featureText">
                  <span>{art.state}</span>
                  <h3>{art.name}</h3>
                  <p>{art.background}</p>
                  <small>{art.note}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="heritage" className="section heritageSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">ARCHITECTURE & HERITAGE</div>
              <h2>Stone, memory and identity</h2>
              <p>India’s architectural heritage reflects centuries of faith, trade, empire, artistry and local craft.</p>
            </div>
          </div>

          <div className="cardGrid">
            {heritageCards.map((site) => (
              <article key={site.name} className="featureCard">
                <img src={site.image} alt={site.name} />
                <div className="featureText">
                  <span>{site.location}</span>
                  <h3>{site.name}</h3>
                  <p><b>{site.style}</b></p>
                  <small>{site.significance}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="knowledge" className="section knowledgeSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">INDIAN KNOWLEDGE & TRADITIONS</div>
              <h2>Knowledge systems and lived wisdom</h2>
              <p>India’s intellectual heritage includes language, philosophy, medicine, education and ecological understanding.</p>
            </div>
          </div>

          <div className="knowledgeGrid">
            {knowledgeCards.map((item) => (
              <article key={item.title} className="miniCard knowledgeFeatureCard">
                <img src={item.image} alt={item.title} />
                <div className="knowledgeCardBody">
                  <span>Living knowledge</span>
                <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section unitySection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">UNITY IN DIVERSITY</div>
              <h2>Different cultures, one shared heritage</h2>
              <p>India’s diversity is not a contradiction of unity; it is a living form of coexistence shaped by exchange and mutual belonging.</p>
            </div>
          </div>

          <div className="sharedHeritageLayout">
            <div className="sharedHeritageVisual">
              <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85" alt="People sharing a joyful community moment" />
              <div className="heritageQuote">
                <span>Many voices</span>
                <strong>One belonging</strong>
              </div>
            </div>

            <div className="sharedHeritageContent">
              <div className="heritageIntro">
                <span className="heritageNumber">01</span>
                <div>
                  <h3>Culture connects communities</h3>
                  <p>Languages, recipes, clothing and celebrations may change from one region to another, but they all carry memory, creativity and a sense of belonging.</p>
                </div>
              </div>

              <div className="unityFlow">
                <div className="flowNode">Languages</div>
                <div className="flowArrow">→</div>
                <div className="flowNode">Food</div>
                <div className="flowArrow">→</div>
                <div className="flowNode">Dress</div>
                <div className="flowArrow">→</div>
                <div className="flowNode">Festivals</div>
                <div className="flowArrow">→</div>
                <div className="flowNode highlight">Shared Heritage</div>
                <div className="flowArrow">→</div>
                <div className="flowNode unityNode">Unity</div>
              </div>

              <div className="heritageNote">
                <span>02</span>
                <p>Unity grows when every tradition is respected, remembered and allowed to evolve.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="modern" className="section modernSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">MODERN INDIA</div>
              <h2>Cultural evolution in contemporary life</h2>
              <p>Indian culture continues to evolve through migration, media, education, digital exchange and inter-state connection.</p>
            </div>
          </div>

          <div className="knowledgeGrid">
            {modernCards.map((item) => (
              <article key={item.title} className="miniCard knowledgeFeatureCard">
                <img src={item.image} alt={item.title} />
                <div className="knowledgeCardBody">
                  <span>Contemporary India</span>
                <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="states" className="section statesSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">EXPLORE ALL STATES</div>
              <h2>28 States & Their Diversity</h2>
              <p>Click any state to open a detailed cultural profile.</p>
            </div>
            <div className="count">
              {visibleStates.length}
              <small> states shown</small>
            </div>
          </div>

          <div className="toolbar">
            <div className="filterRow">
              {regions.map((r) => (
                <button key={r} className={region === r ? 'active' : ''} onClick={() => setRegion(r)}>
                  {r}
                </button>
              ))}
            </div>

            <div className="searchWide">
              <Search size={18} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search state, language, food, art..." />
            </div>
          </div>

          <div className="stateGrid">
            {visibleStates.map((state, index) => (
              <article className="stateCard" key={state.name} onClick={() => openState(state)}>
                <div className="stateImg">
                  <img src={getStateImage(state.name, index)} alt={state.name} />
                  <span>{state.region}</span>
                </div>
                <div className="stateBody">
                  <h3>{state.name}</h3>
                  <p>{state.languages}</p>
                  <div className="chips">
                    <b>{state.food.split(',')[0]}</b>
                    <b>{state.dance.split(',')[0]}</b>
                    <b>{state.art.split(',')[0]}</b>
                  </div>
                  <button>
                    Explore culture <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredStates.length > 4 && (
            <div className="statesMoreWrap">
              <button className="statesMoreButton" type="button" onClick={() => setShowAllStates((current) => !current)}>
                {showAllStates ? 'Show fewer states' : `View all ${filteredStates.length} states`}
                <ArrowRight className={showAllStates ? 'rotateArrow' : ''} size={16} />
              </button>
            </div>
          )}
        </section>

        <section id="map" className="section mapSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">INTERACTIVE INDIA MAP</div>
              <h2>Hover and click each state</h2>
              <p>Move the cursor over a state to highlight it and click to open its complete cultural details.</p>
            </div>
          </div>

          <div className="mapLayout">
            <div className="indiaMapPanel">
              <svg className="indiaMapSvg" viewBox={indiaMap.viewBox} role="img" aria-label="Interactive map of India">
                <title>Click a state boundary to open its cultural profile</title>
                {indiaMap.locations.map((location, index) => {
                  const stateInfo = states.find((state) => state.name === location.name);
                  if (!stateInfo) return null;
                  const isActive = mapFocus === stateInfo.name;
                  return (
                    <path
                      key={location.id}
                      d={location.path}
                      className={isActive ? 'stateBoundary active' : 'stateBoundary'}
                      style={{ '--state-color': mapColors[index % mapColors.length] }}
                      onMouseEnter={() => setMapFocus(stateInfo.name)}
                      onClick={() => openState(stateInfo)}
                      aria-label={`Open ${stateInfo.name} details`}
                      role="button"
                      tabIndex="0"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') openState(stateInfo);
                      }}
                    />
                  );
                })}
                {Object.entries(mapLabelPositions).map(([name, [x, y]]) => (
                  <text key={name} x={x} y={y} className="stateMapLabel" textAnchor="middle">
                    {name === 'Jammu and Kashmir' ? 'J&K' : name}
                  </text>
                ))}
              </svg>
            </div>

            <aside className="mapDetail">
              <div className="eyebrow dark">STATE FOCUS</div>
              <h3>{activeMapState.name}</h3>
              <p className="mapIntro">{activeMapState.tradition}</p>
              <div className="detailGrid compact">
                <div><b>Region</b><span>{activeMapState.region}</span></div>
                <div><b>Languages</b><span>{activeMapState.languages}</span></div>
                <div><b>Food</b><span>{activeMapState.food}</span></div>
                <div><b>Dress</b><span>{activeMapState.dress}</span></div>
                <div><b>Festival</b><span>{activeMapState.festival}</span></div>
                <div><b>Dance</b><span>{activeMapState.dance}</span></div>
              </div>
              <div className="mapPoliticsSummary"><b>Politics</b><span>Chief Minister: {activePoliticalState.chiefMinister}</span><span>Capital: {activePoliticalState.capital}</span><button type="button" onClick={() => setSelectedPoliticalState(activePoliticalState)}>Open politics details <ArrowRight size={14} /></button></div>
              <button className="primary" onClick={() => openState(activeMapState)}>
                Open full details
              </button>
            </aside>
          </div>
        </section>

        <section id="compare" className="section compareSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">STATE COMPARISON</div>
              <h2>Compare any two states</h2>
              <p>See the differences in food, dress, festivals, language and art side by side.</p>
            </div>
          </div>

          <div className="compareControls">
            <label>
              State 1
              <select value={compareA} onChange={(e) => setCompareA(e.target.value)}>
                {states.map((state) => (
                  <option key={state.name} value={state.name}>{state.name}</option>
                ))}
              </select>
            </label>

            <button
              className="swapBtn"
              onClick={() => {
                const temp = compareA;
                setCompareA(compareB);
                setCompareB(temp);
              }}
            >
              Swap
            </button>

            <label>
              State 2
              <select value={compareB} onChange={(e) => setCompareB(e.target.value)}>
                {states.map((state) => (
                  <option key={state.name} value={state.name}>{state.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="compareTable">
            <div className="compareHeader compareRow">
              <div className="compareCell label">Category</div>
              <div className="compareCell stateName">{leftState.name}</div>
              <div className="compareCell stateName">{rightState.name}</div>
            </div>

            {compareFields.map((field) => (
              <div key={field.key} className="compareRow">
                <div className="compareCell label">{field.label}</div>
                <div className="compareCell">{leftState[field.key]}</div>
                <div className="compareCell">{rightState[field.key]}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="sports" className="section sportsSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">INDIA IN SPORT</div>
              <h2>Champions, disciplines and winning moments</h2>
              <p>Explore the sports that bring India together and the athletes whose discipline, courage and achievements have inspired generations.</p>
            </div>
          </div>

          <div className="sportsSubsection">
            <div className="subsectionHeading">
              <span>01</span>
              <div>
                <h3>Indian sports & disciplines</h3>
                <p>From cricket and hockey to chess, athletics and para-sports, Indian sporting culture is broad, regional and constantly evolving.</p>
              </div>
            </div>
            <div className="sportsDisciplineGrid">
              {sportsDisciplines.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={item.name === 'Cricket' ? 'disciplineCard disciplineCardButton activeDiscipline' : 'disciplineCard disciplineCardButton'}
                  onClick={() => item.name === 'Cricket' && setCricketOpen((current) => !current)}
                >
                  <div className="disciplineIcon" aria-hidden="true">{item.icon}</div>
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.note}</p>
                    {item.name === 'Cricket' && <span className="disciplineAction">{cricketOpen ? 'Hide cricket roster' : 'Open player roster'} <ArrowRight size={14} /></span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={cricketOpen ? 'sportsSubsection championsSubsection cricketRoster isOpen' : 'sportsSubsection championsSubsection cricketRoster'}>
            <div className="subsectionHeading">
              <span>02</span>
              <div>
                <h3>{cricketOpen ? 'Indian cricket player roster' : 'Indian champions'}</h3>
                <p>{cricketOpen ? 'Select any player to open a fuller profile with career context and major milestones.' : 'Meet athletes from different sports and generations, with their landmark achievements in a quick, visual format.'}</p>
              </div>
            </div>
            <div className="sportsPlayerGrid">
              {(cricketOpen ? cricketPlayers : sportsPlayers).map((player) => (
                <article key={player.name} className="sportsPlayerCard">
                  <img src={player.image} alt={player.name} />
                  <div className="sportsPlayerBody">
                    <span>{player.sport}</span>
                    <h4>{player.name}</h4>
                    <p>{player.achievement}</p>
                    {cricketOpen && <button type="button" className="playerDetailsButton" onClick={() => setSelectedCricketer(player)}>View details <ArrowRight size={14} /></button>}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="sportsSubsection winningSubsection">
            <div className="subsectionHeading">
              <span>03</span>
              <div>
                <h3>Winning moments</h3>
                <p>A visual timeline of landmark victories that have shaped India’s sporting memory.</p>
              </div>
            </div>
            <div className="winningMomentGrid">
              {winningMoments.map((moment) => (
                <article key={moment.year + moment.title} className="winningMomentCard">
                  <img src={moment.image} alt={moment.title} />
                  <div>
                    <strong>{moment.year}</strong>
                    <h4>{moment.title}</h4>
                    <p>{moment.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="politics" className="section politicsSection">
          <div className="politicsHero">
            <div>
              <div className="eyebrow dark">CIVIC LEARNING</div>
              <h2>Politics & Governance of India 🇮🇳</h2>
              <p className="politicsLead">Understanding India's democratic institutions, elected representatives and state governments.</p>
              <p>Explore India's Union Government and the governments of all 28 states through factual information about constitutional offices and public representatives.</p>
            </div>
            <div className="politicsStats">
              <div><Shield size={20} /><strong>Prime Minister</strong><span>Union executive</span></div>
              <div><Building2 size={20} /><strong>28 States</strong><span>State governments</span></div>
              <div><Landmark size={20} /><strong>8 UTs</strong><span>Union Territories</span></div>
            </div>
          </div>

          <div className="unionOfficeGrid">
            <article className="primeMinisterCard">
              <div className="officePhoto"><img src={politicalData.primeMinister.image} alt={politicalData.primeMinister.name} /></div>
              <div className="officeBody">
                <span className="politicsLabel">UNION GOVERNMENT</span>
                <h3>Prime Minister of India</h3>
                <h4>{politicalData.primeMinister.name}</h4>
                <p><b>Office:</b> {politicalData.primeMinister.office}</p>
                <p><b>In office since:</b> {politicalData.primeMinister.since}</p>
                <a href={politicalData.primeMinister.source} target="_blank" rel="noreferrer">Official profile <ExternalLink size={14} /></a>
              </div>
            </article>
            <article className="unionInfoCard">
              <span className="politicsLabel">CONSTITUTIONAL OFFICE</span>
              <h3>President of India</h3>
              <p className="unionName">{politicalData.president.name}</p>
              <p>The President is the constitutional Head of State. The official profile and current information are maintained by the President's Secretariat.</p>
              <a href={politicalData.president.source} target="_blank" rel="noreferrer">President of India <ExternalLink size={14} /></a>
            </article>
          </div>

          <div className="politicsSectionHead">
            <div>
              <div className="eyebrow dark">STATE GOVERNMENTS</div>
              <h3>Chief Ministers of India's 28 States</h3>
              <p>Search a state, office-holder or party. Select a card for the state’s politics and culture overview.</p>
            </div>
            <small>Political information last verified: {politicalData.lastVerified}</small>
          </div>

          <div className="politicsToolbar">
            <div className="politicsSearch"><Search size={17} /><input value={politicalSearch} onChange={(e) => setPoliticalSearch(e.target.value)} placeholder="Search states, Chief Ministers or public representatives..." /></div>
            <div className="politicsFilters">
              {['All', 'North India', 'South India', 'East India', 'West India', 'Central India', 'North-East India', 'Himalayan India'].map((item) => (
                <button key={item} className={politicalRegion === item ? 'active' : ''} onClick={() => setPoliticalRegion(item)}>{item}</button>
              ))}
            </div>
          </div>

          <div className="politicalStateGrid">
            {visiblePoliticalStates.map((politicalState) => (
              <article key={politicalState.name} className="politicalStateCard" onClick={() => setSelectedPoliticalState(politicalState)}>
                <div className="politicalCardTop"><span>{politicalState.region}</span><span>{politicalState.capital}</span></div>
                <h4>{politicalState.name}</h4>
                <p className="cmName">{politicalState.chiefMinister}</p>
                <p className="officeMuted">Chief Minister · {politicalState.party}</p>
                <div className="politicalCardFooter">View public representatives <ArrowRight size={15} /></div>
              </article>
            ))}
          </div>

          {politicalStates.length > 4 && (
            <div className="statesMoreWrap politicsMoreWrap">
              <button className="statesMoreButton" type="button" onClick={() => setShowAllPoliticalStates((current) => !current)}>
                {showAllPoliticalStates ? 'Show fewer states' : `View all ${politicalStates.length} states`}
                <ArrowRight className={showAllPoliticalStates ? 'rotateArrow' : ''} size={16} />
              </button>
            </div>
          )}

          <div className="governanceLearning">
            <div className="politicsSectionHead compactHead"><div><div className="eyebrow dark">CIVIC STRUCTURE</div><h3>How India's Democracy Works</h3></div></div>
            <div className="democracyFlow">
              {['Citizens', 'Elections', 'Elected Representatives', 'Legislatures', 'Government', 'Public Administration'].map((item, index) => <div key={item} className="democracyStep"><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong>{index < 5 && <ArrowRight size={16} />}</div>)}
            </div>
            <p className="governanceNote">India has a Union Government and State Governments. Parliament legislates at the Union level, while State Legislative Assemblies make laws within the constitutional division of responsibilities. The President and Governors are constitutional heads; the Prime Minister and Chief Ministers lead their respective elected governments.</p>
          </div>

          <div className="governmentCompareWrap">
            <h3>Union Government vs State Government</h3>
            <div className="governmentCompare"><div className="compareGovRow compareGovHeader"><b>Feature</b><b>Union Government</b><b>State Government</b></div><div className="compareGovRow"><span>Head of State</span><span>President</span><span>Governor</span></div><div className="compareGovRow"><span>Head of Government</span><span>Prime Minister</span><span>Chief Minister</span></div><div className="compareGovRow"><span>Legislature</span><span>Parliament</span><span>State Legislature</span></div><div className="compareGovRow"><span>Main legislative bodies</span><span>Lok Sabha & Rajya Sabha</span><span>Legislative Assembly; Council where applicable</span></div><div className="compareGovRow"><span>Jurisdiction</span><span>Union subjects and shared constitutional responsibilities</span><span>State subjects and shared constitutional responsibilities</span></div></div>
          </div>

          <div className="unionCabinetAndParties">
            <article className="unionCabinetCard"><div className="eyebrow dark">UNION GOVERNMENT</div><h3>Union Government of India</h3><p>The Union executive includes the President, Prime Minister and Council of Ministers. Portfolios and office-holders can change, so use the official Cabinet Secretariat and PM India pages for the current list.</p><a href="https://cabsec.gov.in/" target="_blank" rel="noreferrer">View current Union Council of Ministers <ExternalLink size={14} /></a></article>
            <article className="partyPanel"><div className="eyebrow dark">NEUTRAL OVERVIEW</div><h3>Political Parties</h3><p>India has national and state-level political parties. This list is informational and does not rank or recommend any party.</p><div className="partyGrid">{politicalParties.map(([name, category, source]) => <a key={name} href={source} target="_blank" rel="noreferrer"><strong>{name}</strong><span>{category} party <ExternalLink size={12} /></span></a>)}</div></article>
          </div>

          <div className="politicalSources"><h3>Sources & References</h3><p>Office-holder information may change following elections, appointments or other constitutional processes. Please refer to the linked official sources for the latest information.</p><div><a href="https://www.pmindia.gov.in/en/" target="_blank" rel="noreferrer">PM India <ExternalLink size={13} /></a><a href="https://www.presidentofindia.gov.in/" target="_blank" rel="noreferrer">President of India <ExternalLink size={13} /></a><a href="https://www.india.gov.in/" target="_blank" rel="noreferrer">National Portal of India <ExternalLink size={13} /></a><a href="https://sansad.in/" target="_blank" rel="noreferrer">Parliament of India <ExternalLink size={13} /></a></div></div>
        </section>

        <section id="discover" className="section discover">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">CULTURAL LAYERS</div>
              <h2>Explore India's Diversity</h2>
            </div>
          </div>

          <div className="featureGrid">
            {sections.map(([title, sub, desc], i) => (
              <article className="feature" key={title}>
                <div className="featureIcon">
                  {[
                    <Languages key="lang" />,
                    <Crown key="crown" />,
                    <Utensils key="utensils" />,
                    <CalendarDays key="calendar" />,
                    <Music key="music" />,
                    <Palette key="palette" />,
                    <Landmark key="landmark" />,
                    <BookOpen key="book" />
                  ][i]}
                </div>
                <div>
                  <h3>{title}</h3>
                  <h4>{sub}</h4>
                  <p>{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="unity">
          <div className="unityArt">
            <div className="orbit">LANGUAGES</div>
            <div className="orbit o2">FOOD</div>
            <div className="orbit o3">DRESS</div>
            <div className="center">
              SHARED
              <br />
              <span>HERITAGE</span>
            </div>
          </div>

          <div>
            <div className="eyebrow dark">UNITY IN DIVERSITY</div>
            <h2>
              Different paths.
              <br />
              One shared heritage.
            </h2>
            <p>
              Languages, cuisines, clothing, festivals, music, art and traditions can be different while communities participate in a shared civic and cultural life.
            </p>
            <div className="flow">
              <span>Different Cultures</span>
              <b>→</b>
              <span>Shared Heritage</span>
              <b>→</b>
              <span>Unity</span>
            </div>
          </div>
        </section>

        <section id="quiz" className="section quiz">
          <div className="quizCard">
            <div>
              <div className="eyebrow dark">CULTURAL QUIZ</div>
              <h2>Test Your Knowledge</h2>
              <p>Question 1 of 4</p>
              <h3>Which state is famous for Madhubani painting?</h3>
              <div className="answers">
                <button>Bihar</button>
                <button>Gujarat</button>
                <button>Kerala</button>
                <button>Punjab</button>
              </div>
            </div>

            <div className="quizVisual">
              🇮🇳
              <span>Learn<br />through<br />curiosity.</span>
            </div>
          </div>
        </section>

        <section id="gallery" className="section gallery">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">VISUAL JOURNEY</div>
              <h2>Cultural Gallery</h2>
            </div>
          </div>

          <div className="galleryGrid">
            {galleryItems.map((item) => (
              <figure className="galleryItem" key={item.name}>
                <img src={item.image} alt={item.name} />
                <figcaption><span>{item.category}</span><strong>{item.name}</strong></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="facts">
          <div>
            <div className="eyebrow">DID YOU KNOW?</div>
            <h2>{facts[factIndex]}</h2>
          </div>
          <button onClick={() => setFactIndex((prev) => (prev + 1) % facts.length)}>
            <Shuffle /> New fact
          </button>
        </section>

        <section id="about" className="about section">
          <div>
            <div className="eyebrow dark">ABOUT THE PROJECT</div>
            <h2>Indian Culture Explorer</h2>
            <p>
              A presentation-ready educational interface for exploring cultural diversity across India's states.
              The content is illustrative and intentionally avoids presenting any single tradition as representative of an entire state.
            </p>
          </div>

          <div className="refBox">
            <h3>Sources & References</h3>
            <p>
              State/UT structure: Government of India portals. Cultural examples should be cross-checked with state tourism, culture departments, museums and authoritative cultural institutions before academic publication.
            </p>
            <p className="small">The current interface includes all 28 states; Union Territories can be added as a separate collection.</p>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand">
          <span className="brandMark">✦</span>
          Indian Culture
        </div>
        <div className="footerCreator"><p>Created by <strong>Suman Sagar</strong></p><button type="button" onClick={() => { setContactStatus(''); setContactOpen(true); }}>Contact me</button></div>
        <div className="footerLinks"><button onClick={() => navScroll('politics')}>Politics</button><a href="https://www.india.gov.in/" target="_blank" rel="noreferrer">Official Government Sources</a></div>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button>
      </footer>

      {contactOpen && (
        <div className="modal contactModal" onClick={() => setContactOpen(false)}>
          <div className="contactCard" onClick={(event) => event.stopPropagation()}>
            <button className="close" type="button" onClick={() => setContactOpen(false)} aria-label="Close contact form"><X /></button>
            <div className="eyebrow dark">GET IN TOUCH</div>
            <h2>Contact Suman Sagar</h2>
            <p className="contactIntro">Have a question or suggestion about Indian Culture Explorer? Send a message or connect through Instagram.</p>
            <form onSubmit={async (event) => {
              event.preventDefault();
              setContactStatus('sending');
              try {
                const response = await fetch('https://formspree.io/f/myezkgra', {
                  method: 'POST',
                  body: new FormData(event.currentTarget),
                  headers: { Accept: 'application/json' }
                });
                if (!response.ok) throw new Error('Form submission failed');
                event.currentTarget.reset();
                setContactStatus('success');
              } catch {
                setContactStatus('error');
              }
            }}>
              <label>Name<input name="name" required placeholder="Your name" /></label>
              <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
              <label>Message<textarea name="message" required rows="4" placeholder="Write your message..."></textarea></label>
              <button className="primary contactSubmit" type="submit" disabled={contactStatus === 'sending'}><Mail size={16} /> {contactStatus === 'sending' ? 'Sending...' : 'Send message'}</button>
            </form>
            {contactStatus === 'success' && <p className="contactSuccess">Message sent successfully. Thank you for contacting me.</p>}
            {contactStatus === 'error' && <p className="contactError">Message could not be sent. Please try again.</p>}
            <a className="instagramLink" href="https://www.instagram.com/yadav_sagar14/?hl=en" target="_blank" rel="noreferrer"><Instagram size={18} /> Follow on Instagram <ExternalLink size={14} /></a>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>
              <X />
            </button>
            <img src={getStateImage(selected.name, selected.name.length)} alt={selected.name} />
            <div className="modalContent">
              <div className="eyebrow dark">{selected.region}</div>
              <h2>{selected.name}</h2>
              <p className="lead">{selected.tradition}</p>
              <div className="detailGrid">
                <div><b>Languages</b><span>{selected.languages}</span></div>
                <div><b>Traditional dress</b><span>{selected.dress}</span></div>
                <div><b>Food</b><span>{selected.food}</span></div>
                <div><b>Festivals</b><span>{selected.festival}</span></div>
                <div><b>Music & dance</b><span>{selected.dance}</span></div>
                <div><b>Art & craft</b><span>{selected.art}</span></div>
                <div><b>Heritage</b><span>{selected.heritage}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPoliticalState && (
        <div className="modal politicsModal" onClick={() => setSelectedPoliticalState(null)}>
          <div className="modalCard politicsModalCard" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelectedPoliticalState(null)} aria-label="Close politics details"><X /></button>
            <div className="politicsModalHeader"><div className="eyebrow dark">POLITICS & GOVERNANCE</div><h2>{selectedPoliticalState.name}</h2><p>{selectedPoliticalState.region} · Capital: {selectedPoliticalState.capital}</p></div>
            <div className="politicsDetailGrid">
              <div><b>Chief Minister</b><span>{selectedPoliticalState.chiefMinister}</span><small>{selectedPoliticalState.party}</small></div>
              <div><b>Governor</b><span>{selectedPoliticalState.governor}</span><small>See official state profile</small></div>
              <div><b>Assembly Speaker</b><span>{selectedPoliticalState.speaker}</span></div>
              <div><b>Leader of Opposition</b><span>{selectedPoliticalState.opposition}</span></div>
            </div>
            <div className="politicsRepresentatives"><h3>Other Key Public Representatives</h3><p>Official legislative profiles should be used for current deputy ministers, speakers and opposition office-holders.</p><a href={selectedPoliticalState.source} target="_blank" rel="noreferrer">Open official state government source <ExternalLink size={14} /></a></div>
            <div className="politicsModalLinks"><a href={selectedPoliticalState.source} target="_blank" rel="noreferrer">State government source <ExternalLink size={14} /></a><button type="button" onClick={() => { setSelectedPoliticalState(null); openState(states.find((state) => state.name === selectedPoliticalState.name) || states[0]); }}>Open culture profile <ArrowRight size={14} /></button></div>
          </div>
        </div>
      )}

      {selectedCricketer && (
        <div className="modal sportsModal" onClick={() => setSelectedCricketer(null)}>
          <div className="modalCard sportsModalCard" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelectedCricketer(null)} aria-label="Close player details">
              <X />
            </button>
            <img src={selectedCricketer.image} alt={selectedCricketer.name} />
            <div className="modalContent">
              <div className="eyebrow dark">{selectedCricketer.sport}</div>
              <h2>{selectedCricketer.name}</h2>
              <p className="sportsRole">{selectedCricketer.role}</p>
              <p className="lead">{selectedCricketer.details}</p>
              <div className="sportsHighlightBox">
                <b>Major highlights</b>
                <span>{selectedCricketer.highlights}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/state/:stateName" element={<StateDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<Root />);
