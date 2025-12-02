export function getInitials(name) {
    return name
        .split(" ")           // split into words
        .slice(0, 3)          // take up to the first 3 words
        .map(word => word[0]) // take first letter of each
        .join("");            // join letters together
}