import { useEffect, useState } from 'react'
import { Button, Tabs } from 'antd'
import { CustomOverlayMap, Map, MapMarker, ZoomControl, useKakaoLoader, useMap } from 'react-kakao-maps-sdk'
import './MapSearchPage.css'

const API_BASE = 'http://localhost:3000/api'

const CATEGORY_ICONS = {
  ALL: '📍',
  GYM: '🏋️',
  YOGA: '🧘',
  PILATES: '🤸',
  CROSSFIT: '🔥',
  KICKBOXING: '🦵',
  BOXING: '🥊',
  SWIM: '🏊',
  CYCLE: '🚴',
  TAEKWONDO: '🥋',
  DANCE: '💃',
}

const SEOUL_CENTER = { lat: 37.566826, lng: 126.9786567 }

function buildRegionLabel(region) {
  return [region.sidoName, region.sigunguName, region.dongName].filter(Boolean).join(' ')
}

function buildKakaoDirectionsUrl(facility) {
  const name = encodeURIComponent(facility.name || '운동시설')
  return `https://map.kakao.com/link/to/${name},${facility.lat},${facility.lng}`
}

function FacilityPopup({ facility, categoryName, onClose }) {
  return (
    <div
      className="marker-popup"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <button type="button" className="marker-popup__close" onClick={onClose} aria-label="닫기">
        ×
      </button>

      <div className="marker-popup__header">
        <span className="marker-popup__emoji">
          {CATEGORY_ICONS[facility.categoryCode] || '📍'}
        </span>
        <div>
          <strong className="marker-popup__name">{facility.name}</strong>
          <p className="marker-popup__category">{categoryName || '운동시설'}</p>
        </div>
      </div>

      <div className="marker-popup__row">
        <span>📞</span>
        <span className="marker-popup__label">전화번호</span>
        <span>{facility.phone || '정보 없음'}</span>
      </div>
      <div className="marker-popup__row">
        <span>🕒</span>
        <span className="marker-popup__label">운영시간</span>
        <span>{facility.businessHours || '정보 없음'}</span>
      </div>

      <Button
        type="primary"
        block
        shape="round"
        className="marker-popup__directions"
        href={buildKakaoDirectionsUrl(facility)}
        target="_blank"
        rel="noreferrer"
      >
        길찾기
      </Button>
    </div>
  )
}

function FocusSelectedFacility({ facility }) {
  const map = useMap()

  useEffect(() => {
    if (!facility || !window.kakao?.maps) return

    // 줌은 유지하고, 선택한 마커가 화면 안으로 오도록만 이동한다
    const position = new window.kakao.maps.LatLng(facility.lat, facility.lng)
    map.panTo(position)

    const timerId = window.setTimeout(() => {
      // 말풍선이 핀 위에 떠서, 마커를 중앙보다 조금 아래에 둔다
      map.panBy(0, 90)
    }, 280)

    return () => window.clearTimeout(timerId)
  }, [facility, map])

  return null
}

