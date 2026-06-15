import TitleBar from "./components/Titlebar";
import SearchPage from "./components/Searchpage";
import Result from "./components/Result";
import "./index.css"
import NoInternet from "./components/Nointernet";
function App(){
    return(
        <div className="app-container">
            <TitleBar />
            <SearchPage />
            <Result />
        </div>
    )
}

export default App;