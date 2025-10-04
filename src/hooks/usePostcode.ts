import { useEffect } from 'react'

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: PostcodeData) => void
        onclose?: (state: 'FORCE_CLOSE' | 'COMPLETE_CLOSE') => void
        width?: string | number
        height?: string | number
        maxSuggestItems?: number
      }) => {
        open: () => void
      }
    }
  }
}

export interface PostcodeData {
  zonecode: string
  address: string
  addressEnglish: string
  addressType: 'R' | 'J'
  userSelectedType: 'R' | 'J'
  noSelected: 'Y' | 'N'
  userLanguageType: 'K' | 'E'
  roadAddress: string
  roadAddressEnglish: string
  jibunAddress: string
  jibunAddressEnglish: string
  autoRoadAddress: string
  autoRoadAddressEnglish: string
  autoJibunAddress: string
  autoJibunAddressEnglish: string
  buildingCode: string
  buildingName: string
  apartment: 'Y' | 'N'
  sido: string
  sidoEnglish: string
  sigungu: string
  sigunguEnglish: string
  sigunguCode: string
  roadnameCode: string
  bcode: string
  roadname: string
  roadnameEnglish: string
}

export const usePostcode = () => {
  useEffect(() => {
    // Daum Postcode Service 스크립트 동적 로드
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      const existingScript = document.querySelector('script[src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const openPostcode = (
    onComplete: (data: PostcodeData) => void,
    options?: {
      onClose?: (state: 'FORCE_CLOSE' | 'COMPLETE_CLOSE') => void
      width?: string | number
      height?: string | number
    }
  ) => {
    if (!window.daum) {
      console.error('Daum Postcode Service가 로드되지 않았습니다.')
      return
    }

    const postcode = new window.daum.Postcode({
      oncomplete: onComplete,
      onclose: options?.onClose,
      width: options?.width || '100%',
      height: options?.height || '100%',
      maxSuggestItems: 5
    })

    postcode.open()
  }

  return { openPostcode }
}