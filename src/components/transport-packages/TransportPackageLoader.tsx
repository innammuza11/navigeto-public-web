'use client';
import { useEffect,useState } from 'react';
import { TransportPackages,type TransportSelection } from './TransportPackages';
import type { TransportCatalog } from './types';
export function TransportPackageLoader({onSelect}:{onSelect:(selection:TransportSelection)=>void}){
 const [catalog,setCatalog]=useState<TransportCatalog|null>(null);const [error,setError]=useState('');const [attempt,setAttempt]=useState(0);
 useEffect(()=>{const abort=new AbortController();const timer=setTimeout(()=>abort.abort(),15000);let active=true;fetch('https://admin.navigeto.com/api/transport-packages',{signal:abort.signal}).then(async response=>{if(!response.ok)throw new Error();const data=await response.json();if(!Array.isArray(data.vehicles)||!data.vehicles.length||data.exchangeRate!==310)throw new Error();if(active)setCatalog(data);}).catch(()=>{if(active)setError('Transport package prices could not be loaded. Please retry or send your route below for a quotation.');}).finally(()=>clearTimeout(timer));return()=>{active=false;clearTimeout(timer);abort.abort();};},[attempt]);
 if(error)return <div role="alert"><p>{error}</p><button className="button button-primary" onClick={()=>{setError('');setAttempt(v=>v+1);}}>Retry prices</button></div>;
 if(!catalog)return <p role="status">Loading day service and round-tour prices…</p>;
 return <TransportPackages catalog={catalog} onSelect={onSelect}/>;
}
