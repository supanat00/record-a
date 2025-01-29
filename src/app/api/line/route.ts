export async function GET(request: Request) {
    const secretKey = request.headers.get("x-api-key");

    if (secretKey !== process.env.API_SECRET) {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    return Response.json({ liffId: process.env.LIFF_ID || '' });
}
