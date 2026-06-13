import TitleBar from "./components/Titlebar";
import SearchPage from "./components/Searchpage";
import Result from "./components/Result";
import "./index.css"
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