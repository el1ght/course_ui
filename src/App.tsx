import { useState } from 'react'
import MatrixEditor from './components/MatrixEditor'

function App() {
  return (
    <div className='p-4'>
      <h1 className='text-3xl font-bold text-center'>Задача Лізингу Обладнання Будівельними Компаніями</h1>
      <MatrixEditor />
    </div>
  )
}

export default App
