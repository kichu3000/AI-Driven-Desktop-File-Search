import ResultCard from "./Resultcard"
import "./Result.css"
import NoInternet from "./Nointernet";
import LoadingState from "./loadingState";

function Result({ loading }) {
    return (
        <div className="results-container">

            {loading ? (
                <LoadingState />
            ) : (
                <>
                    <div className="results-header">
                        <p>5 Results found.</p>
                    </div>

                    <div className="results-list">
                        <ResultCard />
                        <ResultCard />
                        <ResultCard />
                        <ResultCard />
                        <ResultCard />
                    </div>

                    <NoInternet />
                </>
            )}

        </div>
    );
}

export default Result;