import "./Nointernet.css";

function NoInternet({onRetry}) {
    return (
    <div className="no-internet-container">
        <div className="result-card no-internet-card">
            <h3 className="no-internet-title">
                Search failed.
            </h3>

            <p className="no-internet-text">
                Please check your internet connection or try again later. The AI service may be temporarily unavailable.
            </p>

            <div className="button-group">
                <button className="btn btn-primary"
                        onClick={onRetry}
                    >
                    Retry
                </button>
            </div>
        </div>
    </div>
    );
}

export default NoInternet;