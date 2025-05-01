import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const fetchData = await fetch("http://localhost:8080/userlist", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await fetchData.json();
  return NextResponse.json({ ...data, status: fetchData.status });
}
