import './App.css';
import './app.scss';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as  Router, Routes, Link, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";
import Home from './pages/home';
import LearnMore from './pages/LearnMore';
import { Provider } from 'react-redux';
import store from './store/store';
import { $CombinedState } from 'redux';
import { API } from 'aws-amplify';

function App() {

  const [myMessage, setMyMessage] = useState('');

  useEffect(() => {
    fetchWoohoos();
  }, []);

  async function fetchWoohoos() {
    
    API
    .get("civAPI", "/county", {})
    .then(response => {
      setMyMessage(response.success)
      // console.log(`Response: ${response}`)
    })
    .catch(error => {
      console.log(error.response);
    });
  }

  // console.log(`REACT ENV: ${JSON.stringify(process.env)}`);

  const AppRef = useRef();
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth,
    height: window.innerHeight
  });
  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }    
    window.addEventListener('resize', handleResize)
    controlMainWindowSize();
  }, []);

  useEffect(  () => {
    controlMainWindowSize();
  }, [dimensions]);

  const controlMainWindowSize = () => {
    
    let width = dimensions.width;
    let childDOM = document.querySelector('.App >div:first-child');
    if(width<650){
      let zoomScale = AppRef.current.clientWidth /650.0;
      let marginTop = -childDOM.clientHeight*(1-zoomScale)/2.0;
      childDOM.style.transform=`scale(${zoomScale})`;
      childDOM.style.marginTop=`${marginTop}px`;
    } else {
      childDOM.style.transform='scale(1)';
    }
  }

  return (
    <Provider store={store}>
      <div className="App" id='App' ref={AppRef} >
        <Router>
          <Routes>
            <Route path="/" element={<Home reRender={controlMainWindowSize}/>} />
            <Route path="/learnmore" element={<LearnMore  reRender={controlMainWindowSize}/>} />
          </Routes>
        </Router> 
       
      </div>
       {/* <p>API message: {myMessage}</p> */}
      <ToastContainer autoClose={2000} />
    </Provider>  
  );
}

export default App;
