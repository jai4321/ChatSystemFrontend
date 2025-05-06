import { cookies } from "next/headers";
import MessageBox from "./component/MessageBox";

export default async function User({ token }: any) {
  const tokenCookie = (await cookies()).get("token")?.value || null;
  return <MessageBox token={tokenCookie} />;
}
