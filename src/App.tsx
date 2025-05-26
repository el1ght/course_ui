import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Solve from './screens/Solve.tsx'
import Experiment1 from './screens/Experiment1.tsx'
import Experiment2 from './screens/Experiment2.tsx'
import Experiment3 from './screens/Experiment3.tsx'
import Experiment4 from './screens/Experiment4.tsx'

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
            Розв'язання
          </Link>
          <Link 
            to="/experiment1"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Експеримент 1
          </Link>
          <Link 
            to="/experiment2"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Експеримент 2
          </Link>
          <Link 
            to="/experiment3"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Експеримент 3
          </Link>
          <Link 
            to="/experiment4"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Експеримент 4
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<Solve />} />
          <Route path="/experiment1" element={<Experiment1 />} />
          <Route path="/experiment2" element={<Experiment2 />} />
          <Route path="/experiment3" element={<Experiment3 />} />
          <Route path="/experiment4" element={<Experiment4 />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
