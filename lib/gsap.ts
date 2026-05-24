import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Only register ScrollTrigger if we are in a browser environment
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  
  // Optimize GSAP for smoother navigation
  gsap.config({
    nullTargetWarn: false,
  });
  
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
}

export { gsap, ScrollTrigger };
