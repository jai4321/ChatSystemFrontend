import { cookies } from "next/headers";
import UserMain from "./component/UserMain";

export default async function User({ token }: any) {
  const tokenCookie = (await cookies()).get("token")?.value || null;
  return <UserMain token={tokenCookie} />;
}
