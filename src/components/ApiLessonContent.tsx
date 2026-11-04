import type { LessonBlock } from "../api/classroom";

type Language = "en" | "ml" | "both";

function blockText(block: LessonBlock, lang: Language) {
    if (lang === "ml") return block.malayalam || block.english || "";
    if (lang === "both") {
        return `${block.english || ""}${block.malayalam ? `\n${block.malayalam}` : ""}`;
    }
    return block.english || block.malayalam || "";
}

export function ApiLessonContent({
    blocks,
    lang,
    draft,
    fallback,
    topicCount,
}: {
    blocks: LessonBlock[];
    lang: Language;
    draft: boolean;
    fallback: boolean;
    topicCount: number;
}) {
    return (
        <div className="content" data-testid="api-lesson-content">
            {draft && <p className="lead">Draft lesson content · visible in this development environment.</p>}
            {fallback && <p className="lead">Malayalam translation is unavailable; showing the English source.</p>}
            {topicCount > 0 && <p className="eyebrow">{topicCount} API topic{topicCount === 1 ? "" : "s"} linked to this class</p>}
            {blocks.map((block, index) => {
                const value = blockText(block, lang);
                if (!value) return null;
                if (block.type === "analogy" || block.type === "exercise") {
                    return <section key={index} className={block.type === "exercise" ? "exercise" : "analogy"}><b>{block.type === "exercise" ? "✎" : "☁"}</b><span><strong>{block.type === "exercise" ? "Guided exercise" : "Everyday analogy"}</strong><p>{value}</p></span></section>;
                }
                if (block.type === "misconception") return <section key={index}><h2>Common misconception</h2><p>{value}</p></section>;
                if (block.type === "introduction") return <section key={index}><h2>What is it?</h2><p>{value}</p></section>;
                return <section key={index}><h2>{block.type}</h2><p>{value}</p></section>;
            })}
        </div>
    );
}
