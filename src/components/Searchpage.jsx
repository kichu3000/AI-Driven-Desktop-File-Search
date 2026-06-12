import "./SearchPage.css"
import { Search } from "lucide-react";
import placeholder from "../assets/placeholder.json"
import { useEffect,useState } from "react";
import { GiButtonFinger } from "react-icons/gi";

function SearchPage(){

    const[currentPlaceholder,setCurrentPlaceholder] = useState("");

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * placeholder.placeholders.length);
        console.log(randomIndex);
        setCurrentPlaceholder(placeholder.placeholders[randomIndex]);
    },[]);
    
    

    return(
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
                    <input type="text" name="input" id="input" placeholder={currentPlaceholder}/>
                </div>
                <div className="button">
                    <button type="submit"> <Search size={16} /> Search</button>
                </div>
            </div>

        </div>
    </div>
    )
}
export default SearchPage;