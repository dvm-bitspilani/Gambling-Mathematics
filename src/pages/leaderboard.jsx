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
    const { user, updateUser } = useUser();

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

        updateUser({ rank: data.user_rank });
        setLeaderboard(data.leaders.sort((a, b) => a.rank - b.rank));
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
                                rank={leader.rank}
                                title={leader.name}
                                points={leader.points}
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

const LeaderCard = ({ rank, title, points }) => {
    return (
        <div className="leader-card">
            <div className="leader-left">{`${rank}. ${title}`}</div>
            <div className="leader-right">{points}</div>
        </div>
    );
};

export default Leaderboard;
