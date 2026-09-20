// States/UTs -> the cities a learner is most likely to live in. Not exhaustive by design: every
// list is closed with an "Other city" escape hatch in the form (see OTHER_CITY), so a missing town
// never blocks anyone from submitting.
export const INDIA_LOCATIONS: Record<string, string[]> = {
    "Andaman and Nicobar Islands": ["Port Blair"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Amaravati", "Nellore", "Kurnool"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun"],
    Assam: ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
    Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
    Chandigarh: ["Chandigarh"],
    Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa", "Daman", "Diu"],
    Delhi: ["New Delhi", "Delhi"],
    Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
    Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Manali"],
    "Jammu and Kashmir": ["Srinagar", "Jammu"],
    Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
    Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
    Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam"],
    Ladakh: ["Leh"],
    Lakshadweep: ["Kavaratti"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain"],
    Maharashtra: ["Mumbai", "Navi Mumbai", "Thane", "Pune", "Nagpur", "Nashik", "Chhatrapati Sambhajinagar", "Kolhapur"],
    Manipur: ["Imphal"],
    Meghalaya: ["Shillong"],
    Mizoram: ["Aizawl"],
    Nagaland: ["Kohima", "Dimapur"],
    Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
    Puducherry: ["Puducherry"],
    Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Mohali", "Patiala"],
    Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
    Sikkim: ["Gangtok"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Hosur"],
    Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
    Tripura: ["Agartala"],
    "Uttar Pradesh": ["Noida", "Greater Noida", "Lucknow", "Ghaziabad", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
    Uttarakhand: ["Dehradun", "Haridwar", "Haldwani"],
    "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur"],
};

export const INDIA_STATES = Object.keys(INDIA_LOCATIONS);

/** Sentinel option appended to every city list — reveals a free-text field. */
export const OTHER_CITY = "Other city";

/** Cities a learner might want to work in — a mix of Indian metros and the overseas hubs BIM/AEC
 *  hiring actually concentrates in. Anything else can be typed in and added as a custom entry. */
export const PREFERRED_LOCATION_OPTIONS = [
    "Mumbai",
    "Navi Mumbai",
    "Pune",
    "New Delhi",
    "Gurugram",
    "Noida",
    "Bengaluru",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
    "Jaipur",
    "Kochi",
    "Chandigarh",
    "Indore",
    "Nagpur",
    "Lucknow",
    "Coimbatore",
    "Bhubaneswar",
    "Goa",
    "Dubai",
    "Abu Dhabi",
    "Riyadh",
    "Doha",
    "Singapore",
    "London",
];
