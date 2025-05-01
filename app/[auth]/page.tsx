import AuthPage from "@/component/AuthPage";
import { notFound } from "next/navigation";
export default function LoginRegister({ params }: { params: { auth: string } }) {
  const allowedSlugs = ["login", "register"];
  const { auth } = params;
  console.log("My Slug: " + auth);
  if (!allowedSlugs.includes(auth)) {
    notFound();
  }
  return (
    <AuthPage slug={auth} />
  );
}