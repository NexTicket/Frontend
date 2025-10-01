import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check connectivity to API Gateway
    const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3001/health';

    const response = await fetch(apiGatewayUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          apiGateway: 'up',
          ...data,
        },
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          apiGateway: 'down',
        },
        error: `API Gateway responded with status ${response.status}`,
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        apiGateway: 'error',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}
