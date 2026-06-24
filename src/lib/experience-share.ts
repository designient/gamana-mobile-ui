import type { Experience } from '../types/experience';
import { formatPriceLabel } from './experience-mappers';

export async function shareExperience(
  experience: Pick<Experience, 'title' | 'slug' | 'priceFrom' | 'priceCurrency'>,
  onCopied?: () => void,
): Promise<void> {
  const shareData = {
    title: experience.title,
    text: `Check out ${experience.title} on Gamana — ${formatPriceLabel(experience.priceFrom, experience.priceCurrency)}`,
    url: `https://gamana.app/experience/${experience.slug}`,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch {
      /* user cancelled */
    }
    return;
  }

  await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
  onCopied?.();
}
