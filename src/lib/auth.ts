import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserService } from '@/lib/services/user.service'
import { ApiKeyService } from '@/lib/services/apikey.service'
import { VerificationService } from '@/lib/services/verification.service'
import { PromoterService } from '@/lib/services/promoter.service'


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'phone',
      name: 'Phone',
      credentials: {
        phone: { label: "手机号", type: "tel" },
        code: { label: "验证码", type: "text" },
        name: { label: "姓名", type: "text" },
        promoCode: { label: "推广码", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          console.error('❌ 登录失败: 缺少手机号或验证码')
          throw new Error('请输入手机号和验证码')
        }

        try {
          // 验证验证码
          const verification = await VerificationService.verifyCode(credentials.phone, credentials.code)
          
          if (!verification.success) {
            console.error('❌ 登录失败: 验证码错误', { phone: credentials.phone })
            throw new Error('验证码错误或已过期')
          }

          // 获取或创建用户
          let user = await UserService.getUserByPhone(credentials.phone)

          if (!user) {
            // 新用户注册 - 生成格式化的用户名
            let userName = verification.name || credentials.name

            // 如果没有提供姓名，使用自动生成的格式化名称
            if (!userName || userName === '新用户') {
              userName = await UserService.generateNewUserName()
            }

            // 检查是否是超级管理员
            const role = credentials.phone === '19857149421' ? 'admin' : 'user'

            // 处理推广码逻辑
            let initialRechargeAmount = 2.00 // 默认2元
            let promoterId: string | undefined

            if (credentials.promoCode) {
              const promoValidation = await PromoterService.validatePromoCode(credentials.promoCode)
              if (promoValidation.valid) {
                initialRechargeAmount = promoValidation.bonusAmount // 使用推广码配置的奖励金额
                promoterId = promoValidation.promoterId
                console.log('🎁 使用推广码注册:', {
                  promoCode: credentials.promoCode,
                  bonusAmount: initialRechargeAmount
                })
              } else {
                console.log('⚠️ 推广码无效，使用默认金额:', credentials.promoCode)
              }
            }

            console.log('📱 新用户注册:', {
              phone: credentials.phone,
              name: userName,
              role,
              initialAmount: initialRechargeAmount
            })

            try {
              user = await UserService.createUser({
                phone: credentials.phone,
                name: userName,
                balance: 0, // 余额由total_recharge_amount动态计算
                total_recharge_amount: initialRechargeAmount, // 根据推广码确定初始额度
                role: role
              })

              console.log('✅ 用户创建成功:', { userId: user.id, shortId: user.short_id })

              // 如果使用了推广码，创建推广记录
              if (promoterId) {
                try {
                  await PromoterService.createPromotion(
                    promoterId,
                    user.id,
                    initialRechargeAmount
                  )
                  console.log('✅ 推广记录创建成功')
                } catch (promoError) {
                  console.error('⚠️ 推广记录创建失败（不影响注册）:', promoError)
                }
              }

              // 自动分配密钥给新用户（异步处理，不阻塞注册）
              const userId = user.id; // 保存userId避免闭包问题
              Promise.resolve().then(async () => {
                try {
                  console.log('🔑 开始为新用户分配密钥 (provider=lsapi):', userId)
                  const assignedKey = await ApiKeyService.assignKeyToUser(userId, 'lsapi')
                  if (assignedKey) {
                    console.log('🔑 密钥分配成功:', { userId: userId, keyId: assignedKey.id, provider: assignedKey.provider })
                  } else {
                    console.log('⚠️ 暂无可用的 lsapi 密钥分配给新用户:', userId)
                  }
                } catch (keyError) {
                  console.error('⚠️ 密钥分配失败（不影响注册）:', keyError)
                }
              })

            } catch (error) {
              console.error('❌ 用户创建失败:', error)
              throw new Error('用户创建失败')
            }
          } else {
            // 已有用户登录
            console.log('📱 用户登录:', { userId: user.id, phone: credentials.phone })
            
            // 异步处理密钥分配，不阻塞登录流程
            if (user) {
              const userId = user.id; // 保存userId避免闭包问题
              Promise.resolve().then(async () => {
                try {
                  const userKeys = await ApiKeyService.getApiKeysByUserId(userId)
                  if (userKeys.length === 0) {
                    await ApiKeyService.assignKeyToUser(userId, 'lsapi')
                  }
                } catch (error) {
                  console.log('密钥分配失败，稍后重试')
                }
              })
            }
            
            // 如果验证码包含姓名信息，异步更新用户名
            if (user && verification.name && verification.name !== user.name) {
              const userId = user.id; // 保存userId避免闭包问题
              Promise.resolve().then(async () => {
                try {
                  await UserService.updateUser(userId, { name: verification.name })
                } catch (error) {
                  console.log('用户名更新失败')
                }
              })
            }
          }

          console.log('✅ 认证成功，返回用户信息')
          return {
            id: user.id,
            name: user.name,
            email: `${credentials.phone}@phone.local`, // NextAuth 需要 email 字段
            role: user.role
          }
        } catch (error) {
          console.error('❌ 认证过程出错:', error)
          if (error instanceof Error) {
            throw error
          }
          throw new Error('认证失败')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.role = (user as any).role || 'user' // 直接使用authorize返回的role，避免额外查询
      }
      // 移除token刷新时的额外查询，使用现有role
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        session.user.name = token.name as string
        ;(session.user as any).role = token.role as string
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
    signOut: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
}