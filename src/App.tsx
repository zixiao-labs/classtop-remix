import { ChenRouter, Routes, Route } from 'chen-the-dawnstreak';
import './App.css';

function Home() {
  return (
    <mdui-card style={{ padding: '2rem', maxWidth: 600, margin: '2rem auto' }}>
      <h1>欢迎使用赤刃明霄陈</h1>
      <p>基于 MDUI 和 React 的全栈框架</p>
      <mdui-button variant="filled">开始使用</mdui-button>
    </mdui-card>
  );
}

function App() {
  return (
    <ChenRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </ChenRouter>
  );
}

export default App;
