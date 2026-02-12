import { ChenRouter, Routes, Route, Card, Button } from 'chen-the-dawnstreak';
import { HashRouter } from 'react-router';
import './App.css';

const isElectron = navigator.userAgent.includes('Electron');

function Home() {
  return (
    <Card style={{ padding: '2rem', maxWidth: 600, margin: '2rem auto' }}>
      <h1>欢迎使用赤刃明霄陈</h1>
      <p>基于 MDUI 和 React 的全栈框架</p>
      <Button variant="filled">开始使用</Button>
    </Card>
  );
}

function App() {
  const Router = isElectron ? HashRouter : ChenRouter;
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
