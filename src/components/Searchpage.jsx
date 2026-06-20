import "./SearchPage.css"
import { Search } from "lucide-react";
import placeholder from "../assets/placeholder.json"
import { useEffect,useState } from "react";
import { GiButtonFinger } from "react-icons/gi";
import { searchApi } from "../services/searchApi";

import Result from "./Result";



function SearchPage(){
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
            const result = await searchApi(
                "give me all the bigger mp3 files"
            );
            //searchFiles(); // for test
            console.log(result);
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