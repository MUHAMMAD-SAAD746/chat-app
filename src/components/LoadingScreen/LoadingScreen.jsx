import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import "./LoadingScreen.css";

function LoadingScreen({ text = "Loading..." }) {
    return (
        <div className="loading-screen">

            <div className="loading-container">

                <div className="loading-logo">
                    <IoChatbubbleEllipsesOutline size={50} />
                </div>

                <h1 className="loading-title">
                    Chat App
                </h1>

                <p className="loading-text">
                    {text}
                </p>

                <div className="loading-spinner"></div>

            </div>

        </div>
    );
}

export default LoadingScreen;