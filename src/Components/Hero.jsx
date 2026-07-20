import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Star, Sparkles, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const VIDEO_SRC = '/videos/p3.mp4'
const POSTER_SRC = '/images/hero-poster.jpg'

export default function Hero() {
    const videoRef = useRef(null)
    const [videoFailed, setVideoFailed] = useState(false)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches
        if (prefersReducedMotion) {
            video.pause()
        }
    }, [])

    return (
        <section className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#0a0d16]">
            {/* Animated ghee-pour backdrop — always rendered as a safety net.
                Sits underneath the video and shows through instantly if the
                video is slow to load, or permanently if it fails. */}
            {/* <GheePourBackdrop /> */}

            {/* Real laddu footage on top */}
            {!videoFailed && (
                <video
                    ref={videoRef}
                    className="absolute inset-0 size-full object-cover"
                    style={{ objectPosition: 'center 35%' }}
                    src={VIDEO_SRC}
                    // poster={POSTER_SRC}
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-hidden="true"
                    onError={() => setVideoFailed(true)}
                />
            )}

            {/* Legibility overlay: darker left where text sits */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />

            {/* Copy */}
            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 lg:px-12">
                <div className="max-w-xl">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#d9a353]">
                        Godavari Heritage
                        <span className="text-[#d9a353]/50">·</span>
                        Est. 2026
                    </p>

                    <h1 className="mt-8 font-serif text-5xl leading-[1.1] text-[#f5f3ee] md:text-6xl xl:text-7xl">
                        Authentic{' '}
                        <span className="italic text-[#c25f56]">Godavari</span>{' '}
                        homemade{' '}
                        <span className="italic text-[#e2914a]">delicacies.</span>
                    </h1>

                    <p className="mt-8 max-w-md text-balance text-lg leading-relaxed text-[#d8d6d1]">
                        Slow-cooked in pure cow ghee. Hand-rolled with jaggery and
                        love. Recipes preserved from village kitchens of the Godavari
                        — now delivered to your door.
                    </p>

                    <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="h-12 rounded-full bg-[#8b2f2f] px-6 text-base text-white hover:bg-[#8b2f2f]/90">
                            <a href="/shop">
                                <span className="text-nowrap">Shop the Heritage</span>
                                <ChevronRight className="ml-1 size-4" />
                            </a>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="h-12 rounded-full border-white/30 bg-white/5 px-6 text-base text-white backdrop-blur-sm hover:bg-white/15">
                            <a href="#story">
                                <span className="text-nowrap">Our Story</span>
                            </a>
                        </Button>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#d8d6d1]">
                        <span className="flex items-center gap-1.5">
                            <Star className="size-4 fill-[#d9a353] text-[#d9a353]" />
                            4.9 / 5 · 1200+ Orders
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-[#d9a353]" />
                            Free Shipping ₹999+
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}

/**
 * Decorative animated backdrop simulating a stream of ghee pouring and
 * pooling with rippling rings. Pure SVG + CSS keyframes — no asset to load,
 * so it renders instantly and acts as a safety net under the real video.
 * Respects prefers-reduced-motion by freezing all animation.
 */
// function GheePourBackdrop() {
//     return (
//         <div className="absolute inset-0" aria-hidden="true">
//             <svg
//                 className="size-full"
//                 viewBox="0 0 1200 800"
//                 preserveAspectRatio="xMidYMid slice">
//                 <defs>
//                     <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="0%" stopColor="#f3c877" />
//                         <stop offset="55%" stopColor="#e2a545" />
//                         <stop offset="100%" stopColor="#b5772b" />
//                     </linearGradient>
//                     <radialGradient id="poolGrad" cx="50%" cy="35%" r="65%">
//                         <stop offset="0%" stopColor="#f6d385" />
//                         <stop offset="55%" stopColor="#d99a3f" />
//                         <stop offset="100%" stopColor="#8a5a20" />
//                     </radialGradient>
//                     <radialGradient id="glowAmber" cx="50%" cy="50%" r="50%">
//                         <stop offset="0%" stopColor="#e2914a" stopOpacity="0.35" />
//                         <stop offset="100%" stopColor="#e2914a" stopOpacity="0" />
//                     </radialGradient>
//                     <radialGradient id="glowMaroon" cx="50%" cy="50%" r="50%">
//                         <stop offset="0%" stopColor="#8b2f2f" stopOpacity="0.3" />
//                         <stop offset="100%" stopColor="#8b2f2f" stopOpacity="0" />
//                     </radialGradient>
//                     <filter id="softBlur">
//                         <feGaussianBlur stdDeviation="30" />
//                     </filter>
//                 </defs>

//                 <circle className="ghee-glow-a" cx="900" cy="220" r="260" fill="url(#glowAmber)" filter="url(#softBlur)" />
//                 <circle className="ghee-glow-b" cx="760" cy="560" r="220" fill="url(#glowMaroon)" filter="url(#softBlur)" />

//                 <g className="ghee-stream-wobble">
//                     <rect x="845" y="-40" width="20" height="560" rx="10" fill="url(#streamGrad)" opacity="0.9" />
//                 </g>

//                 <circle className="ghee-drop ghee-drop-1" cx="855" cy="0" r="7" fill="#f0c368" />
//                 <circle className="ghee-drop ghee-drop-2" cx="855" cy="0" r="6" fill="#e9b452" />
//                 <circle className="ghee-drop ghee-drop-3" cx="855" cy="0" r="8" fill="#f3c877" />

//                 <ellipse cx="855" cy="522" rx="86" ry="20" fill="url(#poolGrad)" />
//                 <ellipse cx="855" cy="522" rx="86" ry="20" fill="none" stroke="#f6d385" strokeOpacity="0.4" strokeWidth="1.5" />

//                 <ellipse className="ghee-ripple ghee-ripple-1" cx="855" cy="522" rx="40" ry="10" fill="none" stroke="#f3c877" strokeWidth="2" />
//                 <ellipse className="ghee-ripple ghee-ripple-2" cx="855" cy="522" rx="40" ry="10" fill="none" stroke="#f3c877" strokeWidth="2" />
//                 <ellipse className="ghee-ripple ghee-ripple-3" cx="855" cy="522" rx="40" ry="10" fill="none" stroke="#f3c877" strokeWidth="2" />
//             </svg>

//             <style>{`
//                 .ghee-stream-wobble {
//                     transform-origin: 855px 0px;
//                     animation: streamWobble 3.2s ease-in-out infinite;
//                 }
//                 @keyframes streamWobble {
//                     0%, 100% { transform: translateX(0) scaleX(1); }
//                     50% { transform: translateX(4px) scaleX(0.92); }
//                 }

//                 .ghee-drop {
//                     animation: dropFall 3.2s ease-in infinite;
//                     opacity: 0;
//                 }
//                 .ghee-drop-1 { animation-delay: 0s; }
//                 .ghee-drop-2 { animation-delay: 1.05s; }
//                 .ghee-drop-3 { animation-delay: 2.1s; }
//                 @keyframes dropFall {
//                     0% { transform: translateY(0); opacity: 0; }
//                     8% { opacity: 1; }
//                     88% { opacity: 1; }
//                     100% { transform: translateY(520px); opacity: 0; }
//                 }

//                 .ghee-ripple {
//                     transform-origin: 855px 522px;
//                     animation: rippleGrow 3.2s ease-out infinite;
//                     opacity: 0;
//                 }
//                 .ghee-ripple-1 { animation-delay: 0.3s; }
//                 .ghee-ripple-2 { animation-delay: 1.35s; }
//                 .ghee-ripple-3 { animation-delay: 2.4s; }
//                 @keyframes rippleGrow {
//                     0% { transform: scale(0.3); opacity: 0.55; }
//                     100% { transform: scale(2.4); opacity: 0; }
//                 }

//                 .ghee-glow-a {
//                     animation: glowDriftA 22s ease-in-out infinite alternate;
//                 }
//                 .ghee-glow-b {
//                     animation: glowDriftB 26s ease-in-out infinite alternate;
//                 }
//                 @keyframes glowDriftA {
//                     0% { transform: translate(0, 0); }
//                     100% { transform: translate(-30px, 20px); }
//                 }
//                 @keyframes glowDriftB {
//                     0% { transform: translate(0, 0); }
//                     100% { transform: translate(25px, -15px); }
//                 }

//                 @media (prefers-reduced-motion: reduce) {
//                     .ghee-stream-wobble,
//                     .ghee-drop,
//                     .ghee-ripple,
//                     .ghee-glow-a,
//                     .ghee-glow-b {
//                         animation: none !important;
//                     }
//                     .ghee-drop { opacity: 0.9; }
//                     .ghee-ripple { opacity: 0.25; transform: scale(1); }
//                 }
//             `}</style>
//         </div>
//     )
// }