function MapSearchPage({ region, onBack }) {
  const [categoryList, setCategoryList] = useState([])
  const [selectedCategoryCode, setSelectedCategoryCode] = useState(null)
  const [facilityList, setFacilityList] = useState([])
  const [rankingList, setRankingList] = useState([])
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [sidebarTab, setSidebarTab] = useState('category')

  useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JS_KEY,
  })

  useEffect(() => {
    fetch(`${API_BASE}/filters/options?level=category`)
      .then((response) => {
        if (!response.ok) throw new Error('카테고리 조회에 실패했습니다.')
        return response.json()
      })
      .then((data) => setCategoryList(data.options || []))
      .catch((error) => console.error(error))
  }, [])

  // 지역이 정해지면 시설을 바로 검색한다. 카테고리를 바꾸면 다시 검색한다.
  useEffect(() => {
    if (!region?.sidoCode || !region?.sigunguCode) return

    let url = `${API_BASE}/facilities?sidoCode=${region.sidoCode}&sigunguCode=${region.sigunguCode}`
    if (region.dongCode) url += `&dongCode=${region.dongCode}`
    if (selectedCategoryCode) url += `&categoryCode=${selectedCategoryCode}`

    fetch(url, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('시설 조회에 실패했습니다.')
        return response.json()
      })
      .then((data) => {
        setFacilityList(data.facilities || [])
        setSelectedFacility(null)
      })
      .catch((error) => console.error(error))
  }, [region, selectedCategoryCode])

  useEffect(() => {
    if (sidebarTab !== 'ranking' || !region?.sigunguCode) return

    fetch(`${API_BASE}/facilities/ranking?regionCode=${region.sigunguCode}`, {
      cache: 'no-store',
    })
      .then((response) => {
        if (!response.ok) throw new Error('인기 순위 조회에 실패했습니다.')
        return response.json()
      })
      .then((data) => setRankingList(data.ranking || []))
      .catch((error) => console.error(error))
  }, [sidebarTab, region])

  function handleSelectFacility(facilityId) {
    fetch(`${API_BASE}/facilities/${facilityId}`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('상세 조회에 실패했습니다.')
        return response.json()
      })
      .then(setSelectedFacility)
      .catch((error) => console.error(error))
  }

  const mapCenter = facilityList[0]
    ? { lat: facilityList[0].lat, lng: facilityList[0].lng }
    : SEOUL_CENTER

  const selectedCategoryName = selectedCategoryCode
    ? categoryList.find((category) => category.code === selectedCategoryCode)?.name
    : '전체'

  return (
    <div className="map-page">
      <header className="map-page__header">
        <Button type="text" onClick={onBack}>
          ← 뒤로
        </Button>
        <div className="map-page__brand">운동맵</div>
        <Button className="map-page__location" shape="round" onClick={onBack}>
          📍 {buildRegionLabel(region)}
        </Button>
      </header>

      <div className="map-page__body">
        <Map
          key={`${region.sigunguCode}-${region.dongCode || ''}-${selectedCategoryCode || 'all'}`}
          center={mapCenter}
          className="map-page__map"
          style={{ width: 'calc(100% - 280px)', height: '100%' }}
          level={5}
        >
          <ZoomControl />
          <FocusSelectedFacility facility={selectedFacility} />
          {facilityList.map((facility) => (
            <MapMarker
              key={facility.facilityId}
              position={{ lat: facility.lat, lng: facility.lng }}
              onClick={() => handleSelectFacility(facility.facilityId)}
            />
          ))}
          {selectedFacility && (
            <CustomOverlayMap
              position={{ lat: selectedFacility.lat, lng: selectedFacility.lng }}
              xAnchor={0.5}
              yAnchor={1.18}
              zIndex={10}
              clickable
            >
              <FacilityPopup
                facility={selectedFacility}
                categoryName={
                  categoryList.find((category) => category.code === selectedFacility.categoryCode)
                    ?.name
                }
                onClose={() => setSelectedFacility(null)}
              />
            </CustomOverlayMap>
          )}
          </Map>

        <div className="map-page__count">{facilityList.length}개 장소</div>

        <aside className="map-page__sidebar">
          <Tabs
            className="map-page__tabs"
            activeKey={sidebarTab}
            onChange={setSidebarTab}
            centered
            tabBarGutter={0}
            items={[
              {
                key: 'category',
                label: '카테고리',
                children: (
                  <div className="map-page__tab-body">
                    <ul className="map-page__list">
                      <li>
                        <button
                          type="button"
                          className={`map-page__item${selectedCategoryCode ? '' : ' is-active'}`}
                          onClick={() => setSelectedCategoryCode(null)}
                        >
                          <span className="map-page__icon">{CATEGORY_ICONS.ALL}</span>
                          전체
                          {!selectedCategoryCode && <span className="map-page__dot" />}
                        </button>
                      </li>
                      {categoryList.map((category) => (
                        <li key={category.code}>
                          <button
                            type="button"
                            className={`map-page__item${selectedCategoryCode === category.code ? ' is-active' : ''}`}
                            onClick={() => setSelectedCategoryCode(category.code)}
                          >
                            <span className="map-page__icon">
                              {CATEGORY_ICONS[category.code] || '📌'}
                            </span>
                            {category.name}
                            {selectedCategoryCode === category.code && (
                              <span className="map-page__dot" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="map-page__footer">
                      {selectedCategoryCode ? `${selectedCategoryName} 표시 중` : '전체 표시 중'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'ranking',
                label: '인기 순위',
                children: (
                  <div className="map-page__tab-body">
                    <ul className="map-page__list">
                      {rankingList.length === 0 && (
                        <li className="map-page__footer">아직 순위 데이터가 없습니다.</li>
                      )}
                      {rankingList.map((item) => (
                        <li key={item.facilityId}>
                          <button
                            type="button"
                            className="map-page__item"
                            onClick={() => handleSelectFacility(item.facilityId)}
                          >
                            <span className="map-page__rank">{item.rank}</span>
                            {item.name || '이름 없음'}
                            <span className="map-page__footer" style={{ marginLeft: 'auto', border: 0, padding: 0 }}>
                              {item.viewCount}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              },
            ]}
          />
        </aside>
      </div>
    </div>
  )
}

export default MapSearchPage
