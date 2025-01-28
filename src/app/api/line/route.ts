export async function GET() {
    return Response.json({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '' });
}
