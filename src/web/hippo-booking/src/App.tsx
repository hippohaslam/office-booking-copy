import './App.scss'
import { Outlet } from 'react-router-dom'
import Nav from './components/nav/Nav'

// This is effectivly a Layout component that wraps the Nav and Outlet components
function App() {

  return (
    <div className="app-container">
      <Nav />
      <main>
      <Outlet />
      </main>
      <footer>A footer</footer>
    </div>
  )
}

export default App
