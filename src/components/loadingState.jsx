import "./loadingState.css"
import { LoaderCircle } from "lucide-react";

function LoadingState(){
    return(
    <div className="loading-card">
        <LoaderCircle className="spinner" />

        <h3>Processing Search</h3>

        <p>Converting query to JSON...</p>
    </div>
    )
}

export default LoadingState;