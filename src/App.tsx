import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing';
import Player from './pages/Player';
import PlayerProvider from './store/PlayerProvider';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/player",
    element: <Player />
  }
]);

function App() {
  return <>
    <PlayerProvider>
      <RouterProvider router={router}></RouterProvider>
    </PlayerProvider>
  </>
}

export default App
