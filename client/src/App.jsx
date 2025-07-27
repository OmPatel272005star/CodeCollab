
import {Routes,Route} from 'react-router-dom'

import Home from './components/Home.jsx'
import PageEditor from './components/PageEditor.jsx'
function App() {
  

  return (
    <>
     <Routes>
        <Route  path='/' element={<Home/>}/>
        <Route  path='/editor/:roomId' element={<PageEditor/>}/>
     </Routes>
    </>
  )
}

export default App
