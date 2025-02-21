"use client"; // This ensures it's treated as a client component

import dynamic from "next/dynamic";
const AuthForm = dynamic(() => import("./auth-form"), { ssr: false });

export default function LoginPage() {
  return <AuthForm />;
}
