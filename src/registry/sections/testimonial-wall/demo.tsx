"use client";

import { TestimonialWall } from "./testimonial-wall";

const T = [
  ["Cut our landing build from a week to an afternoon.", "Maya Chen", "Founder, Loop"], ["The motion feels expensive. Nobody guesses it's a drop-in.", "Dev Patel", "Design engineer"],
  ["My agent wired it up in one prompt.", "Sam Ortiz", "Indie hacker"], ["Finally a library where every piece just works.", "Lena Fischer", "CTO, Northwind"],
  ["Best README I've ever handed an AI.", "Jonah Reyes", "Freelancer"], ["We shipped on Friday. On a Friday.", "Aiko Tanaka", "PM, Pico"],
] as const;

export default function Demo() {
  return <div style={{ width: "100%", maxWidth: 760 }}><TestimonialWall height={300} testimonials={T.map(([quote, name, role]) => ({ quote, name, role }))} /></div>;
}
