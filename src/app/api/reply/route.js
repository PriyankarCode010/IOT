// app/api/reply/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    const latestReply = await prisma.reply.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      message: latestReply?.message || 'No message yet',
    });
  } catch (err) {
    console.error('GET /api/reply error:', err);
    return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { message } = body;

    const saved = await prisma.reply.create({
      data: {
        message,
      },
    });

    return NextResponse.json(saved);
  } catch (err) {
    console.error('POST /api/reply error:', err);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
