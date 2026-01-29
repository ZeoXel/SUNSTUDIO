import { NextRequest, NextResponse } from 'next/server'
import { completePayment, getPaymentOrder } from '@/services/paymentService'

// 支付宝SDK导入（用于验签）
let AlipaySdk: any = null
try {
  const AlipaySdkModule = require('alipay-sdk')
  if (AlipaySdkModule && typeof AlipaySdkModule === 'function') {
    AlipaySdk = AlipaySdkModule
  } else if (AlipaySdkModule.default && typeof AlipaySdkModule.default === 'function') {
    AlipaySdk = AlipaySdkModule.default
  } else if (AlipaySdkModule.AlipaySdk && typeof AlipaySdkModule.AlipaySdk === 'function') {
    AlipaySdk = AlipaySdkModule.AlipaySdk
  } else {
    AlipaySdk = AlipaySdkModule
  }
} catch (error) {
  console.error('[Alipay Notify] SDK导入失败:', error)
}

// 支付宝SDK初始化
let alipaySdk: any = null
if (AlipaySdk && process.env.ALIPAY_APPID) {
  try {
    let privateKey = process.env.ALIPAY_PRIVATE_KEY
    let publicKey = process.env.ALIPAY_PUBLIC_KEY

    if (privateKey && publicKey) {
      let processedPrivateKey = privateKey.trim()
      let processedPublicKey = publicKey.trim()

      if (!processedPrivateKey.includes('-----BEGIN')) {
        processedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${processedPrivateKey}\n-----END PRIVATE KEY-----`
      }

      if (!processedPublicKey.includes('-----BEGIN')) {
        processedPublicKey = `-----BEGIN PUBLIC KEY-----\n${processedPublicKey}\n-----END PUBLIC KEY-----`
      }

      alipaySdk = new AlipaySdk({
        appId: process.env.ALIPAY_APPID,
        privateKey: processedPrivateKey,
        alipayPublicKey: processedPublicKey,
        gateway: 'https://openapi.alipay.com/gateway.do',
        signType: 'RSA2',
        keyType: 'PKCS8'
      })
    }
  } catch (error) {
    console.error('[Alipay Notify] SDK初始化失败:', error)
  }
}

// 支付宝异步通知处理
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const params: Record<string, string> = {}

    formData.forEach((value, key) => {
      params[key] = value.toString()
    })

    console.log('[Alipay Notify] 收到通知:', {
      out_trade_no: params.out_trade_no,
      trade_status: params.trade_status,
      trade_no: params.trade_no,
    })

    // 验证签名（生产环境必须验证）
    if (alipaySdk && process.env.NODE_ENV === 'production') {
      try {
        const signVerified = alipaySdk.checkNotifySign(params)
        if (!signVerified) {
          console.error('[Alipay Notify] 签名验证失败')
          return new NextResponse('fail', { status: 400 })
        }
      } catch (err) {
        console.error('[Alipay Notify] 签名验证异常:', err)
        // 开发环境跳过签名验证
        if (process.env.NODE_ENV === 'production') {
          return new NextResponse('fail', { status: 400 })
        }
      }
    }

    const orderNo = params.out_trade_no
    const tradeStatus = params.trade_status
    const tradeNo = params.trade_no

    if (!orderNo) {
      console.error('[Alipay Notify] 缺少订单号')
      return new NextResponse('fail', { status: 400 })
    }

    // 检查订单是否存在
    const order = await getPaymentOrder(orderNo)
    if (!order) {
      console.error('[Alipay Notify] 订单不存在:', orderNo)
      return new NextResponse('fail', { status: 400 })
    }

    // 处理支付成功
    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      const success = await completePayment(orderNo, tradeNo)
      if (success) {
        console.log('[Alipay Notify] 支付完成:', orderNo)
        return new NextResponse('success')
      } else {
        console.error('[Alipay Notify] 处理支付失败:', orderNo)
        return new NextResponse('fail', { status: 500 })
      }
    }

    // 其他状态直接返回成功（避免支付宝重复通知）
    return new NextResponse('success')
  } catch (error) {
    console.error('[Alipay Notify] 处理异常:', error)
    return new NextResponse('fail', { status: 500 })
  }
}

// 支付宝同步返回处理（用户支付后跳转）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orderNo = searchParams.get('out_trade_no')

  if (!orderNo) {
    return NextResponse.redirect(new URL('/pay-result?status=error', request.url))
  }

  // 重定向到支付结果页
  return NextResponse.redirect(new URL(`/pay-result?orderNo=${orderNo}`, request.url))
}
