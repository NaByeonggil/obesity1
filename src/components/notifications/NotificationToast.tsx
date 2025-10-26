'use client'

import { Bell, X } from 'lucide-react'
import { toast } from 'sonner'

export interface NotificationData {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
}

export function showNotificationToast(notification: NotificationData) {
  toast.custom(
    (t) => (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[320px] max-w-[400px] animate-in slide-in-from-top-5">
        <div className="flex items-start gap-3">
          {/* 아이콘 */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 text-sm">
                {notification.title}
              </h4>
              <button
                onClick={() => toast.dismiss(t)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 break-words">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {formatTime(notification.createdAt)}
            </p>
          </div>
        </div>
      </div>
    ),
    {
      duration: 5000, // 5초 후 자동 닫힘
      position: 'top-right',
    }
  )
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  return date.toLocaleDateString('ko-KR')
}
