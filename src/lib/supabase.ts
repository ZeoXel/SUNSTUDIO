import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 客户端 Supabase 客户端 (用于前端)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
})

// 服务端 Supabase 客户端 (用于 API 路由)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: (url, options = {}) => {
      // 禁用详细日志输出
      return fetch(url, { ...options })
    }
  }
})

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          short_id?: string
          phone: string
          name: string
          balance: number
          total_recharge_amount: number
          assigned_key_id?: string
          role: 'user' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          short_id?: string
          phone: string
          name: string
          balance?: number
          total_recharge_amount?: number
          assigned_key_id?: string
          role?: 'user' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          short_id?: string
          phone?: string
          name?: string
          balance?: number
          total_recharge_amount?: number
          assigned_key_id?: string
          role?: 'user' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          key_value: string
          provider: string
          status: 'active' | 'assigned' | 'expired'
          assigned_user_id: string | null
          created_at: string
          assigned_at: string | null
        }
        Insert: {
          id?: string
          key_value: string
          provider: string
          status?: 'active' | 'assigned' | 'expired'
          assigned_user_id?: string | null
          created_at?: string
          assigned_at?: string | null
        }
        Update: {
          id?: string
          key_value?: string
          provider?: string
          status?: 'active' | 'assigned' | 'expired'
          assigned_user_id?: string | null
          created_at?: string
          assigned_at?: string | null
        }
      }
      verification_codes: {
        Row: {
          id: string
          phone: string
          code: string
          name?: string | null
          expires_at: string
          created_at: string
          used?: boolean
          used_at?: string | null
        }
        Insert: {
          id?: string
          phone: string
          code: string
          name?: string | null
          expires_at: string
          created_at?: string
          used?: boolean
          used_at?: string | null
        }
        Update: {
          id?: string
          phone?: string
          code?: string
          name?: string | null
          expires_at?: string
          created_at?: string
          used?: boolean
          used_at?: string | null
        }
      }
      user_display: {
        Row: {
          id: string
          short_id?: string
          phone: string
          name: string
          balance: number
          total_recharge_amount: number
          role: 'user' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
          friendly_id: string
        }
        Insert: {}
        Update: {}
      }
      payments: {
        Row: {
          id: string
          user_id: string
          order_no: string
          amount: number
          points: number
          payment_method: 'wechat' | 'alipay'
          description: string
          status: 'pending' | 'paid' | 'failed'
          transaction_id?: string | null
          created_at: string
          paid_at?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          order_no: string
          amount: number
          points: number
          payment_method: 'wechat' | 'alipay'
          description: string
          status?: 'pending' | 'paid' | 'failed'
          transaction_id?: string | null
          created_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          order_no?: string
          amount?: number
          points?: number
          payment_method?: 'wechat' | 'alipay'
          description?: string
          status?: 'pending' | 'paid' | 'failed'
          transaction_id?: string | null
          created_at?: string
          paid_at?: string | null
        }
      }
      balance_logs: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'recharge' | 'consumption' | 'refund'
          description: string
          payment_id?: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'recharge' | 'consumption' | 'refund'
          description: string
          payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'recharge' | 'consumption' | 'refund'
          description?: string
          payment_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
