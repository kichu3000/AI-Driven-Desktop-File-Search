import TitleBar from "./components/Titlebar";
import SearchPage from "./components/Searchpage";
import ResultCard from "./components/Resultcard";
function App(){
    return(
        <div>
            <TitleBar/>
            <SearchPage/>
            <ResultCard />
        </div>
    )
}

export default App;