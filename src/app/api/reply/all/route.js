import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const allReplies = await prisma.reply.findMany({
      orderBy: { timestamp: 'asc' },
    });
    return NextResponse.json(allReplies);
  } catch (err) {
    console.error('GET /api/reply/all error:', err);
    return NextResponse.json({ error: 'Failed to fetch all messages' }, { status: 500 });
  }
} 