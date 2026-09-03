import { useEffect, useState } from 'react'
import BrandSidebar from './components/BrandSidebar.jsx'
import RegionSelectPage from './pages/RegionSelectPage.jsx'
import MapSearchPage from './pages/MapSearchPage.jsx'
import undongmapLogo from './assets/undongmap-logo.png'
import './AppShell.css'

function formatKoreaClock(date) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

function App() {
  const [currentPage, setCurrentPage] = useState('region')
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [isBrandSidebarOpen, setIsBrandSidebarOpen] = useState(true)
  const [now, setNow] = useState(() => new Date())

  function handleToggleBrandSidebar() {
    setIsBrandSidebarOpen((isOpen) => !isOpen)
  }

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  const isMapPage = currentPage === 'map' && selectedRegion

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-topbar__left">
          <img
            className="app-topbar__logo"
            src={undongmapLogo}
            alt="undongmap"
          />
          <span className="app-topbar__tagline">오늘은 어디서 운동할래?</span>
        </div>
        <div className="app-topbar__center">
          <h1 className="app-topbar__title">운동맵</h1>
        </div>
        <div className="app-topbar__clock-wrap">
          <span className="app-topbar__clock-kr">KR</span>
          <time className="app-topbar__clock" dateTime={now.toISOString()}>
            {formatKoreaClock(now)}
          </time>
        </div>
      </header>

      <div className="app-shell__body">
        <BrandSidebar isOpen={isBrandSidebarOpen} onToggle={handleToggleBrandSidebar} />

        {isMapPage ? (
          <MapSearchPage
            region={selectedRegion}
            onBack={() => setCurrentPage('region')}
          />
        ) : (
          <RegionSelectPage
            onConfirm={(region) => {
              setSelectedRegion(region)
              setCurrentPage('map')
            }}
          />
        )}
      </div>
    </div>
  )
}

export default App
