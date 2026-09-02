import { useState } from 'react'
import RegionSelectPage from './pages/RegionSelectPage.jsx'
import MapSearchPage from './pages/MapSearchPage.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('region')
  const [selectedRegion, setSelectedRegion] = useState(null)

  if (currentPage === 'region' || !selectedRegion) {
    return (
      <RegionSelectPage
        onConfirm={(region) => {
          setSelectedRegion(region)
          setCurrentPage('map')
        }}
      />
    )
  }

  return (
    <MapSearchPage
      region={selectedRegion}
      onBack={() => setCurrentPage('region')}
    />
  )
}

export default App
