import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  if (payload.action === "register") {
    const fetchData = await fetch(`${process.env.BACKEND_URL}/register`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await fetchData.json();
    console.log(data);
    return NextResponse.json({ ...data, status: fetchData.status });
  } else if (payload.action === "login") {
    const fetchData = await fetch(`${process.env.BACKEND_URL}/login`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await fetchData.json();
    console.log(data);
    const response = NextResponse.json({ ...data, status: fetchData.status });
    response.headers.set(
      "Set-Cookie",
      `token=${data.token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict; Secure`
    );
    return response;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  return NextResponse.json({ token: token });
}
