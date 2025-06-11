// app/api/log/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma'; // Assuming lib/prisma.js exports your Prisma client

export async function POST(req) {
  const body = await req.json();
  const { message } = body;

  const saved = await prisma.log.create({
    data: {
      message,
      timestamp: new Date(),
    },
  });

  return NextResponse.json(saved);
}

export async function GET() {
  const logs = await prisma.log.findMany({
    orderBy: { timestamp: 'desc' },
  });

  return NextResponse.json(logs);
}
