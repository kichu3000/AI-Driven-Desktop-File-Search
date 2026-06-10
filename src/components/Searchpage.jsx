import "./SearchPage.css"

function SearchPage(){
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
                <input type="text" name="input" id="input" />
            </div>

        </div>
    </div>
    )
}
export default SearchPage;