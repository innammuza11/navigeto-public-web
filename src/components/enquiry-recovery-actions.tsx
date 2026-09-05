"use client";
import {useState} from 'react';
import {liveApi} from '@/lib/live-api';
export function EnquiryRecoveryActions({onReset,disabled=false}:{onReset:()=>void;disabled?:boolean}) {
 const [error,setError]=useState('');
 const reset=()=>{
  if(!window.confirm('The earlier enquiry may already have been received. Starting a separate enquiry does not cancel it and may create another request. Continue?'))return;
  try{liveApi.startSeparateEnquiry();setError('');onReset();}
  catch{setError('Could not reset enquiry recovery storage. Please contact Navigeto before submitting again.');}
 };
 return <div><button type="button" disabled={disabled} onClick={reset}>Start a separate enquiry</button>{error&&<p role="alert">{error}</p>}</div>;
}
