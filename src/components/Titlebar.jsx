import "./Titlebar.css"
import { FiSearch } from "react-icons/fi";

function TitleBar(){
    const appName = "File Search"
    return(
        <div className="title-bar">
            <div className="logo">
                <FiSearch/>
            </div>
            <div className="title">
                <h3>{appName}</h3>
            </div>
        </div>
    );
}

export default TitleBar;