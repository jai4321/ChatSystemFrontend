"use client";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    router.push("/user");   
  }, []);
}
