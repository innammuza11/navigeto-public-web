"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSite } from "@/components/SiteProvider";
import { whatsappUrl } from "@/lib/format";
import type { PublicHotel, PublicMedia } from "@/lib/types";

export default function HotelDetailClient({ hotel }: { hotel: PublicHotel }) {
  const { config } = useSite();

  const message = `Hi Navigeto, I'm interested in ${hotel.hotel_name} in ${hotel.destination}. Please send me availability and rates.`;
  const location = [hotel.address, hotel.city, hotel.destination, hotel.country].filter(Boolean).join(", ");

  return <>
    <section className="hotel-detail-hero">
      {hotel.cover_image_url ? <><Image className="seo-hero-image" src={hotel.cover_image_url} alt="" fill priority sizes="100vw" /><div className="seo-hero-overlay" /></> : null}
      <div className="shell hotel-detail-hero-content seo-hero-content">
        <div className="eyebrow light">{hotel.star_category || "Sri Lanka Hotel"}</div>
        <h1>{hotel.hotel_name}</h1>
        <p>📍 {hotel.destination}{hotel.city && hotel.city !== hotel.destination ? ` · ${hotel.city}` : ""}</p>
        {hotel.short_description ? <div className="hotel-hero-summary">{hotel.short_description}</div> : null}
        <div className="hotel-hero-actions">
          <Link className="button button-primary" href={`/hotels?q=${encodeURIComponent(hotel.hotel_name)}`}>Check live rates</Link>
          <a className="button button-ghost hotel-hero-secondary" href={whatsappUrl(config.whatsapp_number, message)} target="_blank" rel="noreferrer">Ask on WhatsApp</a>
        </div>
      </div>
    </section>

    <div className="shell content-wrap hotel-detail-layout">
      <main className="hotel-detail-main">
        {hotel.gallery.length ? <PhotoGallery title="Property Gallery" images={hotel.gallery} /> : null}

        <section className="content-section">
          <div className="eyebrow">About the property</div>
          <h2>{hotel.hotel_name}</h2>
          <p className="hotel-description">{hotel.full_description || hotel.short_description || "Contact Navigeto for the latest property information, availability and room recommendations."}</p>
          {location ? <p className="hotel-address">📍 {location}</p> : null}
        </section>

        {hotel.facilities.length ? <section className="content-section"><div className="eyebrow">Facilities</div><h2>Property amenities</h2><div className="feature-chip-grid">{hotel.facilities.map((facility) => <span className="feature-chip" key={facility}>✓ {facility}</span>)}</div></section> : null}

        <section className="content-section">
          <div className="eyebrow">Rooms</div>
          <h2>Available room categories</h2>
          {hotel.rooms.length ? <div className="public-room-grid">{hotel.rooms.map((room) => <article className="public-room-card" key={room.id}>
            {room.cover_image_url ? <Image className="public-room-cover" src={room.cover_image_url} alt={room.room_name} width={1200} height={800} sizes="(max-width: 1000px) 100vw, 50vw" /> : <div className="public-room-cover public-room-placeholder">Room photo coming soon</div>}
            <div className="public-room-body">
              <div className="public-room-heading"><h3>{room.room_name}</h3>{room.view_type ? <span className="badge">{room.view_type}</span> : null}</div>
              {room.description ? <p>{room.description}</p> : null}
              <div className="room-meta-row">
                {room.max_occupancy != null ? <span>👥 Up to {room.max_occupancy}</span> : null}
                {room.bed_configuration ? <span>🛏 {room.bed_configuration}</span> : null}
                {room.room_size_sqm != null ? <span>↔ {room.room_size_sqm} m²</span> : null}
              </div>
              {room.amenities.length ? <div className="room-amenities">{room.amenities.slice(0, 8).map((amenity) => <span key={amenity}>{amenity}</span>)}</div> : null}
              {room.gallery.length > 1 ? <PhotoGallery title={`${room.room_name} Photos`} images={room.gallery} compact /> : null}
              <Link className="button button-primary button-block" href={`/hotels?q=${encodeURIComponent(hotel.hotel_name)}`}>Check this room</Link>
            </div>
          </article>)}</div> : <div className="empty-state"><b>Room details are being updated.</b>Search live rates or contact the Navigeto team for available categories.</div>}
        </section>

        {hotel.nearby_attractions.length ? <section className="content-section"><div className="eyebrow">Nearby</div><h2>Places around the hotel</h2><div className="feature-chip-grid">{hotel.nearby_attractions.map((item) => <span className="feature-chip" key={item}>📍 {item}</span>)}</div></section> : null}
      </main>

      <aside className="detail-side hotel-sticky-card">
        <div className="eyebrow">Plan your stay</div>
        <h2 className="detail-title">Live availability</h2>
        <p>Choose your dates to view approved customer selling rates from Navigeto TravelOS.</p>
        <div className="meta-grid">
          <div className="meta-item"><small>Check-in</small><b>{hotel.check_in_time || "Ask hotel"}</b></div>
          <div className="meta-item"><small>Check-out</small><b>{hotel.check_out_time || "Ask hotel"}</b></div>
          <div className="meta-item"><small>Rooms</small><b>{hotel.rooms.length || "On request"}</b></div>
          <div className="meta-item"><small>Location</small><b>{hotel.destination}</b></div>
        </div>
        <Link className="button button-primary button-block" href={`/hotels?q=${encodeURIComponent(hotel.hotel_name)}`}>Search rates</Link>
        <a className="button button-ghost button-block" style={{ marginTop: 10 }} href={whatsappUrl(config.whatsapp_number, message)} target="_blank" rel="noreferrer">WhatsApp Navigeto</a>
        {hotel.child_policy ? <div className="policy-note" style={{ marginTop: 16 }}><b>Child policy</b><div>{hotel.child_policy}</div></div> : null}
        {hotel.cancellation_policy ? <div className="policy-note" style={{ marginTop: 10 }}><b>Cancellation</b><div>{hotel.cancellation_policy}</div></div> : null}
      </aside>
    </div>
  </>;
}

function PhotoGallery({ title, images, compact = false }: { title: string; images: PublicMedia[]; compact?: boolean }) {
  const [selected, setSelected] = useState<PublicMedia | null>(null);
  const visible = compact ? images.slice(0, 4) : images.slice(0, 8);
  return <section className={compact ? "room-photo-section" : "content-section hotel-gallery-section"}>
    <div className="gallery-heading"><h3>{title}</h3><span>{images.length} photo{images.length === 1 ? "" : "s"}</span></div>
    <div className={compact ? "photo-grid photo-grid-compact" : "photo-grid"}>{visible.map((image, index) => <button type="button" className="photo-tile" key={`${image.url}-${index}`} onClick={() => setSelected(image)}><Image src={image.url} alt={image.alt_text || image.caption || title} fill sizes={compact ? "(max-width: 640px) 50vw, 20vw" : "(max-width: 640px) 100vw, 25vw"} />{image.caption ? <span>{image.caption}</span> : null}</button>)}</div>
    {selected ? <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setSelected(null)}><button type="button" className="lightbox-close" onClick={() => setSelected(null)}>×</button><Image src={selected.url} alt={selected.alt_text || selected.caption || title} width={1600} height={1000} sizes="92vw" />{selected.caption ? <p>{selected.caption}</p> : null}</div> : null}
  </section>;
}
