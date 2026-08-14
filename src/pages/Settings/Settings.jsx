import { useNavigate } from "react-router-dom";

import ProfileSettings from "../../components/settings/ProfileSettings/ProfileSettings";

import "./Settings.css";

function Settings() {
    const navigate = useNavigate();

    return (
        <div className="settings-page">

            <div className="settings-topbar">

                <button
                    className="settings-back-button"
                    onClick={() => navigate("/chat")}
                >
                    ←
                </button>

                <h1>Settings</h1>

            </div>


            <div className="settings-content">

                <ProfileSettings />

            </div>

        </div>
    );
}

export default Settings;