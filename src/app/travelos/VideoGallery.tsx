import s from "./travelos.module.css";

const videos = [
  { slug: "enquiry-demo", title: "One enquiry. One connected journey.", duration: "1:21", description: "Follow a fictional Sri Lanka enquiry through the actual interface, from the brief and itinerary to a saved draft quotation.", featured: true, portrait: false },
  { slug: "b2b-walkthrough", title: "Inside the B2B portal", duration: "1:29", description: "Explore the tour library, quote requests, bookings and documents from the agency view.", featured: false, portrait: false },
  { slug: "staff-walkthrough", title: "From costing to operations", duration: "2:28", description: "A closer look at quotation preparation, reservation services and the booking accounts workspace.", featured: false, portrait: false },
  { slug: "enquiry-reel", title: "The enquiry story, in portrait", duration: "1:21", description: "The same sample enquiry in a mobile-friendly vertical edit.", featured: false, portrait: true },
  { slug: "product-introduction", title: "Meet TravelOS", duration: "0:47", description: "A short introduction to the connected travel workspace.", featured: false, portrait: true },
];

export default function VideoGallery() {
  return <section id="videos" aria-labelledby="video-heading" className={`${s.container} ${s.section}`}>
    <div className={s.sectionHeading}>
      <div><p className={s.eyebrow}><span /> WATCH TRAVELOS AT WORK</p><h2 id="video-heading">See the work.<br />Follow the journey.</h2></div>
      <p>Start with a sample enquiry, then explore the agency portal and staff workflow. Choose a video and press play.</p>
    </div>
    <div className={s.videoGrid}>
      {videos.map((video) => <article key={video.slug} className={`${s.videoCard} ${video.featured ? s.videoFeatured : ""}`}>
        <video controls playsInline preload="none" poster={`/media/travelos/${video.slug}.webp`} width={video.portrait ? 1080 : 1920} height={video.portrait ? 1920 : 1080} className={video.portrait ? s.portraitVideo : s.landscapeVideo} aria-label={video.title}>
          <source src={`/media/travelos/${video.slug}.mp4`} type="video/mp4" />
          <track kind="captions" src={`/media/travelos/${video.slug}.vtt`} srcLang="en" label="English" />
          <a href={`/media/travelos/${video.slug}.mp4`}>Watch {video.title}</a>
        </video>
        <div className={s.videoCopy}><div className={s.videoTitle}><h3>{video.title}</h3><span>{video.duration}</span></div><p>{video.description}</p></div>
      </article>)}
    </div>
    <div className={s.videoFootnote}><p>Edited screen captures with narration. Demonstration enquiries are fictional; operations views are redacted. These videos do not represent a new confirmed booking or financial posting.</p><a href="#demo" className={s.textLink}>Explore your agency’s workflow with us ↗</a></div>
  </section>;
}
