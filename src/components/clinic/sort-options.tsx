'use client'

import { useState } from 'react'

interface SortOptionsProps {
  onSortChange: (sortBy: string) => void
  consultationType: 'online' | 'offline' | 'mixed'
  defaultSort?: string
}

export default function SortOptions({ onSortChange, consultationType, defaultSort = 'auto' }: SortOptionsProps) {
  const [selectedSort, setSelectedSort] = useState(defaultSort)

  const handleSortChange = (sortValue: string) => {
    setSelectedSort(sortValue)
    onSortChange(sortValue)
  }

  const getSortLabel = (value: string) => {
    switch (value) {
      case 'auto':
        return consultationType === 'online' ? '진료비 낮은 순' : '거리 가까운 순'
      case 'price':
        return '진료비 낮은 순'
      case 'distance':
        return '거리 가까운 순'
      default:
        return '기본 정렬'
    }
  }

  return (
    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">정렬 기준:</span>

      <div className="flex gap-2">
        {/* 자동 정렬 */}
        <button
          onClick={() => handleSortChange('auto')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedSort === 'auto'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {getSortLabel('auto')}
          {selectedSort === 'auto' && consultationType !== 'mixed' && (
            <span className="ml-1 text-xs opacity-80">
              ({consultationType === 'online' ? '비대면' : '대면'} 추천)
            </span>
          )}
        </button>

        {/* 진료비 정렬 */}
        <button
          onClick={() => handleSortChange('price')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedSort === 'price'
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          💰 진료비 낮은 순
        </button>

        {/* 거리 정렬 (대면 진료 시에만 의미 있음) */}
        <button
          onClick={() => handleSortChange('distance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedSort === 'distance'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          } ${consultationType === 'online' ? 'opacity-50' : ''}`}
          disabled={consultationType === 'online'}
        >
          📍 거리 가까운 순
          {consultationType === 'online' && (
            <span className="ml-1 text-xs opacity-60">(비대면 진료)</span>
          )}
        </button>
      </div>

      {/* 정렬 기준 설명 */}
      <div className="ml-auto text-xs text-gray-500">
        {consultationType === 'online' && (
          <span className="inline-flex items-center gap-1">
            💻 비대면 진료 - 거리 무관
          </span>
        )}
        {consultationType === 'offline' && (
          <span className="inline-flex items-center gap-1">
            🏥 대면 진료 - 방문 필요
          </span>
        )}
        {consultationType === 'mixed' && (
          <span className="inline-flex items-center gap-1">
            🔄 대면/비대면 혼합
          </span>
        )}
      </div>
    </div>
  )
}