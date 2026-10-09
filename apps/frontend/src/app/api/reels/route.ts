import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'reels.json');

// Initialize the file if it doesn't exist
const initData = () => {
  if (!fs.existsSync(path.dirname(dataFilePath))) {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    const defaultReels: any[] = [];
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultReels, null, 2));
  }
};

export async function GET() {
  try {
    initData();
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const reels = JSON.parse(data);
    return NextResponse.json(reels, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read reels' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function POST(req: Request) {
  try {
    initData();
    const body = await req.json();
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const reels = JSON.parse(data);
    
    const newReel = {
      id: Math.random().toString(36).substring(2, 9),
      url: body.url,
      sort_order: reels.length > 0 ? Math.max(...reels.map((r: any) => r.sort_order)) + 1 : 1,
      created_at: new Date().toISOString(),
    };
    
    reels.push(newReel);
    fs.writeFileSync(dataFilePath, JSON.stringify(reels, null, 2));
    
    return NextResponse.json(newReel, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add reel' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function DELETE(req: Request) {
  try {
    initData();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    
    const data = fs.readFileSync(dataFilePath, 'utf8');
    let reels = JSON.parse(data);
    
    reels = reels.filter((r: any) => r.id !== id);
    fs.writeFileSync(dataFilePath, JSON.stringify(reels, null, 2));
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete reel' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
