import { NextResponse } from 'next/server';

export async function GET() {
    const apiBaseUrl = process.env.RUNTIME_API_BASE_URL || '';

    return NextResponse.json({
        apiBaseUrl
    });
}
