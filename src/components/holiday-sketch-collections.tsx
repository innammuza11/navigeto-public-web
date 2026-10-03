"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {DestinationCover} from './destination-cover';
import {liveApi,type PublicTour} from '@/lib/live-api';
import {tourDisplayName} from '@/lib/tour-presentation';
export function HolidaySketchCollections(){
 const [journeys,setJourneys]=useState<PublicTour[]>([]);
 useEffect(()=>{let active=true;liveApi.tours({}).then(({results})=>{if(active)setJourneys(results.filter(t=>!/^sri\s*lanka$/i.test(t.country||'')).slice(0,9))}).catch(()=>undefined);return()=>{active=false}},[]);
 const ideas=[['Malaysia','Kuala Lumpur & beyond'],['Singapore','City days, island moments'],['Thailand','Temples, tastes & coastlines'],['Vietnam','A slower journey east'],['United Arab Emirates','Desert light & city nights'],['Maldives','A little island time']];
 return <section className="section shell"><div className="section-title"><p className="eyebrow">The world in a sketchbook</p><h2>Somewhere different.<br/><em>Something yours.</em></h2><p>{journeys.length?'Explore individual published holiday packages.':'Destination inspiration for a tailor-made holiday. Our team confirms the itinerary and price.'}</p></div><div className="holiday-sketch-grid">{journeys.length?journeys.map(t=><article className="holiday-sketch-card" key={t.slug}><DestinationCover identity={t.slug} country={t.country||'International'} title={tourDisplayName(t)} places={t.destinations}/><div><p className="eyebrow">{t.country}</p><h3>{tourDisplayName(t)}</h3><p>{t.destinations.join(' · ')}</p><Link href={`/tours/package/${t.slug}`}>Explore this holiday ↗</Link></div></article>):ideas.map(([country,title])=><article className="holiday-sketch-card" key={country}><DestinationCover identity={`holiday-${country}`} country={country} title={title}/><div><p className="eyebrow">{country}</p><h3>{title}</h3><Link href={`/custom-trip?destination=${encodeURIComponent(country)}`}>Plan this holiday ↗</Link></div></article>)}</div></section>
}
