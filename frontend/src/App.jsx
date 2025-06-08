import Signup from './pages/Signup';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Feed from './pages/feed';
import Profile from './pages/Profile';
import './App.css';
import {BrowserRouter as Router,Routes, Route} from 'react-router-dom';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Landing/>}/>  
        <Route path='/sign-up' element={<Signup/>}/>
        <Route path='/log-in' element={<Login/>}/>
        <Route path='/feed' element={<Feed/>}/>
        <Route path='/profile' element={<Profile/>}/>
      </Routes>
    </Router>
  )
}

export default App;
