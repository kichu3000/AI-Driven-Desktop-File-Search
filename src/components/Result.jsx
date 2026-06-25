import ResultCard from "./Resultcard"
import "./Result.css"
import NoInternet from "./Nointernet";
import LoadingState from "./loadingState";

function Result({ loading , results , error , onRetry }) {    

    if (loading) {
        return (
            <div className="results-container">
                <LoadingState />
            </div>
        );
    }

    if (error) {
        return (
            <div className="results-container">
                <NoInternet
                    message={error}
                    onRetry={onRetry}
                />
            </div>
        );
    }

    return (
        <div className="results-container">

            <div className="results-header">
                <p>{results.length} Results found.</p>
            </div>

            <div className="results-list">
                {results.map((file) => (
                    <ResultCard
                        key={file.path}
                        file={file}
                    />
                ))}
            </div>

        </div>
    );
}

export default Result;