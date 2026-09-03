import './BrandSidebar.css'

const INSTAGRAM_URL = 'https://www.instagram.com/undongmap/'

function BrandSidebar({ isOpen, onToggle }) {
  const toggleLabel = isOpen ? '사이드바 숨기기' : '사이드바 열기'

  return (
    <aside className={`brand-sidebar${isOpen ? '' : ' is-collapsed'}`}>
      <button
        type="button"
        className="brand-sidebar__toggle"
        onClick={onToggle}
        aria-label={toggleLabel}
        aria-expanded={isOpen}
      >
        {isOpen ? '>>' : '<<'}
      </button>

      {isOpen && (
        <a
          className="brand-sidebar__contact"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          정보 수정·문의 @undongmap
        </a>
      )}
    </aside>
  )
}

export default BrandSidebar
