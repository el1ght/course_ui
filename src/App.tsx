import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import MatrixEditor from './components/MatrixEditor'
import EffectScreen from './screens/EffectScreen'
import SizeEffectScreen from './screens/SizeEffectScreen'

function App() {
  return (
    <Router>
      <div className='p-4'>
        <h1 className='text-3xl font-bold text-center mb-8'>Задача Лізингу Обладнання Будівельними Компаніями</h1>
        
        <nav className="flex justify-center gap-4 mb-8">
          <Link 
            to="/" 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Matrix Editor
          </Link>
          <Link 
            to="/effect" 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Effect Screen
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<MatrixEditor />} />
          <Route path="/effect" element={<EffectScreen />} />
          <Route path="/size-effect" element={<SizeEffectScreen />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
