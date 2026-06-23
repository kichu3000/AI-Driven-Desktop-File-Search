import "./SearchPage.css"
import { Search } from "lucide-react";
import placeholder from "../assets/placeholder.json"
import { useEffect,useState } from "react";
import { GiButtonFinger } from "react-icons/gi";
import { searchApi } from "../services/searchApi";

import Result from "./Result";



function SearchPage(){
    const[results,setResults] = useState([]);
    const[loading,setLoading] = useState(false)
    const[query,setQuery] = useState("");
    const[currentPlaceholder,setCurrentPlaceholder] = useState("");

    

    function getRandomPlaceholder(){
            const randomIndex = Math.floor(Math.random() * placeholder.placeholders.length);
            console.log(randomIndex);
            setCurrentPlaceholder(placeholder.placeholders[randomIndex]);
    }  

    useEffect(() => {
        getRandomPlaceholder();
    },[]);

    
    const handleSearch = async () => {
        
        setLoading(true)
        const start = Date.now();
        try{
            const aiQuery = await searchApi(
                "all pdf from E drive that contains the word semester"
            );
            if (!aiQuery) {
                console.error("AI query generation failed");
                return;
            }
            if (!window?.electronAPI?.searchFiles) {
                console.error("Electron API unavailable. Are you running in Electron?");
                return;
            }
            console.log(aiQuery);
            const files = await window.electronAPI.searchFiles(aiQuery);
            setResults(files);
            console.log(files);
        }
        catch(error){
            console.error(error);
        }
        finally{
            setLoading(false)
            const end = Date.now();
            console.log(`time taken : ${end - start} ms`);
        }
        
    }



    return(
    <>
        <div className="container">
            <div className="heading">
                <div className="main-heading">
                    <h1>Find your files.</h1>
                </div>
                <div className="caption">
                    <p>Search using natural language</p>
                </div>
                <div className="input">
                    <div className="input-box">
                        <Search className="search-icon" size={20} />
                        <input type="text" 
                        name="input" 
                        id="input" 
                        placeholder={currentPlaceholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="button">
                        <button onClick={handleSearch}> <Search size={16} /> Search</button>
                    </div>
                </div>

            </div>
        </div>
        <Result loading={loading} />
    </>
    )
}
export default SearchPage;