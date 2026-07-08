type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

export function PlaneIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><path d="M10.5 3.5 4 10l-2.5-.5 1-1.2L4.5 8l-1-2.3L4.7 5l1.8 2 4-3.5Z" /><path d="M13.5 6.5 21 3l-.6 3.6-6 2.2-1 5.4-2-.7-.3-4.4-4.3-1.6-.7-2 5-1Z" /><path d="M8 16.5 15.5 21l-2-6-5.5 1.5Z" /></svg>;
}

export function HotelIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><path d="M3 21V6a1 1 0 0 1 1-1h6v16" /><path d="M14 21V10a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v11" /><path d="M6.5 9h1M6.5 12h1M6.5 15h1" /><path d="M17 13h1M17 16h1" /><path d="M3 21h18" /></svg>;
}

export function TourIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m14.5 9.5-1.7 5.2a.6.6 0 0 1-.4.4l-5.2 1.7 1.7-5.2a.6.6 0 0 1 .4-.4Z" /></svg>;
}

export function HolidayIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><path d="M12 3v3M4.2 6.2l2.1 2.1M2 13h3M19 13h3M17.7 8.3l2.1-2.1" /><path d="M6 20a6 6 0 0 1 12 0" /><path d="M12 8a5 5 0 0 0-5 5" /></svg>;
}

export function VisaIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10.5" r="1.5" /><path d="M6 15.5c.5-1.5 1.8-2.3 2.5-2.3s2 .8 2.5 2.3" /><path d="M14 9h4M14 12h4M14 15h2" /></svg>;
}

export function TransferIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><path d="M4 16V9.5a1 1 0 0 1 .8-1L7 8l1.5-3h7L17 8l2.2.5a1 1 0 0 1 .8 1V16" /><rect x="3" y="16" width="18" height="3" rx="1" /><circle cx="7.5" cy="19.5" r="1.3" /><circle cx="16.5" cy="19.5" r="1.3" /></svg>;
}

export function CorporateIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><rect x="4" y="10" width="7" height="11" /><rect x="13" y="4" width="7" height="17" /><path d="M6.5 13h2M6.5 16h2M15.5 7h2M15.5 10h2M15.5 13h2M15.5 16h2" /></svg>;
}

export function CustomTripIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><path d="M3 12c4-6 14-6 18 0-4 6-14 6-18 0Z" /><circle cx="12" cy="12" r="2.3" /></svg>;
}

export function SearchIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>;
}

export function WhatsappIcon({ size = 20, className }: IconProps) {
  return <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4a1.6 1.6 0 0 0 .2-.4.4.4 0 0 0 0-.4c-.1-.1-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.5 11.2 11.2 0 0 0 4.3 3.8c.6.2 1 .4 1.4.5a3.4 3.4 0 0 0 1.5.1 2.5 2.5 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c-.1-.1-.2-.2-.4-.3Z" /></svg>;
}

export function AccountIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><circle cx="12" cy="8" r="3.3" /><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" /></svg>;
}

export function ChevronDownIcon({ size = 16, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;
}

export function MenuIcon({ size = 22, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export function CloseIcon({ size = 22, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>;
}

export function ShieldIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><path d="M12 3 4.5 6v6c0 4.5 3 7.7 7.5 9 4.5-1.3 7.5-4.5 7.5-9V6L12 3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

export function BoltIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>;
}

export function MapPinIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size)} className={className} aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.3" /></svg>;
}
