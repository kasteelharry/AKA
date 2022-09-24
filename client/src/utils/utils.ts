export const cls = (input: any) =>
    input
        .replace(/\s+/gm, " ")
        .split(" ")
        .filter((cond: any) => typeof cond === "string")
        .join(" ")
        .trim();