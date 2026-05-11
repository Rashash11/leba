"use client";

import Image from "next/image";
import HeroImage from "@/public/hero-leba.png";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Lottie from "lottie-react";
import ArrowDown from "@/public/arrow.json"
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_PAGE_ID, OUR_STORY_PAGE_ID } from "@/constants";
import HeaderTitle from "@/components/elements/headerTitle";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import useCustomerDetails from "@/components/hooks/useCustomerDetails";
import Icon from "@/components/elements/icon";

export default function HeroSection() {
    const customerDetails = useCustomerDetails();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLHeadingElement | null>(null);
    const dateRef = useRef<HTMLDivElement | null>(null);
    const arrowRef = useRef<HTMLDivElement | null>(null);
    const circleRef = useRef<SVGSVGElement | null>(null);

    useGSAP(() => { 
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        const nextPage = document.getElementById(OUR_STORY_PAGE_ID);

        const timeLine = gsap.timeline({ 
            delay: 0.5 
        })
        .fromTo(textRef.current,
            {
                opacity: 0,
                x: "-=10%",
                scale: 0.95,
                filter: "blur(5px)"
            },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.75,
                filter: "blur(0px)",
                ease: "power3.out"
            },
            1
        )
        .fromTo(dateRef.current,
            {
                opacity: 0,
                x: "+=10%",
                scale: 0.95,
                filter: "blur(5px)"
            }, {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.75,
                filter: "blur(0px)",
                ease: "power3.out"
            }, 
            1
        )
        .fromTo(arrowRef.current,
            {
                opacity: 0,
                filter: "blur(5px)",
            }, {
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.75,
                ease: "power3.out",
            }, 
            1.5
        );

        gsap.fromTo(circleRef.current,
            {
                translateY: "100%",
                height: 0
            },
            {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    scrub: 1
                }, 
                translateY: 3,
                height: "50%"
            }
        );

        if (nextPage && customerDetails.page_transitions) {
            ScrollTrigger.create({
                trigger: nextPage,
                start: "100px bottom",
                onEnter: () => {
                    gsap.to(window, 
                        {
                            duration: 1,
                            scrollTo: {
                                y: containerRef.current?.scrollHeight ?? 0,
                                offsetY: 0
                            },
                            ease: "expo.in"
                        }
                    );
                },
            });     
        }

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            timeLine.kill();
        };
    }, [textRef, dateRef, arrowRef]);

    function scrollTo() {
        gsap.to(window, 
            {
                duration: 1,
                scrollTo: {
                    y: containerRef.current?.scrollHeight ?? 0,
                    offsetY: 0
                },
                ease: "expo.in"
            }
        );
    }

    return (
        <div className="relative">
            <HeaderTitle />
            <div 
                id={HERO_PAGE_ID}
                ref={containerRef}
                className="h-[100svh] relative flex flex-col flex-nowrap justify-center items-center gap-4"
            >
                <Image 
                    className="absolute h-full w-full object-cover object-top -z-10"
                    alt="Hero image"
                    src={HeroImage}
                    height={HeroImage.height}
                    width={HeroImage.width}
                    priority={true}
                    style={{
                        maskImage: "linear-gradient(to bottom, transparent 0%, black 100%, black 100%)",
                        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 100%, black 100%)"
                    }}
                />

                <h1
                    ref={textRef}
                    className="
                        flex items-stretch text-5xl text-center whitespace-nowrap tracking-wider leading-none drop-shadow
                        2xl:text-6xl
                    "
                    style={{
                        fontFamily: "var(--font-great-vibes)",
                        color: "var(--foreground)"
                    }}
                >
                    {customerDetails.hero_section_title}
                </h1>

                <div 
                    ref={dateRef}
                    className="grid grid-cols-3 grid-rows-3 gap-y-1 gap-x-3"
                >
                    <div className="border-b-2 border-[var(--foreground)]" />
                    <p className="row-span-3 flex justify-center items-center pl-2 pr-2 text-[var(--foreground)] font-normal text-7xl uppercase text-center"
                    >
                        {customerDetails.day_of_the_month.trim()}
                    </p>
                    <div className="border-b-2 border-[var(--foreground)]" />
                    <p className="flex justify-center items-center pl-2 pr-2 text-[var(--foreground)] font-semibold uppercase">
                        {customerDetails.month.trim()}
                    </p>
                    <p className="flex justify-center items-center pl-2 pr-2 text-[var(--foreground)] font-semibold uppercase">
                        {customerDetails.time.trim()}
                    </p>
                    <div className="border-t-2 border-[var(--foreground)]" />
                    <div className="border-t-2 border-[var(--foreground)]" />
                </div>

                <div
                    ref={arrowRef}
                    className="absolute bottom-0"
                >
                    <Lottie 
                        animationData={ArrowDown} 
                        loop={true} 
                        className="w-24 cursor-pointer"
                        onClick={scrollTo}
                    />
                </div>    
            </div>

            <Icon
                name="circle"
                ref={circleRef}
                fillColor="var(--background)"
                strokeColor="var(--background)"
                className="hero-page-circle-anim-svg absolute bottom-0 left-0 w-full h-auto"
            />
        </div>
    );
};