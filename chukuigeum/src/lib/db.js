import { supabase } from './supabase'

// ─── 계산 히스토리 저장 ───────────────────────────────────────────────────────

export async function saveCalculation({ score, amount, resultTitle, answers }) {
  // 공유용 고유 토큰 생성 (랜덤 8자리)
  const shareToken = Math.random().toString(36).substring(2, 10)

  const { data, error } = await supabase
    .from('calculations')
    .insert([{
      score,
      amount,
      result_title: resultTitle,
      answers,        // JSON으로 저장
      share_token: shareToken,
    }])
    .select()
    .single()

  if (error) {
    console.error('저장 실패:', error)
    return null
  }

  return data  // { id, share_token, ... } 반환
}

// ─── 공유 토큰으로 결과 불러오기 ─────────────────────────────────────────────

export async function getCalculationByToken(token) {
  const { data, error } = await supabase
    .from('calculations')
    .select('*')
    .eq('share_token', token)
    .single()

  if (error) {
    console.error('불러오기 실패:', error)
    return null
  }

  return data
}

// ─── 예식장 제보 저장 ─────────────────────────────────────────────────────────

export async function saveVenueReport({ venueName, address, mealCost, venueFee, reporterEmail, fileUrl }) {
  const { data, error } = await supabase
    .from('venue_reports')
    .insert([{
      venue_name: venueName,
      address,
      meal_cost: mealCost ? parseInt(mealCost) : null,
      venue_fee: venueFee ? parseInt(venueFee) : null,
      reporter_email: reporterEmail,
      file_url: fileUrl || null,
      status: 'pending',
    }])
    .select()
    .single()

  if (error) {
    console.error('제보 저장 실패:', error)
    return null
  }

  return data
}

// ─── 제보 파일 업로드 (Supabase Storage) ─────────────────────────────────────

export async function uploadReportFile(file) {
  if (!file) return null

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`

  const { data, error } = await supabase.storage
    .from('venue-reports')           // Storage 버킷 이름
    .upload(fileName, file)

  if (error) {
    console.error('파일 업로드 실패:', error)
    return null
  }

  // 공개 URL 반환
  const { data: urlData } = supabase.storage
    .from('venue-reports')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
