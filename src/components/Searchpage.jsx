import "./SearchPage.css"
import { Search } from "lucide-react";

function SearchPage(){

    let currentPlaceholder = "Life's too fast to remember every filename."

    return(
    <div className="container">
        <div className="heading">
            <div className="main-heading">
                <h1>Find your files.</h1>
            </div>
            <div className="caption">
                <p>Search using natural language</p>
            </div>

            <div className="input-box">
                <Search className="search-icon" size={20} />
                <input type="text" name="input" id="input" placeholder={currentPlaceholder}/>
            </div>

        </div>
    </div>
    )
}
export default SearchPage;