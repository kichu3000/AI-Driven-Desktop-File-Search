import "./SearchPage.css"
import { Search } from "lucide-react";
import placeholder from "../assets/placeholder.json"
import { useEffect,useState } from "react";
import { GiButtonFinger } from "react-icons/gi";
import { searchApi } from "../services/searchApi";

import Result from "./Result";



function SearchPage(){
    const[results,setResults] = useState([]); //Used to store the results return by the seachFile function.The final result.
    const[loading,setLoading] = useState(false) //Used to set the loading status.
    const[query,setQuery] = useState(""); //Used to store whatever the user typed in the search box.
    const[currentPlaceholder,setCurrentPlaceholder] = useState(""); //Used for the placeholder.
    const[error,setError] = useState(null) //Used to set the Error states.

    

    function getRandomPlaceholder(){
            const randomIndex = Math.floor(Math.random() * placeholder.placeholders.length);
            console.log(randomIndex);
            setCurrentPlaceholder(placeholder.placeholders[randomIndex]);
    }  

    useEffect(() => {
        getRandomPlaceholder();
    },[]);

    
    const handleSearch = async () => {
        setResults([]);
        setError(false)
        setLoading(true)
        const start = Date.now();
        try{
            const response = await searchApi(query);
            if (!response.success) {
                setError(response.error);
                return;
            }
            const aiQuery = response.data
            console.log(aiQuery);
            const files = await window.electronAPI.searchFiles(aiQuery);
            setResults(files);
            console.log(files);
        }
        catch(error){
            if (error.message === "Failed to fetch") {
                setError("No internet connection. Please check your network and try again.");
            } else {
                setError(error.message);
            }
            setResults([]);
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
                        <button 
                        onClick={handleSearch}
                        disabled={loading}
                        > <Search size={16} />
                        {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
        <Result 
        loading = {loading}
        results = {results}
        error = {error}
        onRetry = {handleSearch}
        />
    </>
    )
}
export default SearchPage;