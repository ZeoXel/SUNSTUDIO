import { NextRequest, NextResponse } from 'next/server';

/**
 * 更新用户名 API
 * POST /api/user/update-username
 */
export async function POST(request: NextRequest) {
  try {
    // 从请求头获取 API Key（客户端传递）
    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (!apiKey) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: '用户名不能为空' },
        { status: 400 }
      );
    }

    // 验证用户名长度
    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0 || trimmedUsername.length > 50) {
      return NextResponse.json(
        { error: '用户名长度必须在1-50个字符之间' },
        { status: 400 }
      );
    }

    // 调用 USERAPI 网关更新用户名
    const baseUrl = process.env.NEXT_PUBLIC_USERAPI_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/user/update-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ username: trimmedUsername }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '更新失败' }));
      return NextResponse.json(
        { error: error.error || '更新用户名失败' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('更新用户名失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
