import Image from 'next/image';
import { destinationArtPlan, destinationArtwork, type CoverInput } from '@/lib/destination-art';

/** Decorative destination illustration. Actual hotels and vehicles retain their photographs. */
export function DestinationCover(input: CoverInput & {className?: string}) {
  const plan = destinationArtPlan(input);
  const artwork = destinationArtwork(input);
  return <figure className={`destination-cover watercolour-cover ${input.className || ''}`} data-art-id={input.identity} data-art-edition={plan.edition}>
    <Image src={`/art/watercolour/${artwork}.webp`} alt={`${input.title || input.country}: illustrated ${input.country} journey`} fill sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 40vw"/>
  </figure>;
}
