import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getPaymentOrder } from '@/services/paymentService'

// 订单状态查询接口
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNo: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { orderNo } = await params

    if (!orderNo) {
      return NextResponse.json(
        { error: '参数错误', message: '订单号不能为空' },
        { status: 400 }
      )
    }

    // 获取支付订单
    const payment = await getPaymentOrder(orderNo)

    if (!payment) {
      return NextResponse.json(
        { status: 'notfound', message: '订单不存在' },
        { status: 404 }
      )
    }

    // 验证订单归属
    if (payment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 返回订单状态
    return NextResponse.json({
      success: true,
      data: {
        status: payment.status,
        pay_type: payment.payment_method,
        order_no: payment.order_no,
        amount: payment.amount,
        points: payment.points,
        description: payment.description,
        created_at: payment.created_at,
        paid_at: payment.paid_at,
        transaction_id: payment.transaction_id,
      },
    })
  } catch (error) {
    console.error('[OrderStatus] 查询失败:', error)
    return NextResponse.json(
      { error: '查询失败', message: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    )
  }
}
