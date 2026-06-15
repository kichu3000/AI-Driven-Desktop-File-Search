import "./Nointernet.css";

function NoInternet() {
    return (
    <div className="no-internet-container">
        <div className="result-card no-internet-card">
            <h3 className="no-internet-title">
                No internet connection
            </h3>

            <p className="no-internet-text">
                Check your connection and try again.
            </p>

            <div className="button-group">
                <button className="btn btn-primary">
                    Retry
                </button>
            </div>
        </div>
    </div>
    );
}

export default NoInternet;