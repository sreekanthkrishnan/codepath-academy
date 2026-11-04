import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApiLessonContent } from "./ApiLessonContent";

const blocks = [
    { type: "introduction", english: "English introduction", malayalam: "മലയാളം ആമുഖം" },
    { type: "analogy", english: "English analogy", malayalam: "മലയാളം ഉപമ" },
    { type: "exercise", english: "English exercise", malayalam: "മലയാളം അഭ്യാസം" },
    { type: "misconception", english: "English misconception", malayalam: "മലയാളം തെറ്റിദ്ധാരണ" },
    { type: "worked-example", english: "A safe unknown block" },
];

describe("ApiLessonContent", () => {
    it("renders known and unknown API block types with draft metadata", () => {
        render(<ApiLessonContent blocks={blocks} lang="en" draft fallback topicCount={2} />);
        expect(screen.getByText("What is it?")).toBeInTheDocument();
        expect(screen.getByText("Everyday analogy")).toBeInTheDocument();
        expect(screen.getByText("Guided exercise")).toBeInTheDocument();
        expect(screen.getByText("Common misconception")).toBeInTheDocument();
        expect(screen.getByText("worked-example")).toBeInTheDocument();
        expect(screen.getByText(/Draft lesson content/)).toBeInTheDocument();
        expect(screen.getByText(/Malayalam translation is unavailable/)).toBeInTheDocument();
        expect(screen.getByText(/2 API topics linked/)).toBeInTheDocument();
    });

    it("selects Malayalam and falls back to the English source when a block is untranslated", () => {
        render(<ApiLessonContent blocks={[blocks[0], { type: "introduction", english: "English fallback" }]} lang="ml" draft={false} fallback topicCount={0} />);
        expect(screen.getByText("മലയാളം ആമുഖം")).toBeInTheDocument();
        expect(screen.getByText("English fallback")).toBeInTheDocument();
        expect(screen.queryByText("English introduction")).not.toBeInTheDocument();
    });

    it("renders no content sections for an empty API response", () => {
        render(<ApiLessonContent blocks={[]} lang="both" draft={false} fallback={false} topicCount={0} />);
        expect(screen.getByTestId("api-lesson-content")).toBeEmptyDOMElement();
    });
});
