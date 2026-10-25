import { z } from "zod";
import {
  ENERGY_LEVELS,
  GENDERS,
  PLAY_STYLES,
  SIZES,
  SPECIES,
  TEMPERAMENTS,
  valuesOf,
} from "@/lib/constants/pets";

// Limits mirror the CHECK constraints in the backend migrations.

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name").max(80, "Use at most 80 characters"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/, "3 to 30 characters: letters, numbers and underscores"),
  bio: z.string().trim().max(500, "Use at most 500 characters"),
});

const today = () => new Date().toISOString().slice(0, 10);

export const petSchema = z.object({
  name: z.string().trim().min(1, "Enter your pet's name").max(40, "Use at most 40 characters"),
  species: z.enum(valuesOf(SPECIES), { error: "Choose a species" }),
  breed: z.string().trim().max(60, "Use at most 60 characters"),
  birthDate: z
    .string()
    .refine((value) => !value || value <= today(), "Birthday can't be in the future"),
  gender: z.enum(valuesOf(GENDERS)),
  size: z.enum(valuesOf(SIZES), { error: "Choose a size" }),
  energy: z.enum(valuesOf(ENERGY_LEVELS), { error: "Choose an energy level" }),
  temperament: z.enum(valuesOf(TEMPERAMENTS), { error: "Choose a temperament" }),
  playStyle: z.enum(valuesOf(PLAY_STYLES), { error: "Choose a play style" }),
  vaccinated: z.boolean(),
  vaccinatedOn: z
    .string()
    .refine((value) => !value || value <= today(), "Date can't be in the future"),
  // null = not sure. good_with_cats and good_with_small_dogs feed the match score.
  goodWithKids: z.boolean().nullable(),
  goodWithCats: z.boolean().nullable(),
  goodWithSmallDogs: z.boolean().nullable(),
  neutered: z.boolean().nullable(),
  allergies: z.string().trim().max(300, "Use at most 300 characters"),
  specialNeeds: z.string().trim().max(300, "Use at most 300 characters"),
  likes: z.array(z.string()).max(15),
  dislikes: z.array(z.string()).max(15),
});

export type ProfileValues = z.infer<typeof profileSchema>;
export type PetValues = z.infer<typeof petSchema>;
