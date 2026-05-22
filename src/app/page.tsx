import type { Metadata } from "next";
import HomePage from "@/components/home-page";

export const metadata: Metadata = {
  title: "AI Spend Audit — Tarka AI",
  description:
    "Instantly audit your AI stack and uncover wasted spend across Cursor, Claude, ChatGPT, Copilot, and more.",
};

export default function Page() {
  return <HomePage />;
}