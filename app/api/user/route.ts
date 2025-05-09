import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const fetchData = await fetch(`${process.env.BACKEND_URL}/userlist`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await fetchData.json();
  return NextResponse.json({ ...data, status: fetchData.status });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const token = request.cookies.get("token")?.value;
  const fetchData = await fetch(`${process.env.BACKEND_URL}/usermessages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({receiverId: payload.receiverId, skip: payload.skip, limit: payload.limit}),
  });
  const data = await fetchData.json();
  console.log(data);
  return NextResponse.json({ ...data, status: fetchData.status });
}