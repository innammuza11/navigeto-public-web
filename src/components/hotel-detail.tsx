"use client";

import Link from "next/link";
import { hotelParty } from "@/lib/hotel-checkout";
import { useEffect, useState } from "react";
import { Money } from "@/components/money";
import {
  HotelRate,
  liveApi,
  PublicHotel,
  PublicHotelRoom,
  saveSelection,
} from "@/lib/live-api";

const normalize = (value?: string | null) =>
  String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

const roomRate = (room: PublicHotelRoom, rates: HotelRate[]) => {
  const roomKey = normalize(room.room_name);
  return rates
    .filter((rate) => {
      const rateKey = normalize(rate.room_type);
      return rateKey === roomKey || rateKey.includes(roomKey) || roomKey.includes(rateKey);
    })
    .sort((a, b) => a.total_amount - b.total_amount)[0] || null;
};

const roomFacts = (room: PublicHotelRoom) => [
  room.bed_configuration,
  room.max_occupancy != null ? `Up to ${room.max_occupancy} guests` : null,
  room.room_size_sqm != null ? `${room.room_size_sqm} m²` : null,
  room.view_type,
].filter(Boolean).join(" · ");

const phoneHref = (value: string) => `tel:${value.replace(/[^\d+]/g, "")}`;

export function HotelDetail({ slug }: { slug: string }) {
  const [hotel, setHotel] = useState<PublicHotel | null>(null);
  const [rates, setRates] = useState<HotelRate[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState({
    checkin: "2026-08-15",
    checkout: "2026-08-19",
    rooms: 1,
    adults: 2,
    children: 0,
    occupancy: "double",
  });

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const nextQuery = {
      checkin: params.get("checkin") || "2026-08-15",
      checkout: params.get("checkout") || "2026-08-19",
      ...hotelParty(params),
    };
    liveApi.hotel(slug).then(async ({ result }) => {
      if (!active) return;
      setQuery(nextQuery);
      setHotel(result);
      if (!result) return;
      const response = await liveApi.hotels({
        q: result.hotel_name,
        checkin: nextQuery.checkin,
        checkout: nextQuery.checkout,
        rooms: nextQuery.rooms,
        adults: nextQuery.adults,
        children: nextQuery.children,
        occupancy: nextQuery.occupancy,
        meal_plan: params.get("meal_plan") === "any" ? undefined : params.get("meal_plan") || undefined,
        market: params.get("market") || "All Markets",
        max_results: 100,
      }).catch(() => ({ results: [] as HotelRate[], meta: {} }));
      if (!active) return;
      const hotelKey = normalize(result.hotel_name);
      setRates(response.results.filter((rate) => normalize(rate.hotel_name) === hotelKey));
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : "This hotel page could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return <section className="shell results-section"><div className="notice">Loading the published Hotel Master profile and official photos…</div></section>;
  }

  if (error || !hotel) {
    return <section className="shell results-section"><div className="empty-state"><h1>Hotel page not found.</h1><p>{error || "This profile is not published yet."}</p><Link className="button button-primary" href="/hotels/search">Search published hotels</Link></div></section>;
  }

  const gallery = hotel.gallery.length
    ? hotel.gallery.slice(0, 3)
    : hotel.cover_image_url
      ? [{ url: hotel.cover_image_url, alt_text: hotel.hotel_name, is_cover: true }]
      : [];
  const galleryClass = gallery.length === 1
    ? "gallery hotel-gallery hotel-gallery-single"
    : gallery.length === 2
      ? "gallery hotel-gallery hotel-gallery-two"
      : "gallery hotel-gallery";
  const selectedRoom = hotel.rooms[selected] || hotel.rooms[0] || null;
  const selectedRate = selectedRoom ? roomRate(selectedRoom, rates) : rates[0] || null;
  const lowestRate = [...rates].sort((a, b) => a.total_amount - b.total_amount)[0] || null;
  const searchHref = `/hotels/search?q=${encodeURIComponent(hotel.hotel_name)}&checkin=${query.checkin}&checkout=${query.checkout}&rooms=${query.rooms}&adults=${query.adults}&children=${query.children}&occupancy=${encodeURIComponent(query.occupancy)}`;
  const location = [hotel.address, hotel.city, hotel.destination, hotel.country].filter(Boolean).join(", ");

  const saveRoom = () => {
    if (selectedRate) {
      saveSelection("hotel", {
        ...selectedRate,
        ...query,
      });
    }
  };

  return <>
    <section className="detail-top shell hotel-detail-top">
      <p className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/hotels">Hotels</Link> / {hotel.destination}</p>
      <div className="detail-title">
        <div>
          <p className="eyebrow">{hotel.star_category || "Published Hotel Master profile"} · {hotel.destination}</p>
          <h1>{hotel.hotel_name}</h1>
          <p className="rating">Official property media · {hotel.rooms.length} published room categor{hotel.rooms.length === 1 ? "y" : "ies"}</p>
          {hotel.short_description && <p className="hotel-public-summary">{hotel.short_description}</p>}
        </div>
        <Link className="button button-soft" href={searchHref}>Change dates</Link>
      </div>
      {gallery.length > 0 && <div className={galleryClass}>
        {gallery.map((image, index) => <div key={`${image.url}-${index}`} role="img" aria-label={image.alt_text || image.caption || `${hotel.hotel_name} property photo ${index + 1}`} style={{ backgroundImage: `url("${image.url}")` }}/>) }
        <span className="gallery-badge">{gallery.length} approved property photo{gallery.length === 1 ? "" : "s"}</span>
      </div>}
    </section>

    <nav className="anchor-nav"><div className="shell"><a href="#overview">Overview</a><a href="#rooms">Rooms</a>{hotel.facilities.length > 0 && <a href="#facilities">Facilities</a>}<a href="#policies">Policies</a><a href="#location">Location</a></div></nav>

    <section className="shell detail-layout" id="overview">
      <div>
        <p className="eyebrow">About the property</p>
        <h2>{hotel.hotel_name}</h2>
        <p className="body-copy">{hotel.full_description || hotel.short_description}</p>
        {location && <p className="hotel-public-location">📍 {location}</p>}
        {hotel.facilities.length > 0 && <div className="amenity-grid" id="facilities">{hotel.facilities.map((facility) => <div key={facility}>✓ <b>{facility}</b></div>)}</div>}
      </div>
      <aside className="sticky-summary">
        <p>{query.checkin} → {query.checkout}</p>
        {lowestRate ? <Money value={lowestRate.total_amount} currency={lowestRate.currency}/> : <b>Rates on request</b>}
        <small>{query.rooms} room · {query.adults} adults · live availability rechecked before confirmation</small>
        <a className="button button-gold" href="#rooms">View room categories</a>
        <span>✓ Approved Hotel Master profile</span>
      </aside>
    </section>

    <section className="pale section" id="rooms"><div className="shell">
      <div className="section-title"><p className="eyebrow">Published room categories</p><h2>Choose the room that fits.</h2></div>
      <div className="room-list">{hotel.rooms.map((room, index) => {
        const matchingRate = roomRate(room, rates);
        const facts = roomFacts(room);
        return <article className={selected === index ? "room selected" : "room"} key={room.id}>
          <div className="room-media-block">
            <div className="room-image" role="img" aria-label={`${room.room_name} official room photo`} style={room.cover_image_url ? { backgroundImage: `url("${room.cover_image_url}")` } : undefined}/>
            {room.gallery.length > 1 && <div className="room-photo-strip">{room.gallery.slice(1, 4).map((image, imageIndex) => <div key={`${image.url}-${imageIndex}`} role="img" aria-label={image.alt_text || image.caption || `${room.room_name} photo ${imageIndex + 2}`} style={{ backgroundImage: `url("${image.url}")` }}/>)}</div>}
          </div>
          <div>
            <h3>{room.room_name}</h3>
            {room.description && <p>{room.description}</p>}
            {facts && <b>✓ {facts}</b>}
            {room.amenities.length > 0 && <small>✓ {room.amenities.slice(0, 6).join(" · ")}</small>}
            {matchingRate && <small>✓ {matchingRate.meal_plan || "Room basis confirmed before booking"}</small>}
          </div>
          <div>
            {matchingRate ? <Money value={matchingRate.total_amount} currency={matchingRate.currency}/> : <b>Check live rates</b>}
            <small>{matchingRate ? `${matchingRate.nights} nights · ${matchingRate.rooms} room` : "Availability confirmed on request"}</small>
            <button onClick={() => setSelected(index)}>{selected === index ? "Selected ✓" : "Select room"}</button>
          </div>
        </article>;
      })}</div>
      {selectedRoom && <div className="selection-bar"><div><span>{selectedRoom.room_name}</span>{selectedRate ? <Money value={selectedRate.total_amount} currency={selectedRate.currency}/> : <b>Request current rates</b>}</div><Link href={selectedRate ? "/hotels/booking" : searchHref} className="button button-gold" onClick={saveRoom}>{selectedRate ? "Continue to booking →" : "Check live rates →"}</Link></div>}
    </div></section>

    <section className="section shell" id="policies"><div className="split">
      <div><p className="eyebrow">Good to know</p><h2>Everything important, clear before you commit.</h2><p className="body-copy">Availability, room basis and supplier conditions are rechecked before your booking is confirmed.</p>{hotel.nearby_attractions.length > 0 && <div className="amenity-grid">{hotel.nearby_attractions.map((place) => <div key={place}>📍 <b>{place}</b></div>)}</div>}</div>
      <div className="policy-card">
        {(hotel.email || hotel.reservations_phone || hotel.front_desk_phone || hotel.whatsapp_number) && <>
          <h3>Contact the property</h3>
          {hotel.email && <p><a href={`mailto:${hotel.email}`}>{hotel.email}</a></p>}
          {hotel.reservations_phone && <p>Reservations: <a href={phoneHref(hotel.reservations_phone)}>{hotel.reservations_phone}</a></p>}
          {hotel.front_desk_phone && <p>Front desk: <a href={phoneHref(hotel.front_desk_phone)}>{hotel.front_desk_phone}</a></p>}
          {hotel.whatsapp_number && <p>WhatsApp: <a href={`https://wa.me/${hotel.whatsapp_number.replace(/\D/g, "")}`}>{hotel.whatsapp_number}</a></p>}
        </>}
        <h3>Stay details</h3>
        <p>{hotel.check_in_time ? `Check-in: ${hotel.check_in_time}. ` : ""}{hotel.check_out_time ? `Check-out: ${hotel.check_out_time}.` : "Times are confirmed before arrival."}</p>
        {hotel.child_policy && <><h3>Child policy</h3><p>{hotel.child_policy}</p></>}
        {hotel.cancellation_policy && <><h3>Cancellation</h3><p>{hotel.cancellation_policy}</p></>}
        <h3 id="location">Location</h3><p>{location || hotel.destination}</p>
      </div>
    </div></section>
  </>;
}
