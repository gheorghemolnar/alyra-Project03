import { EthProvider } from "./contexts/EthContext";
import Header from "./components/Header";
import Voting from "./components/Voting";
import "./App.css";

function App() {
  return (
    <EthProvider>
      <div id="App">
        <div className="header">
          <Header />
        </div>
        <div className="container">
          <div className="welcome"><h1>Welcome to the WEB3 voting application</h1></div>
          <Voting />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
