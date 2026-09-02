import { useEffect, useState } from 'react'
import { Button, Select } from 'antd'
import './RegionSelectPage.css'

const FILTER_API = 'http://localhost:3000/api/filters/options'

function toSelectOptions(rows) {
  return rows.map((row) => ({
    value: row.code,
    label: row.name,
  }))
}

function fetchFilterOptions(level, parentCode) {
  const requestUrl = new URL(FILTER_API)
  requestUrl.searchParams.set('level', level)
  if (parentCode) {
    requestUrl.searchParams.set('parentCode', parentCode)
  }

  return fetch(requestUrl)
    .then((response) => {
      if (!response.ok) throw new Error('필터 조회에 실패했습니다.')
      return response.json()
    })
    .then((data) => data.options || [])
}

function RegionSelectPage({ onConfirm }) {
  const [sidoList, setSidoList] = useState([])
  const [sigunguList, setSigunguList] = useState([])
  const [dongList, setDongList] = useState([])
  const [selectedSidoCode, setSelectedSidoCode] = useState(null)
  const [selectedSigunguCode, setSelectedSigunguCode] = useState(null)
  const [selectedDongCode, setSelectedDongCode] = useState(null)

  // 시/도는 화면이 열릴 때 한 번만 불러온다
  useEffect(() => {
    fetchFilterOptions('sido')
      .then(setSidoList)
      .catch((error) => console.error(error))
  }, [])

  // 시/도를 고르면 구 목록을 불러오고, 하위 선택을 비운다
  useEffect(() => {
    if (!selectedSidoCode) {
      setSigunguList([])
      return
    }

    fetchFilterOptions('sigungu', selectedSidoCode)
      .then(setSigunguList)
      .catch((error) => console.error(error))
  }, [selectedSidoCode])

  // 구를 고르면 동 목록을 불러온다
  useEffect(() => {
    if (!selectedSigunguCode) {
      setDongList([])
      return
    }

    fetchFilterOptions('dong', selectedSigunguCode)
      .then(setDongList)
      .catch((error) => console.error(error))
  }, [selectedSigunguCode])

  const canConfirm = Boolean(selectedSidoCode && selectedSigunguCode)

  function handleSidoChange(sidoCode) {
    setSelectedSidoCode(sidoCode)
    setSelectedSigunguCode(null)
    setSelectedDongCode(null)
    setDongList([])
  }

  function handleSigunguChange(sigunguCode) {
    setSelectedSigunguCode(sigunguCode)
    setSelectedDongCode(null)
  }

  function handleConfirm() {
    if (!canConfirm) return

    const sido = sidoList.find((row) => row.code === selectedSidoCode)
    const sigungu = sigunguList.find((row) => row.code === selectedSigunguCode)
    const dong = dongList.find((row) => row.code === selectedDongCode)

    onConfirm({
      sidoCode: selectedSidoCode,
      sigunguCode: selectedSigunguCode,
      dongCode: selectedDongCode,
      sidoName: sido?.name || '',
      sigunguName: sigungu?.name || '',
      dongName: dong?.name || '',
    })
  }

  return (
    <div className="region-page">
      <div className="region-page__brand">
        <span className="region-page__emoji" aria-hidden="true">
          🏋️
        </span>
        <h1 className="region-page__logo">운동맵</h1>
        <span className="region-page__emoji" aria-hidden="true">
          🏃‍♀️
        </span>
      </div>

      <section className="region-page__card">
        <h2 className="region-page__title">지역 선택</h2>
        <p className="region-page__desc">운동 시설을 찾을 지역을 선택해주세요</p>

        <div className="region-page__field">
          <label className="region-page__label" htmlFor="sido-select">
            시 / 도
          </label>
          <Select
            id="sido-select"
            size="large"
            style={{ width: '100%' }}
            placeholder="선택하세요"
            value={selectedSidoCode}
            options={toSelectOptions(sidoList)}
            onChange={handleSidoChange}
          />
        </div>

        <div className="region-page__field">
          <label className="region-page__label" htmlFor="sigungu-select">
            시 / 군 / 구
          </label>
          <Select
            id="sigungu-select"
            size="large"
            style={{ width: '100%' }}
            placeholder="시/도를 먼저 선택하세요"
            disabled={!selectedSidoCode}
            value={selectedSigunguCode}
            options={toSelectOptions(sigunguList)}
            onChange={handleSigunguChange}
          />
        </div>

        <div className="region-page__field">
          <label className="region-page__label" htmlFor="dong-select">
            동 (선택사항)
          </label>
          <Select
            id="dong-select"
            size="large"
            allowClear
            style={{ width: '100%' }}
            placeholder="시/군/구를 먼저 선택하세요"
            disabled={!selectedSigunguCode}
            value={selectedDongCode}
            options={toSelectOptions(dongList)}
            onChange={(dongCode) => setSelectedDongCode(dongCode ?? null)}
          />
        </div>

        <Button
          type="primary"
          block
          disabled={!canConfirm}
          className="region-page__confirm"
          onClick={handleConfirm}
        >
          확인
        </Button>
      </section>
    </div>
  )
}

export default RegionSelectPage
