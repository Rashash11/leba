"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import { 
    OUR_STORY_PAGE_ID, 
    OUR_STORY_PARAGRAPH_CLASS_NAME 
} from "@/constants";
import useCustomerDetails from "@/components/hooks/useCustomerDetails";
import ourStoryImage from "@/public/our-story.png";
import ImageDisintegrationEffect from "@/components/elements/imageDisintegrationEffect";
import TitleText from "@/components/elements/titleText";
import Icon from "@/components/elements/icon";

export default function OurStory() {
    const customerDetails = useCustomerDetails();

    const [paragraphs] = useState<string[]>(() => {
        const lines = customerDetails.our_story_text.split("\n\n");

        lines.forEach((line) => line.trim()); 

        return lines;
    }); 

    const containerRef = useRef<HTMLDivElement | null>(null);
    const cornerFlowersLeftRef = useRef<SVGSVGElement | null>(null);
    const cornerFlowersRightRef = useRef<SVGSVGElement | null>(null);

    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger);

        const paragraphDuration = 0.5;
        var paragraphPosition = 2.5;
        const paragraphTargets: HTMLElement[] = gsap.utils
            .toArray(`.${OUR_STORY_PARAGRAPH_CLASS_NAME}`);

        const timeLine = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                toggleActions: "play none none none",
            }
        });

        timeLine.from(cornerFlowersLeftRef.current, 
            {
                duration: 1,
                opacity: 0,
                width: "-=10",
                ease: "expo.out"
            }, 
            2.5
        )
        .from(cornerFlowersRightRef.current, 
            {
                duration: 1,
                opacity: 0,
                width: "-=10",
                ease: "expo.out"
            }, 
            2.5
        );

        paragraphTargets.forEach((splitParagraph) => {
            timeLine.from(splitParagraph, 
                {
                    duration: paragraphDuration,
                    y: "-=20",
                    rotateX: -75,
                    opacity: 0,
                    filter: "blur(5px)",
                    stagger: 0.1,
                    ease: "expo.out"
                },
                paragraphPosition
            );

            paragraphPosition += paragraphDuration;
        });

        return () => {
            timeLine.kill();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div 
            id={OUR_STORY_PAGE_ID}
            ref={containerRef}
            className="relative pt-8 mb-32"
        >
            <TitleText  
                triggerID={OUR_STORY_PAGE_ID}
                text={customerDetails.our_story_title}
                delay={0.25}
                duration={0.75}
            />
            
            <div className="
                    relative aspect-w-5 aspect-h-4 w-[75%] h-auto mr-auto ml-auto 
                    md:w-[45%] xl:w-[30%] 2xl:w-[25%]
                "
            >
                <ImageDisintegrationEffect
                    triggerID={OUR_STORY_PAGE_ID}
                    delay={1.25}
                    duration={1}
                    alt="Our story"
                    image={ourStoryImage}
                    className="mb-16 object-cover w-full h-full rounded-md shadow-inner brightness-125"
                />
                <Icon
                    ref={cornerFlowersLeftRef}
                    name="corner_flowers"
                    className="
                        absolute top-[-24] left-[-30] w-32 h-auto
                        xl:w-40 xl:top-[-31] xl:left-[-37]
                    "
                />
                <Icon
                    ref={cornerFlowersRightRef}
                    name="corner_flowers"
                    className="
                        absolute bottom-[-24] right-[-30] w-32 h-auto rotate-180
                        xl:w-40 xl:bottom-[-31] xl:right-[-38]
                    "
                />
            </div>
            <div className="md:w-[75%] xl:w-[60%] 2xl:w-[50%] ml-auto mr-auto">        
                {paragraphs.map((line, index) => (
                    <p
                        key={index}
                        className={`
                            ${OUR_STORY_PARAGRAPH_CLASS_NAME} 
                            text-justify text-balance text-base text-(--foreground-base)
                            px-6 indent-4 whitespace-pre-line mb-5 transform xl:text-lg
                        `}
                        dangerouslySetInnerHTML={{ __html: line }}
                    />
                ))}
            </div>
        </div>
    );
};