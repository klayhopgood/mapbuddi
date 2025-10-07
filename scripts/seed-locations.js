// Populate location data from GeoNames
// This script seeds the countries, states, and cities tables

import { db } from "../db/db.js";
import { countries, states, cities } from "../db/schema.js";

// Sample data structure - in production, this would come from GeoNames API or CSV files
const SAMPLE_COUNTRIES = [
  { name: "United States", code: "US", region: "North America" },
  { name: "Canada", code: "CA", region: "North America" },
  { name: "United Kingdom", code: "GB", region: "Europe" },
  { name: "Australia", code: "AU", region: "Oceania" },
  { name: "Germany", code: "DE", region: "Europe" },
  { name: "France", code: "FR", region: "Europe" },
  { name: "Japan", code: "JP", region: "Asia" },
  { name: "Brazil", code: "BR", region: "South America" },
  { name: "India", code: "IN", region: "Asia" },
  { name: "China", code: "CN", region: "Asia" },
];

const SAMPLE_STATES = [
  // United States
  { name: "California", code: "CA", countryCode: "US", countryName: "United States" },
  { name: "New York", code: "NY", countryCode: "US", countryName: "United States" },
  { name: "Texas", code: "TX", countryCode: "US", countryName: "United States" },
  { name: "Florida", code: "FL", countryCode: "US", countryName: "United States" },
  
  // Canada
  { name: "Ontario", code: "ON", countryCode: "CA", countryName: "Canada" },
  { name: "Quebec", code: "QC", countryCode: "CA", countryName: "Canada" },
  { name: "British Columbia", code: "BC", countryCode: "CA", countryName: "Canada" },
  
  // United Kingdom
  { name: "England", code: "ENG", countryCode: "GB", countryName: "United Kingdom" },
  { name: "Scotland", code: "SCT", countryCode: "GB", countryName: "United Kingdom" },
  { name: "Wales", code: "WLS", countryCode: "GB", countryName: "United Kingdom" },
  
  // Australia
  { name: "New South Wales", code: "NSW", countryCode: "AU", countryName: "Australia" },
  { name: "Victoria", code: "VIC", countryCode: "AU", countryName: "Australia" },
  { name: "Queensland", code: "QLD", countryCode: "AU", countryName: "Australia" },
];

const SAMPLE_CITIES = [
  // United States - California
  { name: "Los Angeles", countryCode: "US", countryName: "United States", stateCode: "CA", stateName: "California", population: 3971883, latitude: "34.0522", longitude: "-118.2437" },
  { name: "San Francisco", countryCode: "US", countryName: "United States", stateCode: "CA", stateName: "California", population: 873965, latitude: "37.7749", longitude: "-122.4194" },
  { name: "San Diego", countryCode: "US", countryName: "United States", stateCode: "CA", stateName: "California", population: 1423851, latitude: "32.7157", longitude: "-117.1611" },
  
  // United States - New York
  { name: "New York City", countryCode: "US", countryName: "United States", stateCode: "NY", stateName: "New York", population: 8336817, latitude: "40.7128", longitude: "-74.0060" },
  { name: "Buffalo", countryCode: "US", countryName: "United States", stateCode: "NY", stateName: "New York", population: 255284, latitude: "42.8864", longitude: "-78.8784" },
  
  // Canada - Ontario
  { name: "Toronto", countryCode: "CA", countryName: "Canada", stateCode: "ON", stateName: "Ontario", population: 2731571, latitude: "43.6532", longitude: "-79.3832" },
  { name: "Ottawa", countryCode: "CA", countryName: "Canada", stateCode: "ON", stateName: "Ontario", population: 994837, latitude: "45.4215", longitude: "-75.6972" },
  
  // United Kingdom - England
  { name: "London", countryCode: "GB", countryName: "United Kingdom", stateCode: "ENG", stateName: "England", population: 8982000, latitude: "51.5074", longitude: "-0.1278" },
  { name: "Manchester", countryCode: "GB", countryName: "United Kingdom", stateCode: "ENG", stateName: "England", population: 547000, latitude: "53.4808", longitude: "-2.2426" },
  
  // Australia - New South Wales
  { name: "Sydney", countryCode: "AU", countryName: "Australia", stateCode: "NSW", stateName: "New South Wales", population: 5312163, latitude: "-33.8688", longitude: "151.2093" },
  { name: "Newcastle", countryCode: "AU", countryName: "Australia", stateCode: "NSW", stateName: "New South Wales", population: 322278, latitude: "-32.9283", longitude: "151.7817" },
];

async function seedLocationData() {
  try {
    console.log("🌍 Starting location data seeding...");
    
    // Clear existing data
    await db.delete(cities);
    await db.delete(states);
    await db.delete(countries);
    
    // Seed countries
    console.log("📍 Seeding countries...");
    await db.insert(countries).values(SAMPLE_COUNTRIES);
    
    // Seed states
    console.log("🏛️ Seeding states/provinces...");
    await db.insert(states).values(SAMPLE_STATES);
    
    // Seed cities
    console.log("🏙️ Seeding cities...");
    await db.insert(cities).values(SAMPLE_CITIES);
    
    console.log("✅ Location data seeding completed!");
    console.log(`   • ${SAMPLE_COUNTRIES.length} countries`);
    console.log(`   • ${SAMPLE_STATES.length} states/provinces`);
    console.log(`   • ${SAMPLE_CITIES.length} cities`);
    
  } catch (error) {
    console.error("❌ Error seeding location data:", error);
  }
}

// Run the seeding function
seedLocationData();
