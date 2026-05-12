"use client";

import { REQUEST_TO_QUESTS_PAGE_ID } from "@/constants";
import useCustomerDetails from "@/components/hooks/useCustomerDetails";
import { useRef, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import TitleText from "@/components/elements/titleText";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

export default function RequestToQuests() {
    const customerDetails = useCustomerDetails();
    
    const containerRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLParagraphElement | null>(null);
    const qrRef = useRef<HTMLDivElement | null>(null);
    const [qrUrl, setQrUrl] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setQrUrl(window.location.origin + customerDetails.request_to_quests_link);
        }
    }, [customerDetails.request_to_quests_link]);

    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger);

        const timeLine = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                toggleActions: "play none none none",
            }
        })
        .from(textRef.current, 
            {
                duration: 1,
                opacity: 0,
                filter: "blur(3px)",
                ease: "expo.out"
            },
            1
        )
        .from(qrRef.current, 
            {
                duration: 1,
                y: "-=20",
                rotateX: -60,
                opacity: 0,
                filter: "blur(5px)",
                ease: "expo.out"
            },
            2
        );

        return () => {
            timeLine.kill();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div
            id={REQUEST_TO_QUESTS_PAGE_ID}
            ref={containerRef}
            className="mb-32"
        >
            <TitleText  
                triggerID={REQUEST_TO_QUESTS_PAGE_ID}
                text={customerDetails.request_to_quests_title}
                delay={0.25}
                duration={0.75}
                className="!mb-10"
            />

            <p
                ref={textRef}
                className="
                    text-lg font-normal text-center indent-4 text-balance text-neutral-600
                    whitespace-pre-line ml-auto mr-auto 
                    px-4 md:w-[90%] xl:w-[50%]
                "
            >
                {customerDetails.request_to_quests_text}
            </p>

            <div
                ref={qrRef}
                className="ml-auto mr-auto mt-8 w-[75%] md:w-[55%] transform xl:w-[45%]"
            >
                <a
                    target="_blank"
                    href={customerDetails.request_to_quests_link}
                    className="cursor-pointer flex justify-center"
                >
                    {qrUrl && (
                        <QRCodeSVG
                            value={qrUrl}
                            size={280}
                            bgColor="transparent"
                            fgColor="var(--foreground)"
                            level="M"
                            className="w-[75%] max-w-[280px] mt-2 opacity-85"
                        />
                    )}
                </a>

                {customerDetails.request_to_quests_description !== "" 
                    ? 
                    <p
                        className="text-xs text-center text-pretty text-neutral-600 opacity-75"
                        dangerouslySetInnerHTML={{ __html: 
                            customerDetails.request_to_quests_description }}
                    />
                    : null
                }
            </div>
        </div>
    );
}