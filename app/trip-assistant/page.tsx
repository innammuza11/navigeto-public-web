"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { assistantReply } from "@/lib/travelos";

type Message={role:"bot"|"user";text:string};
const opening:Message={role:"bot",text:"Hi! I’m the Navigeto Trip Assistant. Tell me your travel dates, number of travellers and what you want to experience in Sri Lanka."};

export default function TripAssistantPage(){
  const[messages,setMessages]=useState<Message[]>([opening]); const[input,setInput]=useState(""); const[options,setOptions]=useState(["Family holiday","Honeymoon","Culture & nature","Beach and relaxation"]); const[pending,setPending]=useState(false); const session=useId();
  async function send(value=input){const text=value.trim();if(!text||pending)return;setMessages((m)=>[...m,{role:"user",text}]);setInput("");setPending(true);try{const result=await assistantReply({message:text,session_id:`web-${session}`,history:messages.slice(-8)});setMessages((m)=>[...m,{role:"bot",text:result.reply}]);setOptions(result.options||[])}catch{setMessages((m)=>[...m,{role:"bot",text:"I cannot reach TravelOS right now. You can still send your trip details through the custom-trip form and our team will respond."}]);setOptions([])}finally{setPending(false)}}
  return <><PageHero eyebrow="Navigeto Trip Assistant" title="Turn a WhatsApp-style enquiry into a structured Sri Lanka trip request." description="The assistant guides customers through dates, passengers, hotels, transfers and interests, then hands the request to Navigeto TravelOS." />
  <div className="shell content-wrap assistant-shell"><aside className="assistant-guide"><div className="eyebrow">Best results</div><h3>Share these details</h3><div className="guide-step"><b>1</b><span>Travel dates and arrival flight timing</span></div><div className="guide-step"><b>2</b><span>Adults, children and room requirements</span></div><div className="guide-step"><b>3</b><span>Preferred hotel category and budget style</span></div><div className="guide-step"><b>4</b><span>Culture, wildlife, beaches, hills or special interests</span></div><Link className="button button-primary button-block" href="/custom-trip">Open full trip form</Link></aside>
  <section className="chat-panel"><div className="chat-messages">{messages.map((message,index)=><div className={`message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}{pending?<div className="message bot">Checking the best next question…</div>:null}</div>{options.length?<div className="quick-options">{options.map((option)=><button key={option} onClick={()=>send(option)}>{option}</button>)}</div>:null}<form className="chat-input" onSubmit={(e)=>{e.preventDefault();send()}}><input className="input" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Example: 2 adults, 6 nights in August…"/><button className="button button-primary" disabled={pending}>Send</button></form></section></div></>;
}
