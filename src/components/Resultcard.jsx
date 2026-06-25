import "./Resultcard.css";

function ResultCard({file}) {
    return (
        <div className="result-card adaptive-hover">
            <div className="card-header">
                <h3 className="file-name">{file.name}</h3>
                <span className="file-size">{(file.size / 1024).toFixed(2)}KB</span>
            </div>

            <p
                className="file-path"
                title={file.path}>
                {file.path}
            </p>

            <div className="button-group">
                <button className="btn btn-primary" onClick={() => window.electronAPI.openFile(file.path)}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="icon"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                    </svg>
                    Open File
                </button>

                <button className="btn btn-secondary" onClick={() => window.electronAPI.showInFolder(file.path)}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="icon"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.75"
                        />
                    </svg>
                    Open Folder
                </button>
            </div>
        </div>
    );
}

export default ResultCard;