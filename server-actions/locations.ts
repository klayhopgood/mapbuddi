"use server";

import { db } from "@/db/db";
import { countries, states, cities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCountries() {
  try {
    const allCountries = await db
      .select()
      .from(countries)
      .orderBy(countries.name);
    
    return allCountries;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
}

export async function getStatesByCountry(countryCode: string) {
  try {
    const statesList = await db
      .select()
      .from(states)
      .where(eq(states.countryCode, countryCode))
      .orderBy(states.name);
    
    return statesList;
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
}

export async function getCitiesByState(countryCode: string, stateCode?: string) {
  try {
    let query = db
      .select()
      .from(cities)
      .where(eq(cities.countryCode, countryCode));
    
    if (stateCode) {
      query = query.where(eq(cities.stateCode, stateCode));
    }
    
    const citiesList = await query.orderBy(cities.name);
    
    return citiesList;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

export async function getCitiesByCountry(countryCode: string) {
  try {
    const citiesList = await db
      .select()
      .from(cities)
      .where(eq(cities.countryCode, countryCode))
      .orderBy(cities.name);
    
    return citiesList;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}
