import { NextResponse } from 'next/server';
import { validateDatabaseConnection } from '@/lib/db';

export async function GET() {
  try {
    const dbConnected = await validateDatabaseConnection();

    return NextResponse.json({
      status: dbConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        api: 'running',
      },
      version: '1.0.0',
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
