import "./ProfileWarning.css";

function ProfileWarning({ onCompleteProfile }) {
    return (
        <div className="profile-warning">
            <div className="profile-warning-icon">
                ⓘ
            </div>

            <div className="profile-warning-content">
                <h4>Complete your profile</h4>

                <p>
                    Add a username so other users can find and add you.
                </p>

                <button onClick={onCompleteProfile}>
                    Complete profile
                </button>
            </div>
        </div>
    );
}

export default ProfileWarning;