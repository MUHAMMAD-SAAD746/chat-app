export const groupReactions = (reactions, userId) => {
    const groups = Object.entries(reactions || {}).reduce(
        (groups, [uid, emoji]) => {
            if (!groups[emoji]) {
                groups[emoji] = {
                    emoji,
                    count: 0,
                    reactedByMe: false,
                };
            }

            groups[emoji].count += 1;

            if (uid === userId) {
                groups[emoji].reactedByMe = true;
            }

            return groups;
        },
        {}
    );

    return Object.values(groups);
};