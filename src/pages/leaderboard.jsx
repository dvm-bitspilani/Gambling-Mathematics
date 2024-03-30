import React, { useState } from "react";
import "../styles/leader.css";
import { useVerifyAuth } from "../utils/useAuth";
import { useTitle } from "../utils/useHead";
import { useUser } from "../contexts/UserContext";

const Leaderboard = () => {
    // Hooks
    useVerifyAuth();
    useTitle("Leaderboard");
    const { user } = useUser();

    // States
    const [leaderboard, setLeaderboard] = useState([
        { id: 1, name: "Akshun Jain", rank: 1 },
        { id: 2, name: "Akshun Jain", rank: 2 },
        { id: 3, name: "Akshun Jain", rank: 3 },
        { id: 4, name: "Akshun Jain", rank: 4 },
        { id: 5, name: "Akshun Jain", rank: 5 },
        { id: 6, name: "Akshun Jain", rank: 6 },
        { id: 7, name: "Akshun Jain", rank: 7 },
        { id: 8, name: "Akshun Jain", rank: 8 },
        { id: 9, name: "Akshun Jain", rank: 9 },
        { id: 10, name: "Akshun Jain", rank: 10 }
    ]);

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
                {/* <div className="leader-pictures">
                    {positions.map(position => (
                        <div
                            key={position}
                            className={`leader-${position.toLowerCase()}`}
                        />
                    ))}
                </div> */}
                <div
                    className="leader-ranks"
                    style={{
                        overflowY: "scroll",
                        height: "calc(100vh - 250px)"
                    }}
                >
                    {leaderboard.map(leader => (
                        <LeaderCard
                            key={leader.id}
                            title={leader.name}
                            rank={leader.rank}
                        />
                    ))}
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
