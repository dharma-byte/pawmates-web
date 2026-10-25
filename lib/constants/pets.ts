import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];

export type Option<T extends string> = { value: T; label: string; hint?: string };

export const SPECIES: Option<Enums["pet_species"]>[] = [
  { value: "dog", label: "🐶 Dog" },
  { value: "cat", label: "🐱 Cat" },
  { value: "bird", label: "🐦 Bird" },
  { value: "rabbit", label: "🐰 Rabbit" },
  { value: "other", label: "🐾 Other" },
];

export const GENDERS: Option<Enums["pet_gender"]>[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unknown", label: "Not sure" },
];

export const SIZES: Option<Enums["pet_size"]>[] = [
  { value: "small", label: "Small", hint: "under 10 kg" },
  { value: "medium", label: "Medium", hint: "10 to 25 kg" },
  { value: "large", label: "Large", hint: "25 to 45 kg" },
  { value: "giant", label: "Giant", hint: "over 45 kg" },
];

export const ENERGY_LEVELS: Option<Enums["energy_level"]>[] = [
  { value: "low", label: "Couch potato" },
  { value: "medium", label: "Balanced" },
  { value: "high", label: "Zoomies all day" },
];

export const TEMPERAMENTS: Option<Enums["pet_temperament"]>[] = [
  { value: "friendly", label: "Friendly" },
  { value: "shy", label: "Shy" },
  { value: "reactive", label: "Reactive with other pets" },
];

export const PLAY_STYLES: Option<Enums["play_style"]>[] = [
  { value: "chaser", label: "Chaser" },
  { value: "wrestler", label: "Wrestler" },
  { value: "gentle", label: "Gentle" },
];

export const valuesOf = <T extends string>(options: Option<T>[]) =>
  options.map((option) => option.value) as [T, ...T[]];
