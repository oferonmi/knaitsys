// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { name, image } = await req.json();
    // TODO: Update user in your database here
    // Example: await db.user.update({ where: { email: session.user.email }, data: { name, image } });
    return NextResponse.json({ success: true });
}
