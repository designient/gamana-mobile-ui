import type { Experience } from '../types/experience';

export function parseKnowBeforeYouGo(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/[;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getCulturalEtiquetteNotes(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('heritage') || c.includes('spiritual')) {
    return 'Remove shoes at temple entrances. Dress modestly — shoulders and knees covered. Photography rules vary by site — ask your guide.';
  }
  if (c.includes('food') || c.includes('drink')) {
    return "Wash hands before first tasting. Accept food with right hand. It's polite to try everything offered.";
  }
  if (c.includes('nature') || c.includes('wildlife')) {
    return "Stay on marked paths. Don't feed wildlife. Carry your waste out.";
  }
  return 'Respect local customs. Ask before photographing people.';
}

export function getSafetyFallback(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('food')) {
    return 'Notify your guide of allergies. Stay hydrated in warm weather.';
  }
  if (c.includes('heritage') || c.includes('spiritual')) {
    return 'Watch your step on uneven lanes. Keep valuables secure in crowded areas.';
  }
  if (c.includes('nature')) {
    return 'Apply sunscreen. Carry insect repellent if walking at dawn or dusk.';
  }
  return "Follow your guide's instructions. Keep emergency contacts handy.";
}

export function getDefaultWhatToWear(category: string): string[] {
  const c = category.toLowerCase();
  if (c.includes('heritage') || c.includes('spiritual')) {
    return ['Modest clothing covering shoulders and knees', 'Comfortable walking shoes'];
  }
  if (c.includes('food')) {
    return ['Comfortable clothes', 'Light layers for evening walks'];
  }
  if (c.includes('nature')) {
    return ['Breathable outdoor clothing', 'Sturdy walking shoes', 'Sun hat'];
  }
  return ['Comfortable walking shoes', 'Weather-appropriate layers'];
}

export function getDefaultWhatToCarry(category: string): string[] {
  const c = category.toLowerCase();
  if (c.includes('food')) {
    return ['Hand sanitiser', 'Reusable water bottle', 'Small cash for extras'];
  }
  if (c.includes('heritage') || c.includes('spiritual')) {
    return ['Water bottle', 'Sun protection', 'Small bag for shoes at temple stops'];
  }
  return ['Water bottle', 'Phone with offline maps', 'Photo ID'];
}

export function shouldShowDietaryNotes(experience: Experience): boolean {
  const c = experience.category.toLowerCase();
  if (c.includes('food') || c.includes('drink')) return true;
  const inclusions = [...experience.inclusions, ...(experience.exclusions ?? [])].join(' ').toLowerCase();
  return inclusions.includes('tasting') || inclusions.includes('food');
}

export function getDietaryNotes(experience: Experience): string[] {
  const items: string[] = [];
  if (experience.knowBeforeYouGo?.toLowerCase().includes('dietary')) {
    items.push('Share dietary restrictions with your guide when you meet.');
  }
  items.push('Vegetarian options are usually available — mention preferences in advance.');
  if (experience.category.toLowerCase().includes('food')) {
    items.push('Tastings are hygiene-conscious; still carry any required medication.');
  }
  return items;
}
