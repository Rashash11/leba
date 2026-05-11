"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import useCustomerDetails from "@/components/hooks/useCustomerDetails";
import HeroSection from "@/components/windows/heroSection";
import OurStory from "@/components/windows/ourStory";
import EventDetails from "@/components/windows/eventDetails";
import TimerToWedding from "@/components/windows/timerToWedding";
import Footer from "@/components/windows/footer";
import RequestToQuests from "@/components/windows/requestToQuests";

export default function Home() {
  const customerDetails = useCustomerDetails();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    "name": "Wedding invitation",
    "location": {
      "@type": "Place",
      "name": customerDetails.event_detail_location_name,
      "address": customerDetails.event_detail_location_address
    },
    "startDate": customerDetails.wedding_date
      .replaceAll(".", "-").trim() + "T" + customerDetails.time.trim()
  }

  useGSAP(() => {
    gsap.registerPlugin(ScrollSmoother);

    ScrollSmoother.create({
      smooth: 1,
      effects: true,
      smoothTouch: 0
    });
  }, []);

  return (
    <>
      <section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      </section>

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <HeroSection />
          <div className="noise-container relative overflow-hidden">
            {customerDetails.our_story_page_enabled ? <OurStory /> : null}
            {customerDetails.event_details_page_enabled ? <EventDetails /> : null}
            {customerDetails.timer_to_wedding_page_enabled ? <TimerToWedding /> : null}
            {customerDetails.request_to_guests_page_enabled ? <RequestToQuests /> : null}
            {customerDetails.footer_page_enabled ? <Footer /> : null}
          </div>
        </div>
      </div>
    </>
  );
}