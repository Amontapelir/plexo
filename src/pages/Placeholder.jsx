import MainLayout from '../components/MainLayout'

function Placeholder({ title, message = 'Раздел в разработке', activeNav, onNavigate }) {
  return (
    <MainLayout active={activeNav} onNavigate={onNavigate}>
      <section className="placeholder-page">
        <h2>{title}</h2>
        <p>{message}</p>
      </section>
    </MainLayout>
  )
}

export default Placeholder

