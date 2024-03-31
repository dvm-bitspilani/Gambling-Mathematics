import React, { useEffect, useState } from "react";
import "../styles/leaderboard.css";
import { useVerifyAuth } from "../utils/useAuth";
import { useTitle } from "../utils/useHead";
import { useUser } from "../contexts/UserContext";
import { getLeaderboard } from "../utils/useFetch";

const Leaderboard = () => {
    // Hooks
    useVerifyAuth();
    useTitle("Leaderboard");
    const { user } = useUser();

    // States
    const [leaderboard, setLeaderboard] = useState([]);

    // Effects
    useEffect(() => {
        fillLeaderboard();
    }, []);

    // Functions
    const fillLeaderboard = async () => {
        const { data, error } = await getLeaderboard(user.token);

        if (error) {
            console.error(error);
            return;
        }

        setLeaderboard(data);
    };

    // JSX
    return (
        <div className="leaderboard-container">
            <div className="leader-heading">
                <div className="leader-title">LEADERBOARD</div>
                <div className="leader-subtitle">
                    {`Your Rank: ${user.rank ?? "N/A"}`}
                </div>
            </div>
            <div className="leader-content">
                <div
                    className="leader-ranks"
                    style={{
                        overflowY: "scroll",
                        height: "calc(100vh - 250px)"
                    }}
                >
                    {leaderboard?.length ? (
                        leaderboard.map(leader => (
                            <LeaderCard
                                key={leader.id}
                                title={leader.name}
                                rank={leader.rank}
                            />
                        ))
                    ) : (
                        <div className="leader-card">
                            <div className="leader-left">No data</div>
                            <div className="leader-right">N/A</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LeaderCard = ({ title, rank }) => {
    return (
        <div className="leader-card">
            <div className="leader-left">{title}</div>
            <div className="leader-right">{rank}</div>
        </div>
    );
};

export default Leaderboard;
