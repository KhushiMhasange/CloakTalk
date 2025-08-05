import Signup from './pages/Signup';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Feed from './pages/feed';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmark';
import Comment from './components/Comment';
import './App.css';
import {BrowserRouter as Router,Routes, Route} from 'react-router-dom';
import Chats from './components/Chats';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Landing/>}/>  
        <Route path='/sign-up' element={<Signup/>}/>
        <Route path='/log-in' element={<Login/>}/>
        <Route path='/feed' element={<Feed/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/profile/:userId' element={<Profile/>}/>
        <Route path='/comment' element={<Comment/>}/>
        <Route path='/chat' element={<Chats/>}/>
        <Route path='/bookmarks' element={<Bookmarks/>}/>
      </Routes>
    </Router>
  )
}

export default App;
