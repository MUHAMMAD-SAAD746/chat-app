import { useState } from "react";
import DeleteAccountModal from "../DeleteAccountModal/DeleteAccountModal";

import "./DangerZone.css";

function DangerZone() {
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <section className="danger-zone">

            <div className="danger-zone-header">

                <h2>Danger Zone</h2>

                <p>
                    Actions in this section can permanently affect your
                    account and cannot be undone.
                </p>

            </div>


            <div className="danger-zone-card">

                <div className="danger-zone-info">

                    <h3>Delete Account</h3>

                    <p>
                        Permanently delete your account and all associated
                        data.
                    </p>

                </div>

                <button
                    type="button"
                    className="danger-zone-delete"
                    onClick={handleOpenModal}
                >
                    Delete Account
                </button>

            </div>


            {showModal && (
                <DeleteAccountModal
                    onClose={handleCloseModal}
                />
            )}

        </section>
    );
}

export default DangerZone;