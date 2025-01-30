// จำลอง API ของลูกค้า
export async function GET() {
    const mockData = [
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" },
    ];

    return Response.json(mockData, { status: 200 });
}
