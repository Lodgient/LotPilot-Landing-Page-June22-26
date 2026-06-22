"use client";

import { useEffect, useState } from "react";

function partOfDay(h: number) {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Time-aware greeting based on the viewer's local clock (avoids the server's
// UTC time saying "Good morning" at 11 PM). Renders a neutral greeting on the
// server, then corrects on mount.
export default function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    setGreeting(partOfDay(new Date().getHours()));
  }, []);
  return (
    <>
      {greeting}, {name}
    </>
  );
}
