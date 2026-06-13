import ResultCard from "./Resultcard"
import "./Result.css"

function Result(){


    return (
    <div className="results-container">
        <div className="results-header">
        </div>

        <div className="results-list">
            <ResultCard />
            <ResultCard />
            <ResultCard />
            <ResultCard />
            <ResultCard />
        </div>
    </div>
    );
}
export default Result;