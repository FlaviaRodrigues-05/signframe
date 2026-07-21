import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Practice from './pages/Practice.jsx'
import Translate from './pages/Translate.jsx'
import Live from './pages/Live.jsx'
import Login from './pages/Login.jsx'

export default function App(){
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/translate" element={<Translate />} />
        <Route path="/live" element={<Live />} />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  )
}
