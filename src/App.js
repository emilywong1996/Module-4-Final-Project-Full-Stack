// Project made by Emily Wong, Bay Valley Tech Cohort 229
// nodemon index.cjs for initiating backend server (it should be on a different port from the frontend server)
// npm start for initiating frontend server, using React

import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom'
import './App.css'
import { GraphsPage } from './components/GraphsPage'
import { InputDataPage } from './components/InputDataPage'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'

const NavbarLayout = () => (
  <>
    <nav>
      <ul>
        <li>
          <Link to='/graphs'>Graphs</Link>
        </li>
        <li>
          <Link to='/input-data'>Input Data</Link>
        </li>
      </ul>
    </nav>
    <Outlet />
  </>
);

function App() {
  return (
      <Router>
        <div>
          <Routes>
            <Route element = {<NavbarLayout/>}>
              <Route path='/graphs' element={<GraphsPage/>}/>
              <Route path='/input-data' element={<InputDataPage/>}/>
            </Route>
            <Route path="/" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
          </Routes>
        </div>
      </Router>
  )
}

export default App;
