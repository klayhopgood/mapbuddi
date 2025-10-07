"use server";

import { db } from "@/db/db";
import { countries, states, cities } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
    const conditions = [eq(cities.countryCode, countryCode)];
    
    if (stateCode) {
      conditions.push(eq(cities.stateCode, stateCode));
    }
    
    const citiesList = await db
      .select()
      .from(cities)
      .where(and(...conditions))
      .orderBy(cities.name);
    
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
