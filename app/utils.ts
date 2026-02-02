import { Player } from "./types";

export const getTopTackler = (
    tackles: Record<string, number> | undefined,
    players: Array<Player>
): string => {
    if (!tackles || Object.keys(tackles).length === 0) return "None";

    // 1. Find the ID with the maximum value
    const topId = Object.keys(tackles).reduce((a, b) =>
        (tackles[a] > tackles[b] ? a : b)
    );

    const count = tackles[topId];

    // 2. Find the name associated with that ID
    const player = players.find(p => p.id === topId);

    return player ? `${player.name} (${count})` : `Unknown (${count})`;
};











