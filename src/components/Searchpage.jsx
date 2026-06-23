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
    const[error,setError] = useState(false)

    

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
            // const aiQuery = await searchApi(
            //     "all pdf from E drive that contains the word semester"
            // );
const aiQuery = { // For testing remove later
    drive : "E",
    includeFileTypes: ['.pdf'],
    excludeFileTypes: [],
    filenameKeywords: [],
    contentKeywords: ['aspire'],

    createdFrom: null,
    createdTo: null,

    modifiedFrom: null,
    modifiedTo: null,

    minSizeMB: null,
    maxSizeMB: null,

};
            if (!aiQuery) {
                console.error("AI query generation failed");
                setError(true)
                return;
            }
            console.log(aiQuery);
            const files = await window.electronAPI.searchFiles(aiQuery);
            setResults(files);
            console.log(files);
        }
        catch(error){
            console.error(error);
            setError(true)
            setResults([]);
        }
        finally{
            setLoading(false)
            const end = Date.now();
            console.log(`time taken : ${end - start} ms`);
        }
        
    }
    useEffect(() => {
        const delay = setTimeout(() => {
            if (query) handleSearch();
        }, 500);

        return () => clearTimeout(delay);
    }, [query]);


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