import { paysParNom } from "./pays";

/**
 * Principales villes par pays, classées par population décroissante.
 *
 * Extrait du jeu de données GeoNames (cities500) : les 15 plus grandes villes de
 * chacun des 54 pays africains, 809 entrées au total — 4,5 Ko une fois compressé.
 *
 * Ces villes ne sont que des SUGGESTIONS. Le champ ville reste libre : une liste
 * fermée empêcherait quelqu un de Bouaké ou de Garoua de s inscrire correctement.
 */
export const VILLES_PAR_PAYS: Record<string, string[]> = {
  AO: ["Luanda", "Lubango", "Huambo", "Benguela", "Cabinda", "Malanje", "Saurimo", "Lobito", "Cuíto", "Uíge", "Luena", "Mossamedes", "Menongue", "Chitato", "Sumbe"],
  BF: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Saaba", "Ouahigouya", "Kaya", "Banfora", "Pouytenga", "Houndé", "Fada N'gourma", "Nioko I", "Dédougou", "Tenkodogo", "Djibo", "Kongoussi"],
  BI: ["Bujumbura", "Gitega", "Ngozi", "Rumonge", "Cibitoke", "Kayanza", "Bubanza", "Vyanda", "Zanandore", "Gatumba", "Karuzi", "Kirundo", "Muyinga", "Makamba", "Ruyigi"],
  BJ: ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Godomè", "Abomey", "Djougou", "Bohicon", "Ekpé", "Nikki", "Malanville", "Kandi", "Kérou", "Natitingou", "Pobé"],
  BW: ["Gaborone", "Francistown", "Mogoditshane", "Maun", "Molepolole", "Serowe", "Tlokweng", "Palapye", "Mochudi", "Mahalapye", "Kanye", "Selebi-Phikwe", "Letlhakane", "Ramotswa", "Lobatse"],
  CD: ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani", "Bukavu", "Kolwezi", "Likasi", "Tshikapa", "Kikwit", "Masina", "Mbandaka", "Goma", "Matadi", "Uvira"],
  CF: ["Bangui", "Bimbo", "Bégoua", "Carnot", "Berbérati", "Bambari", "Bouar", "Bossangoa", "Kaga-Bandoro", "Bangassou", "Paoua", "Bria", "Kouango", "Bocaranga", "Baboua"],
  CG: ["Brazzaville", "Pointe-Noire", "Dolisie", "Nkayi", "Kayes", "Impfondo", "Ouesso", "Owando", "Sibiti", "Loutété", "Bouansa", "Gamboma", "Loandjili", "Mossaka", "Mindouli"],
  CI: ["Abidjan", "Abobo", "Bouaké", "Korhogo", "Daloa", "Koumassi", "San-Pédro", "Gagnoa", "Yamoussoukro", "Sinfra", "Man", "Marcory", "Bondoukou", "Dabou", "Divo"],
  CM: ["Douala", "Yaoundé", "Bamenda", "Bafoussam", "Maroua", "Ngaoundéré", "Kumba", "Nkongsamba", "Buea", "Kousséri", "Bertoua", "Limbe", "Foumban", "Kumbo", "Edéa"],
  CV: ["Praia", "Mindelo", "Espargos", "Assomada", "Tarrafal", "Porto Novo", "Sal Rei", "São Filipe", "Pedra Badejo", "Santa Cruz", "Santa Maria", "Calheta", "Vila do Maio", "Tarrafal de São Nicolau", "Igreja"],
  DJ: ["Djibouti", "Ali Sabih", "Dikhil", "Tadjoura", "Arta", "Obock", "‘As ‘Êla", "Damêrdjôg", "Ouê‘a", "‘Ali ‘Addé", "Holhol", "Waddi", "Khôr Angar", "Yoboki", "Randa"],
  DZ: ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna City", "Bab Ezzouar", "Djelfa", "Sétif", "Sidi Bel Abbes", "Biskra", "Tébessa", "El Oued", "Skikda", "Tiaret"],
  EG: ["Cairo", "Alexandria", "Giza", "Shubrā al Khaymah", "Port Said", "Suez", "Al Mansurah", "Al Maḩallah al Kubrá", "Tanta", "Assiut", "Al Fayyum", "Al Khuşūş", "Zagazig", "Ismailia", "Luxor"],
  ER: ["Asmara", "Keren", "Himora", "Massawa", "Assab", "Mendefera", "Barentu", "Adi Keyh", "Edd", "Dek’emhāre", "Ak’ordat", "Dbarwa", "Dehalak’ Kebīr", "Quandeba"],
  ET: ["Addis Ababa", "Jijiga", "Gonder", "Mek'ele", "Nazrēt", "Awasa", "Bahir Dar", "Dire Dawa", "Dessie", "Jimma", "Shashamane", "Bishoftu", "Sodo", "Arba Minch", "Hosa’ina"],
  GA: ["Libreville", "Port-Gentil", "Franceville", "Owendo", "Oyem", "Moanda", "Ntoum", "Lambaréné", "Mouila", "Akanda", "Tchibanga", "Bitam", "Koulamoutou", "Oyam", "Makokou"],
  GH: ["Kumasi", "Accra", "Tamale", "Takoradi", "Sekondi", "Cape Coast", "Atsiaman", "Ashaiman", "Obuase", "Tema", "Koforidua", "Sekondi-Takoradi", "Ho", "Amanfrom", "Medina Estates"],
  GM: ["Serekunda", "Brikama", "Sukuta", "Talinding", "Faji Kunda", "Bakau", "Banjul", "Nema Kunku", "Farafenni", "Busumbala", "Lamin", "Welingara", "Brufut", "Sanchaba", "Gunjur"],
  GN: ["Conakry", "Camayenne", "Nzérékoré", "Kankan", "Manéah", "Dubréka", "Kindia", "Siguiri", "Kissidougou", "Kamsar", "Labé", "Gueckedou", "Mamou", "Coyah", "Faranah"],
  GQ: ["Bata", "Malabo", "Ebebiyin", "Aconibe", "Añisoc", "Luba", "Evinayong", "Mongomo", "Aual", "Mikomeseng", "Rebola", "Cogo", "San Antonio de Palé", "Mbini", "Nsok"],
  GW: ["Bissau", "Gabú", "Bafatá", "Xitole", "Canchungo", "Bissorã", "Jabicunda", "Madina do Boé", "Bolama", "Cacheu", "Bula", "Farim", "Catió", "Mansôa", "Bubaque"],
  KE: ["Nairobi", "Kakamega", "Mombasa", "Nakuru", "Ruiru", "Eldoret", "Kisumu", "Kikuyu", "Thika", "Naivasha", "Karuri", "Ongata Rongai", "Garissa", "Kitale", "Limuru"],
  KM: ["Moroni", "Moutsamoudou", "Fomboni", "Tsimbeo", "Domoni", "Mirontsi", "Adda-Douéni", "Ouani", "Sima", "Koni-Djodjo", "Moya", "Chandra", "Ouellah", "Ikoni", "Mrémani"],
  LR: ["Monrovia", "Gbarnga", "Buchanan", "Ganta", "Kakata", "Zwedru", "Harbel", "Harper", "Pleebo City", "Foya Kamara", "New Yekepa", "Voinjama", "Tubmanburg", "Saclepea", "Greenville"],
  LS: ["Maseru", "Maputsoe", "Mohale's Hoek", "Mafeteng", "Hlotse", "Butha-Buthe", "Mabote", "Quthing", "Teyateyaneng", "Qacha’s Nek", "Thaba-Tseka", "Mokhotlong", "Roma", "Mapoteng", "Nako"],
  LY: ["Tripoli", "Benghazi", "Misratah", "Zliten", "Al Khums", "Az Zāwīyah", "Zawiya", "Janzūr", "Sabha", "Tobruk", "Ajdabiya", "Al Ajaylat", "Al Bayḑā’", "Al Jadīd", "Sirte"],
  MA: ["Casablanca", "Rabat", "Fes", "Tangier", "Marrakesh", "Salé", "Agadir", "Meknes", "Oujda", "Kenitra", "Tétouan", "Al Hoceïma", "Temara", "Safi", "Mohammedia"],
  MG: ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga", "Fianarantsoa", "Toliara", "Antsiranana", "Sambava", "Imerintsiatosika", "Antalaha", "Tôlanaro", "Antanifotsy", "Ambovombe", "Ambilobe", "Ambanja"],
  ML: ["Bamako", "Sikasso", "Koutiala", "Ségou", "Kayes", "Mopti", "Kalaban Koro", "Gao", "Kati", "San", "Bougouni", "Timbuktu", "Kita", "Dialakorodji", "Koulikoro"],
  MR: ["Nouakchott", "Nouadhibou", "Kiffa", "Dar Naim", "Néma", "Mbera", "Kaédi", "Zouérat", "Tevragh Zeina", "Sélibaby", "Atar", "Ayoun El Atrous", "Guerou", "Boutilimitt", "Tékane"],
  MU: ["Port Louis", "Vacoas", "Beau Bassin-Rose Hill", "Curepipe", "Quatre Bornes", "Triolet", "Goodlands", "Bel Air Rivière Sèche", "Bambous", "Centre de Flacq", "Mahébourg", "Saint Pierre", "Le Hochet", "Baie du Tombeau", "Trou aux Biches"],
  MW: ["Lilongwe", "Blantyre", "Mzuzu", "Zomba", "Karonga", "Kasungu", "Mangochi", "Salima", "Liwonde", "Balaka", "Dedza", "Nkhotakota", "Mchinji", "Nsanje", "Mzimba"],
  MZ: ["Maputo", "Matola", "Nampula", "Beira", "Chimoio", "Tete", "Quelimane", "Lichinga", "Nacala", "Pemba", "Mocuba", "Gurúè", "Xai-Xai", "Maxixe", "Mandimba"],
  NA: ["Windhoek", "Rundu", "Walvis Bay", "Swakopmund", "Oshakati", "Rehoboth", "Katima Mulilo", "Otjiwarongo", "Ondangwa", "Okahandja", "Grootfontein", "Ongwediva", "Keetmanshoop", "Helao Nafidi", "Tsumeb"],
  NE: ["Niamey", "Maradi", "Zinder", "Tahoua", "Agadez", "Arlit", "Alaghsas", "Birni N Konni", "Dosso", "Gaya", "Tessaoua", "Diffa", "Dogondoutchi", "Dakoro", "Téra"],
  NG: ["Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Kaduna", "Benin City", "Onitsha", "Aba", "Maiduguri", "Ilorin", "Jos", "Sokoto", "Zaria", "Enugu"],
  RW: ["Kigali", "Gisenyi", "Musanze", "Nyagatare", "Gitarama", "Muhanga", "Butare", "Kibuye", "Rwamagana", "Kibungo", "Cyangugu", "Shyorongi", "Byumba", "Ndera", "Kirambo"],
  SC: ["Victoria", "Cascade", "Perseverance", "Baie Sainte Anne", "Baie Lazare", "Anse aux Pins", "Glacis", "Grand'Anse", "English River", "Anse Boileau", "Bel Ombre", "Beau Vallon", "La Digue", "Roche Caïman", "Anse Royale"],
  SD: ["Khartoum", "Omdurman", "Khartoum North", "Nyala", "Port Sudan", "Kassala", "El Obeid", "Al Qadarif", "Kosti", "Wad Medani", "El Daein", "El Fasher", "Singa", "Ad-Damazin", "Geneina"],
  SL: ["Freetown", "Bo", "Kenema", "Koidu", "Makeni", "Waterloo", "Njala", "Lunsar", "Port Loko", "Kabala", "Segbwema", "Bumpe", "Mile 91", "Magburaka", "Kailahun"],
  SN: ["Dakar", "Touba", "Pikine", "Guédiawaye", "Thiès", "Kaolack", "Rufisque", "Mbour", "Saint-Louis", "Thiès Nones", "Ziguinchor", "Diourbel", "Tambacounda", "Louga", "Kolda"],
  SO: ["Mogadishu", "Borama", "Hargeysa", "Berbera", "Kismayo", "Marka", "Ruqi", "Baidoa", "Cabudwaaq", "Burao", "Kaambooni", "Gebiley", "Bosaso", "Beled Hawo", "Balanbale"],
  SS: ["Juba", "Winejok", "Yei", "Malakal", "Wau", "Kuacjok", "Pajok", "Gogrial", "Yambio", "Aweil", "Rumbek", "Bor", "Torit", "Leer", "Tonj"],
  ST: ["São Tomé", "Neves", "Água Izé", "Folha Fede", "Almas", "Pantufo", "Rosema", "Piedade", "Changra", "Santo António", "Lemos", "Santo Amaro", "Cova Barro", "Micondo", "Agostinho Neto"],
  SZ: ["Manzini", "Mbabane", "Malkerns", "Nhlangano", "Mhlume", "Hluti", "Siteki", "Piggs Peak", "Lobamba", "Vuvulane", "Kwaluseni", "Bhunya", "Mhlambanyatsi", "Hlathikhulu", "Bulembu"],
  TD: ["N'Djamena", "Moundou", "Abéché", "Sarh", "Kelo", "Am Timan", "Doba", "Pala", "Bongor", "Goz Beida", "Koumra", "Mongo", "Bol", "Mao", "Iriba"],
  TG: ["Lomé", "Sokodé", "Kara", "Atakpamé", "Kpalimé", "Bassar", "Dapaong", "Tsévié", "Aného", "Mango", "Anié", "Notsé", "Sinkassé", "Tchamba", "Sotouboua"],
  TN: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Sukrah", "Aryanah", "Gabès", "Sejoumi", "El Mourouj", "Hammamet", "Gafsa", "La Gazelle", "Monastir", "La Marsa"],
  TZ: ["Dar es Salaam", "Mwanza", "Dodoma", "Zanzibar", "Arusha", "Mbeya", "Morogoro", "Kahama", "Tanga", "Geita", "Tabora", "Sumbawanga", "Songea", "Kibaha", "Bariadi"],
  UG: ["Kampala", "Nansana", "Kira", "Bunamwaya", "Kyengera", "Mbarara", "Kasangati", "Mukono", "Njeru", "Gulu", "Katabi", "Kajansi", "Lugazi", "Hoima", "Mubende"],
  ZA: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Soweto", "Port Elizabeth", "Soshanguve", "Pietermaritzburg", "Evaton", "Benoni", "Bloemfontein", "Thembisa", "East London", "Vereeniging", "Boksburg"],
  ZM: ["Lusaka", "Kitwe", "Ndola", "Chipata", "Solwezi", "Kabwe", "Chingola", "Luanshya", "Kasama", "Livingstone", "Mansa", "Mufulira", "Chunga", "Chililabombwe", "Mongu"],
  ZW: ["Harare", "Bulawayo", "Chitungwiza", "Mutare", "Gweru", "Kwekwe", "Kadoma", "Ruwa", "Chinhoyi", "Masvingo", "Norton", "Marondera", "Chegutu", "Zvishavane", "Beitbridge"],
};

/** Suggestions pour un pays donné, désigné par son nom. Vide si le pays est inconnu. */
export function suggestionsVilles(nomPays: string): string[] {
  const pays = paysParNom(nomPays);
  return pays ? (VILLES_PAR_PAYS[pays.code] ?? []) : [];
}
