import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
    downloadLegacyLearningBackup,
    readLegacy,
    writeLegacy,
} from "./storage/legacyLearningData";
import { useCurriculum } from "./hooks/useCurriculum";
import { useClassroomContent } from "./hooks/useClassroomContent";
import { ApiLessonContent } from "./components/ApiLessonContent";
import { AuthPanel } from "./components/AuthPanel";
import { useAuth } from "./hooks/useAuth";
import "./styles.css";

type Screen =
    | "home"
    | "roadmap"
    | "classroom"
    | "notes"
    | "practice"
    | "projects";
type Lang = "en" | "ml" | "both";
type Lesson = {
    week: number;
    slot: number;
    phase: string;
    title: string;
    ml: string;
};
const plans: [string, string[]][] = [
    [
        "Foundation · Introduction to Computers",
        [
            "What Is a Computer and How Does It Work?",
            "Hardware, Software, CPU, RAM and Storage",
            "Operating Systems, Files and Folders",
            "Installing and Using Developer Tools",
            "Lab: Set Up a Development Environment",
        ],
    ],
    [
        "Foundation · Internet & Software",
        [
            "What Is Software Development?",
            "How the Internet Works",
            "Browsers, Websites, Clients and Servers",
            "Introduction to HTML, CSS and HTTP",
            "Lab: Create and Open a Simple Webpage",
        ],
    ],
    [
        "Foundation · Computational Thinking",
        [
            "What Is an Algorithm?",
            "Logic, Conditions and Decision Making",
            "Flowcharts and Pseudocode",
            "Binary Numbers, Data and Information",
            "Lab: Solve Problems Without a Programming Language",
        ],
    ],
    [
        "Foundation · Developer Foundations",
        [
            "Introduction to the Terminal",
            "Files, Paths and Basic Shell Commands",
            "Git and Version Control",
            "GitHub, Repositories and Commits",
            "Lab: Publish a First Project",
        ],
    ],
    [
        "Month 1 · Core Java",
        [
            "Java, JDK, JRE and JVM",
            "Writing and Running Java Programs",
            "Variables, Literals and Data Types",
            "Operators and Expressions",
            "Lab: Build a Basic Calculator",
        ],
    ],
    [
        "Month 1 · Core Java",
        [
            "Boolean Logic and Conditions",
            "If-Else and Switch Statements",
            "For, While and Do-While Loops",
            "Nested Loops and Problem Solving",
            "Lab: Number and Pattern Problems",
        ],
    ],
    [
        "Month 1 · Core Java",
        [
            "Methods, Parameters and Return Values",
            "Scope, Stack Frames and Call Flow",
            "Arrays and Strings",
            "Recursion Fundamentals",
            "Lab: Build a Student Marks Calculator",
        ],
    ],
    [
        "Month 1 · OOP",
        [
            "Classes and Objects",
            "Constructors and Encapsulation",
            "Inheritance and Polymorphism",
            "Interfaces and Abstraction",
            "Lab: Object-Oriented Banking Application",
        ],
    ],
    [
        "Month 2 · Advanced Java",
        [
            "Object Identity, Equality and Hashing",
            "Immutability, Records and Enums",
            "Exceptions and Error Handling",
            "Generics and Type Safety",
            "Lab: Refactor the Banking Application",
        ],
    ],
    [
        "Month 2 · Collections",
        [
            "Lists and ArrayList",
            "Sets and HashSet",
            "Maps and HashMap",
            "Collections Complexity and Internal Behavior",
            "Lab: Build a Library Management System",
        ],
    ],
    [
        "Month 2 · Modern Java",
        [
            "Functional Interfaces and Lambdas",
            "Streams and Collectors",
            "Optional and Method References",
            "Files, Serialization and Date-Time APIs",
            "Lab: Data Processing Application",
        ],
    ],
    [
        "Month 2 · JVM and Concurrency",
        [
            "JVM Architecture, Stack and Heap",
            "Garbage Collection and Memory",
            "Threads and Synchronization",
            "Executors, Futures and Virtual Threads",
            "Lab: Concurrent Transaction Processor",
        ],
    ],
    [
        "Month 3 · Networking",
        [
            "Network Models and TCP/IP",
            "DNS, IP Addresses and Ports",
            "HTTP and HTTPS",
            "REST APIs and Request Lifecycles",
            "Lab: Inspect Real API Requests",
        ],
    ],
    [
        "Month 3 · Relational Databases",
        [
            "Introduction to Databases and RDBMS",
            "PostgreSQL Installation and Data Types",
            "Tables, Keys, Constraints and Relationships",
            "SQL SELECT, INSERT, UPDATE and DELETE",
            "Lab: Design a Library Database",
        ],
    ],
    [
        "Month 3 · Advanced SQL",
        [
            "Joins and Subqueries",
            "Aggregation and Grouping",
            "CTEs and Window Functions",
            "Indexes and Query Execution Plans",
            "Lab: SQL Reporting Problems",
        ],
    ],
    [
        "Month 3 · Database Internals",
        [
            "Normalization and Data Modeling",
            "Transactions and ACID",
            "Isolation Levels and Locking",
            "JDBC and Connection Pooling",
            "Lab: Concurrent Database Transactions",
        ],
    ],
    [
        "Month 4 · Spring Boot",
        [
            "Spring Framework Architecture",
            "Dependency Injection and IoC",
            "Beans, Configuration and Lifecycle",
            "Spring Boot Auto-Configuration",
            "Lab: Create a Spring Boot Application",
        ],
    ],
    [
        "Month 4 · REST APIs",
        [
            "Controllers and Request Mapping",
            "Service Layers and DTOs",
            "Validation and Exception Handling",
            "Pagination, Filtering and API Contracts",
            "Lab: Create a REST API",
        ],
    ],
    [
        "Month 4 · Persistence",
        [
            "Spring Data JPA",
            "Hibernate and Entity Mapping",
            "Relationships and Fetch Strategies",
            "N+1 Queries and Transaction Management",
            "Lab: PostgreSQL-Backed REST API",
        ],
    ],
    [
        "Month 4 · Professional APIs",
        [
            "Flyway Database Migrations",
            "API Documentation with OpenAPI",
            "Logging and Configuration",
            "API Testing and Error Design",
            "Lab: Event Management Backend",
        ],
    ],
    [
        "Month 5 · Authentication",
        [
            "Authentication Fundamentals",
            "Spring Security Architecture",
            "Sessions, JWT and OAuth2 Concepts",
            "Role-Based Access Control",
            "Lab: Secure an API",
        ],
    ],
    [
        "Month 5 · Security",
        [
            "OWASP Fundamentals",
            "SQL Injection, XSS, CSRF and CORS",
            "Password Hashing and Secrets",
            "Multi-Tenant Security and Data Isolation",
            "Lab: Security Testing",
        ],
    ],
    [
        "Month 5 · Automated Testing",
        [
            "Unit Testing with JUnit",
            "Mocking with Mockito",
            "Integration Testing with Testcontainers",
            "Test Design, Fixtures and Coverage",
            "Lab: Test the Booking Backend",
        ],
    ],
    [
        "Month 5 · Maintainable Design",
        [
            "SOLID Principles",
            "Clean Architecture and Separation of Concerns",
            "Design Patterns",
            "Modular Monoliths and API Boundaries",
            "Lab: Refactor a Backend Module",
        ],
    ],
    [
        "Month 6 · Caching",
        [
            "Why Caching Is Needed",
            "Redis Fundamentals",
            "Cache-Aside and Cache Strategies",
            "Expiration, Eviction and Invalidation",
            "Lab: Add Redis to Spring Boot",
        ],
    ],
    [
        "Month 6 · Messaging",
        [
            "Synchronous vs Asynchronous Communication",
            "Kafka Architecture",
            "Producers, Consumers and Partitions",
            "Delivery Guarantees and Error Recovery",
            "Lab: Event-Driven Notifications",
        ],
    ],
    [
        "Month 6 · Correctness",
        [
            "Race Conditions in Backend Systems",
            "Optimistic and Pessimistic Locking",
            "Idempotency and Deduplication",
            "Transactional Outbox and Reliable Events",
            "Lab: Prevent Ticket Overselling",
        ],
    ],
    [
        "Month 6 · Reliability",
        [
            "Latency, Throughput and Bottlenecks",
            "Load Testing Fundamentals",
            "Timeouts, Retries and Circuit Breakers",
            "Rate Limiting and Failure Handling",
            "Lab: Benchmark the Booking Platform",
        ],
    ],
    [
        "Month 7 · Algorithms",
        [
            "Time and Space Complexity",
            "Arrays, Hashing and Sliding Windows",
            "Sorting and Binary Search",
            "Recursion and Backtracking",
            "Lab: Timed DSA Assessment",
        ],
    ],
    [
        "Month 7 · Data Structures",
        [
            "Linked Lists, Stacks and Queues",
            "Trees and Binary Search Trees",
            "Heaps and Priority Queues",
            "Graphs, BFS and DFS",
            "Lab: Data Structure Problems",
        ],
    ],
    [
        "Month 7 · Algorithms & LLD",
        [
            "Dynamic Programming",
            "Greedy Algorithms",
            "Object Modeling and UML",
            "Factory, Strategy, Observer and State Patterns",
            "Lab: Parking Lot System Design",
        ],
    ],
    [
        "Month 7 · System Design",
        [
            "Requirement Analysis and Capacity Estimation",
            "Load Balancing and Horizontal Scaling",
            "Database Replication and Partitioning",
            "Consistency, Availability and Distributed Systems",
            "Lab: Design a Ticket Booking System",
        ],
    ],
    [
        "Month 8 · Linux & Containers",
        [
            "Linux Fundamentals",
            "Processes, Permissions and Networking",
            "Docker Images and Containers",
            "Docker Compose and Container Networks",
            "Lab: Containerize Spring Boot",
        ],
    ],
    [
        "Month 8 · AWS",
        [
            "Cloud Architecture and Shared Responsibility",
            "AWS IAM and Network Fundamentals",
            "EC2, S3 and RDS",
            "Deployment, Security and Cost Management",
            "Lab: Deploy the Backend",
        ],
    ],
    [
        "Month 8 · Continuous Delivery",
        [
            "CI/CD Concepts",
            "GitHub Actions",
            "Automated Quality Checks",
            "Deployment Strategies and Rollbacks",
            "Lab: Automated Deployment Pipeline",
        ],
    ],
    [
        "Month 8 · Production Engineering",
        [
            "Structured Logging",
            "Application Metrics",
            "Distributed Tracing",
            "Monitoring, Alerting and Incident Response",
            "Lab: Diagnose a Production-Like Failure",
        ],
    ],
    [
        "Month 9 · Capstone",
        [
            "Complete Backend Architecture",
            "API Integration with React",
            "Security and Data Integrity Review",
            "Automated Testing and Performance Review",
            "Capstone Milestone Review",
        ],
    ],
    [
        "Month 9 · Engineering Depth",
        [
            "Advanced Java Revision",
            "JVM and Concurrency Interview Questions",
            "Spring Boot and SQL Interview Questions",
            "Distributed Systems Design Review",
            "Timed Technical Mock Interview",
        ],
    ],
    [
        "Month 9 · Interviews",
        [
            "DSA Revision",
            "Advanced Problem-Solving Workshop",
            "Low-Level Design Mock Interview",
            "High-Level Design Mock Interview",
            "Full Technical Interview Simulation",
        ],
    ],
    [
        "Month 9 · Career Preparation",
        [
            "Product-Company Resume Preparation",
            "Portfolio and GitHub Review",
            "Behavioral and Leadership Interviews",
            "Interview Performance Analysis",
            "Final Assessment and Individual Growth Plan",
        ],
    ],
];
const mal: Record<string, string> = {
    "What Is a Computer and How Does It Work?":
        "കമ്പ്യൂട്ടർ എന്താണ്, അത് എങ്ങനെ പ്രവർത്തിക്കുന്നു?",
    "Hardware, Software, CPU, RAM and Storage":
        "ഹാർഡ്‌വെയർ, സോഫ്റ്റ്‌വെയർ, CPU, RAM, സ്റ്റോറേജ്",
    "Operating Systems, Files and Folders":
        "ഓപ്പറേറ്റിംഗ് സിസ്റ്റം, ഫയലുകൾ, ഫോൾഡറുകൾ",
    "Installing and Using Developer Tools":
        "ഡെവലപ്പർ ടൂളുകൾ ഇൻസ്റ്റാൾ ചെയ്യുകയും ഉപയോഗിക്കുകയും ചെയ്യുക",
    "Lab: Set Up a Development Environment":
        "ലാബ്: ഡെവലപ്‌മെന്റ് പരിസരം സജ്ജമാക്കുക",
    "What Is Software Development?": "സോഫ്റ്റ്‌വെയർ ഡെവലപ്‌മെന്റ് എന്താണ്?",
    "How the Internet Works": "ഇന്റർനെറ്റ് എങ്ങനെ പ്രവർത്തിക്കുന്നു?",
    "Browsers, Websites, Clients and Servers":
        "ബ്രൗസറുകൾ, വെബ്സൈറ്റുകൾ, ക്ലയന്റുകൾ, സെർവറുകൾ",
};
const lessons: Lesson[] = plans.flatMap(([phase, ts], wi) =>
    ts.map((title, si) => ({
        week: wi + 1,
        slot: si + 1,
        phase,
        title,
        ml: mal[title] || "മലയാളം വിവർത്തനം ആവശ്യമാണ്",
    })),
);
function App() {
    const [screen, setScreen] = useState<Screen>("home"),
        [lang, setLang] = useState<Lang>(() =>
            readLegacy<Lang>("language", "both"),
        ),
        [active, setActive] = useState<Lesson>(lessons[0]),
        [done, setDone] = useState<number[]>(() =>
            readLegacy<number[]>("progress", []),
        ),
        [notes, setNotes] = useState<Record<string, string>>(() =>
            readLegacy<Record<string, string>>("notes", {}),
        ),
        [mode, setMode] = useState<"beginner" | "deep">("beginner"),
        [toast, setToast] = useState(""),
        [authOpen, setAuthOpen] = useState(false);
    const auth = useAuth();
    useEffect(() => writeLegacy("language", lang), [lang]);
    useEffect(() => writeLegacy("progress", done), [done]);
    useEffect(() => writeLegacy("notes", notes), [notes]);
    const pct = Math.round(done.length / 2);
    const say = (s: string) => {
        setToast(s);
        setTimeout(() => setToast(""), 2500);
    };
    const open = (l: Lesson) => {
        setActive(l);
        setScreen("classroom");
        scrollTo({ top: 0, behavior: "smooth" });
    };
    const mark = () => {
        const id = active.week * 10 + active.slot;
        setDone((current) =>
            current.includes(id)
                ? current.filter((x) => x !== id)
                : [...current, id],
        );
        say(
            done.includes(id)
                ? "Class moved back to review."
                : "Progress saved. Great work.",
        );
    };
    return (
        <div className="shell">
            <aside>
                <div className="brand">
                    <b>&lt;/&gt;</b>
                    <span>
                        codepath<em>academy</em>
                    </span>
                </div>
                <small className="label">YOUR WORKSPACE</small>
                {(
                    [
                        ["home", "⌂", "Dashboard"],
                        ["roadmap", "⌘", "Learning path"],
                        ["classroom", "▤", "Classroom"],
                        ["notes", "✎", "Notes"],
                        ["practice", "◈", "Practice"],
                        ["projects", "◫", "Projects"],
                    ] as [Screen, string, string][]
                ).map(([id, icon, name]) => (
                    <button
                        className={screen === id ? "on" : ""}
                        key={id}
                        onClick={() => setScreen(id)}
                    >
                        <i>{icon}</i>
                        {name}
                    </button>
                ))}
                <div className="side-foot">
                    <div className="plan">
                        <span>✦</span>
                        <b>Need a study plan?</b>
                        <p>Set pace and review days.</p>
                        <button
                            onClick={() =>
                                say(
                                    "Planner preferences saved for Asia/Kolkata.",
                                )
                            }
                        >
                            Open planner →
                        </button>
                    </div>
                    <div className="user">
                        <b>AS</b>
                        <span>
                            Anu S.<small>Backend track</small>
                        </span>
                        <i>•••</i>
                    </div>
                </div>
            </aside>
            <main>
                <header>
                    <button className="mobile">&lt;/&gt;</button>
                    <div className="crumb">
                        Learning /{" "}
                        <b>
                            {screen === "classroom"
                                ? `Week ${active.week}`
                                : screen}
                        </b>
                    </div>
                    <div>
                        <button
                            className="lang"
                            onClick={() =>
                                setLang(
                                    lang === "en"
                                        ? "ml"
                                        : lang === "ml"
                                            ? "both"
                                            : "en",
                                )
                            }
                        >
                            {lang === "both"
                                ? "EN | മ"
                                : lang === "en"
                                    ? "EN"
                                    : "മ"}
                        </button>
                        <button className="streak">⚡ 4 day streak</button>
                        {auth.loading ? <span className="auth-status">Checking account…</span> : auth.user ? <button className="auth-button" onClick={() => void auth.logout().catch(() => say("We could not sign you out. Please try again."))}>Sign out · {auth.user.displayName}</button> : <button className="auth-button" onClick={() => setAuthOpen(true)}>Sign in</button>}
                    </div>
                </header>
                {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} onLogin={auth.login} onRegister={auth.register} />}
                {screen === "home" && (
                    <Home
                        pct={pct}
                        done={done.length}
                        next={() => setScreen("classroom")}
                        open={open}
                    />
                )}{" "}
                {screen === "roadmap" && <Roadmap done={done} open={open} />}{" "}
                {screen === "classroom" && (
                    <Classroom
                        active={active}
                        lang={lang}
                        mode={mode}
                        setMode={setMode}
                        done={done}
                        notes={notes}
                        setNotes={setNotes}
                        open={open}
                        mark={mark}
                    />
                )}{" "}
                {screen === "notes" && (
                    <Notes
                        active={active}
                        notes={notes}
                        setNotes={setNotes}
                        say={say}
                    />
                )}{" "}
                {screen === "practice" && <Practice say={say} />}{" "}
                {screen === "projects" && <Projects say={say} />}
            </main>
            {toast && <div className="toast">✓ {toast}</div>}
        </div>
    );
}

function Home({
    pct,
    done,
    next,
    open,
}: {
    pct: number;
    done: number;
    next: () => void;
    open: (l: Lesson) => void;
}) {
    return (
        <div className="page">
            <section className="hero">
                <div>
                    <p className="eyebrow">TUESDAY, NOVEMBER 4</p>
                    <h1>
                        Good evening, Anu <em>✦</em>
                    </h1>
                    <p>
                        Small, focused sessions turn curiosity into engineering
                        confidence.
                    </p>
                    <button className="primary" onClick={next}>
                        Continue learning <b>→</b>
                    </button>
                </div>
                <div className="orbit">
                    <b>
                        {pct}%<small>course progress</small>
                    </b>
                </div>
            </section>
            <section className="stats">
                <Stat x={`${done}/200`} t="classes completed" />
                <Stat x="4.2h" t="this week" c="orange" />
                <Stat x="82%" t="quiz accuracy" c="violet" />
                <Stat x="3" t="reviews due" c="green" />
            </section>
            <section className="home-grid">
                <div className="card next">
                    <span className="chip">UP NEXT</span>
                    <p>FOUNDATION · WEEK 1 · CLASS 1</p>
                    <h2>
                        What is a computer
                        <br />
                        and how does it work?
                    </h2>
                    <small>
                        Build a concrete mental model before we ask a computer
                        to do anything.
                    </small>
                    <div>◷ 35 min　 ◉ Beginner</div>
                    <button onClick={() => open(lessons[0])}>
                        Start class →
                    </button>
                </div>
                <div className="card agenda">
                    <h3>
                        This week <button>View schedule</button>
                    </h3>
                    {lessons.slice(0, 5).map((l, i) => (
                        <button
                            className="agenda-row"
                            onClick={() => open(l)}
                            key={l.title}
                        >
                            <span>
                                {["MON", "TUE", "WED", "THU", "FRI"][i]}
                                <b>{i + 3}</b>
                            </span>
                            <p>
                                {l.title}
                                <small>
                                    {i === 4 ? "Guided lab" : "Concept class"} ·{" "}
                                    {i === 4 ? "60" : "35"} min
                                </small>
                            </p>
                            <i>{i === 0 ? "→" : "○"}</i>
                        </button>
                    ))}
                </div>
                <div className="card review">
                    <i>↻</i>
                    <p className="eyebrow">SPACED REVISION</p>
                    <h3>Keep it fresh</h3>
                    <small>3 concepts are ready for a quick recall.</small>
                    <button onClick={() => open(lessons[1])}>
                        Review now →
                    </button>
                </div>
            </section>
            <div className="section-title">
                <div>
                    <p className="eyebrow">YOUR PATH</p>
                    <h2>Where you’re headed</h2>
                </div>
                <button onClick={next}>Explore roadmap →</button>
            </div>
            <div className="phases">
                {[
                    "Foundation",
                    "Core Java",
                    "Databases",
                    "Spring Boot",
                    "Systems",
                    "Interviews",
                ].map((x, i) => (
                    <button
                        onClick={next}
                        className={i === 0 ? "phase-on" : ""}
                        key={x}
                    >
                        <small>0{i + 1}</small>
                        <b>{x}</b>
                        <span>
                            {i === 0
                                ? "In progress"
                                : i === 1
                                    ? "Next up"
                                    : "Ahead"}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
function Stat({ x, t, c = "" }: { x: string; t: string; c?: string }) {
    return (
        <div className={`stat ${c}`}>
            <b>{x}</b>
            <small>{t}</small>
        </div>
    );
}
function Roadmap({
    done,
    open,
}: {
    done: number[];
    open: (l: Lesson) => void;
}) {
    const [w, setW] = useState(0),
        remote = useCurriculum();
    const entries =
        remote.data?.weeks.map(
            (week) =>
                [
                    week.title.english,
                    week.classes.map((clazz) => clazz.title.english),
                ] as [string, string[]],
        ) ?? plans;
    return (
        <div className="page">
            <p className="eyebrow">40-WEEK BACKEND ENGINEERING PROGRAM</p>
            <h1>Your learning path</h1>
            <p className="intro">
                A structured route from computer fundamentals to production
                systems. Every week has five planned sessions.
            </p>
            <p className="intro">
                {remote.loading
                    ? "Loading database curriculum…"
                    : remote.error
                        ? "API unavailable — showing the checked-in curriculum fallback."
                        : "✓ Database curriculum connected"}
            </p>
            <div className="tabs">
                <button>Timeline view</button>
                <span>Tree view</span>
                <i>200 classes · 9 months</i>
            </div>
            <div className="weeks">
                {entries.map(([phase, titles], i) => (
                    <article
                        className={w === i ? "week expanded" : "week"}
                        key={i}
                    >
                        <button
                            className="week-head"
                            onClick={() => setW(w === i ? -1 : i)}
                        >
                            <b>{String(i + 1).padStart(2, "0")}</b>
                            <span>
                                <small>{phase}</small>
                                <strong>
                                    Week {i + 1}: {phase.split(" · ")[1]}
                                </strong>
                            </span>
                            <em>
                                {
                                    titles.filter((_, s) =>
                                        done.includes((i + 1) * 10 + s + 1),
                                    ).length
                                }
                                /5
                                <br />
                                <small>complete</small>
                            </em>
                            <i>{w === i ? "−" : "+"}</i>
                        </button>
                        {w === i && (
                            <div className="class-list">
                                {titles.map((title, s) => {
                                    const l = lessons[i * 5 + s],
                                        d = done.includes((i + 1) * 10 + s + 1);
                                    return (
                                        <button
                                            onClick={() => open(l)}
                                            key={title}
                                        >
                                            <b className={d ? "done" : ""}>
                                                {d ? "✓" : s + 1}
                                            </b>
                                            <span>
                                                {title}
                                                <small>
                                                    {l.ml.includes("ആവശ്യമാണ്")
                                                        ? "English published · Malayalam translation needed"
                                                        : l.ml}
                                                </small>
                                            </span>
                                            <i>→</i>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </div>
    );
}
function Classroom({
    active,
    lang,
    mode,
    setMode,
    done,
    notes,
    setNotes,
    open,
    mark,
}: {
    active: Lesson;
    lang: Lang;
    mode: "beginner" | "deep";
    setMode: (x: "beginner" | "deep") => void;
    done: number[];
    notes: Record<string, string>;
    setNotes: (x: Record<string, string>) => void;
    open: (x: Lesson) => void;
    mark: () => void;
}) {
    const key = `${active.week}-${active.slot}`,
        week = lessons.filter((x) => x.week === active.week),
        completed = done.includes(active.week * 10 + active.slot),
        english = lang !== "ml",
        malayalam = lang !== "en",
        translated = !active.ml.includes("ആവശ്യമാണ്"),
        remote = useClassroomContent(
            `CPA-W${String(active.week).padStart(2, "0")}-C${String(active.slot).padStart(2, "0")}`,
            lang === "ml" ? "ml-IN" : lang === "both" ? "both" : "en-IN",
        );
    const [answer, setAnswer] = useState<number | null>(null);
    return (
        <div className="classroom">
            <nav className="lesson-nav">
                <p className="eyebrow">{active.phase}</p>
                <h3>Week {active.week}</h3>
                {week.map((x) => (
                    <button
                        className={
                            x.slot === active.slot ? "active-lesson" : ""
                        }
                        onClick={() => open(x)}
                        key={x.slot}
                    >
                        <i>{x.slot === active.slot ? "▶" : x.slot}</i>
                        <b>{x.title}</b>
                        {x.slot === active.slot && <small>In progress</small>}
                    </button>
                ))}
            </nav>
            <article className="lesson">
                <div className="lesson-meta">
                    <span className="chip">CLASS {active.slot} OF 5</span>
                    <i>◷ 35 min　◉ Beginner</i>
                </div>
                <div className="modes">
                    <button
                        className={mode === "beginner" ? "active" : ""}
                        onClick={() => setMode("beginner")}
                    >
                        🌱 Beginner mode
                    </button>
                    <button
                        className={mode === "deep" ? "active" : ""}
                        onClick={() => setMode("deep")}
                    >
                        ⌘ Deep dive
                    </button>
                </div>
                <h1>
                    {english && active.title}
                    {english && malayalam && " / "}
                    {malayalam && (
                        <em>
                            {translated
                                ? active.ml
                                : "Malayalam translation in progress"}
                        </em>
                    )}
                </h1>
                <p className="lead">
                    {mode === "beginner"
                        ? "Let’s build your mental model from the ground up. You do not need previous technical knowledge."
                        : "We will connect this idea to system abstractions, data representation, edge cases, and design trade-offs."}
                </p>
                {remote.loading ? <p className="lead">Loading lesson content…</p> : remote.error ? <><p className="lead">{remote.error}</p><LessonContent active={active} deep={mode === "deep"} en={english} ml={malayalam} translated={translated} /></> : remote.lesson?.blocks.length ? <ApiLessonContent blocks={remote.lesson.blocks} lang={lang} draft={remote.lesson.publicationState !== "PUBLISHED"} fallback={remote.lesson.fallback} topicCount={remote.topics?.length ?? 0} /> : <p className="lead">This class is currently an outline. Full lesson content has not been published.</p>}
                <section className="quiz">
                    <p className="eyebrow">KNOWLEDGE CHECK</p>
                    <h2>Before you move on</h2>
                    <p>Which statement best describes an algorithm?</p>
                    {[
                        "A type of computer hardware",
                        "A precise sequence of instructions for solving a problem",
                        "A programming language",
                        "A folder on a computer",
                    ].map((x, i) => (
                        <button
                            className={answer === i ? "chosen" : ""}
                            onClick={() => setAnswer(i)}
                            key={x}
                        >
                            <b>{"ABCD"[i]}</b>
                            {x}
                        </button>
                    ))}
                    {answer !== null && (
                        <small className={answer === 1 ? "right" : "wrong"}>
                            {answer === 1
                                ? "Correct — an algorithm gives exact steps that transform an input into a result."
                                : "Not quite. An algorithm is the repeatable set of steps, not the machine or language that runs it."}
                        </small>
                    )}
                </section>
                <div className="lesson-end">
                    <button
                        className="secondary"
                        onClick={() =>
                            setNotes({
                                ...notes,
                                [key]: `Key idea: ${active.title}\n\n`,
                            })
                        }
                    >
                        Add to notes
                    </button>
                    <button
                        className={completed ? "complete yes" : "complete"}
                        onClick={mark}
                    >
                        {completed ? "✓ Completed" : "Mark class complete"}
                    </button>
                </div>
            </article>
            <aside className="tools">
                <div className="tool">
                    <h3>
                        My notes <small>Saved</small>
                    </h3>
                    <textarea
                        value={notes[key] || ""}
                        onChange={(e) =>
                            setNotes({ ...notes, [key]: e.target.value })
                        }
                        placeholder="Capture an idea, question, or example…"
                    />
                    <p>Autosaves in this browser</p>
                </div>
                <div className="tool glossary">
                    <p className="eyebrow">BILINGUAL GLOSSARY</p>
                    <b>
                        Algorithm <em>അൽഗോരിതം</em>
                    </b>
                    <span>
                        A set of precise, ordered steps for solving a problem.
                    </span>
                    <b>
                        Memory <em>മെമ്മറി</em>
                    </b>
                    <span>
                        The workspace used while a computer runs a program.
                    </span>
                    <b>
                        Input <em>ഇൻപുട്ട്</em>
                    </b>
                    <span>Data supplied to a system for processing.</span>
                </div>
                <div className="resource">
                    <b>↗</b>
                    <span>
                        Helpful resource
                        <a
                            href="https://developer.mozilla.org/"
                            target="_blank"
                        >
                            MDN: How the web works
                        </a>
                    </span>
                </div>
            </aside>
        </div>
    );
}
function LessonContent({
    active,
    deep,
    en,
    ml,
    translated,
}: {
    active: Lesson;
    deep: boolean;
    en: boolean;
    ml: boolean;
    translated: boolean;
}) {
    const first = active.week === 1 && active.slot === 1;
    return (
        <div className="content">
            <section>
                <h2>01 · What is it?</h2>
                {en && (
                    <p>
                        {first
                            ? "A computer is a machine that accepts information, follows instructions, stores results, and produces an output. It is exceptionally fast at following small, exact steps."
                            : `This class introduces ${active.title}. We will define the idea, identify the problem it solves, and use it in a concrete task.`}
                    </p>
                )}
                {ml && (
                    <p className="malayalam">
                        {translated
                            ? "കമ്പ്യൂട്ടർ വിവരങ്ങൾ സ്വീകരിക്കുകയും നിർദ്ദേശങ്ങൾ പാലിക്കുകയും ഫലങ്ങൾ സൂക്ഷിക്കുകയും ഔട്ട്പുട്ട് നൽകുകയും ചെയ്യുന്ന യന്ത്രമാണ്."
                            : "ഈ പാഠത്തിന്റെ മലയാളം വിവർത്തനം എഡിറ്റോറിയൽ അവലോകനത്തിലാണ്. ഇംഗ്ലീഷ് പതിപ്പ് ഉപയോഗിക്കാം."}
                    </p>
                )}
            </section>
            <section>
                <h2>02 · Why does it matter?</h2>
                <p>
                    Engineers need a reliable model of the tools they use. When
                    something behaves unexpectedly, this model helps you ask
                    better questions and debug calmly.
                </p>
                <div className="analogy">
                    <b>☁</b>
                    <span>
                        <strong>Think of a kitchen</strong>
                        <p>
                            Ingredients are input. A recipe is an algorithm. The
                            cook is the processor. The finished dish is output.
                            Every step needs to be clear enough to repeat.
                        </p>
                    </span>
                </div>
            </section>
            <section>
                <h2>03 · See it work</h2>
                <div className="flow">
                    <span>
                        <b>INPUT</b>2 + 3
                    </span>
                    <i>→</i>
                    <span>
                        <b>PROCESS</b>follow + rule
                    </span>
                    <i>→</i>
                    <span>
                        <b>OUTPUT</b>5
                    </span>
                </div>
                {deep && (
                    <div className="deep">
                        <b>Deep dive</b>
                        <p>
                            At the machine level, instructions and data are
                            represented as bit patterns. A processor repeatedly
                            fetches an instruction, decodes its operation, and
                            executes it against registers or memory. This
                            fetch–decode–execute cycle is the basis for the
                            abstraction you experience as “running a program.”
                        </p>
                    </div>
                )}
            </section>
            <section>
                <h2>04 · Try it yourself</h2>
                <div className="exercise">
                    <b>✎</b>
                    <span>
                        <strong>Guided exercise · 5 minutes</strong>
                        <p>
                            Write an algorithm for making tea. Be exact: include
                            inputs, decisions, and what happens if water is not
                            hot.
                        </p>
                        <button>Open exercise worksheet →</button>
                    </span>
                </div>
            </section>
            <section>
                <h2>05 · Common misconception</h2>
                <p>
                    <strong>“Computers think like people.”</strong> They do not.
                    They can follow instructions remarkably quickly, but a human
                    still specifies the goal, rules, and meaningful
                    interpretation.
                </p>
            </section>
        </div>
    );
}
function Notes({
    active,
    notes,
    setNotes,
    say,
}: {
    active: Lesson;
    notes: Record<string, string>;
    setNotes: (x: Record<string, string>) => void;
    say: (x: string) => void;
}) {
    const k = `${active.week}-${active.slot}`;
    return (
        <div className="page">
            <p className="eyebrow">PERSONAL KNOWLEDGE BASE</p>
            <h1>Notes library</h1>
            <div className="notes-grid">
                <section className="editor">
                    <div>
                        <input
                            defaultValue={`Week ${active.week} · ${active.title}`}
                        />
                        <small>Markdown-ready · Autosaved</small>
                    </div>
                    <button
                        onClick={() => {
                            downloadLegacyLearningBackup();
                            say("Learning-data backup downloaded.");
                        }}
                    >
                        ⇩ Export backup
                    </button>
                    <nav>
                        <b>B</b>
                        <i>I</i>
                        <span>Code</span>
                        <span>↗ Link</span>
                        <span>☷ List</span>
                    </nav>
                    <textarea
                        value={notes[k] || ""}
                        onChange={(e) =>
                            setNotes({ ...notes, [k]: e.target.value })
                        }
                        placeholder="Start writing. Capture what made sense, what surprised you, and what you want to practise…"
                    />
                </section>
                <aside className="recent">
                    <h3>Recent notes</h3>
                    {Object.keys(notes).length ? (
                        Object.entries(notes)
                            .slice(-5)
                            .reverse()
                            .map(([x, v]) => (
                                <button
                                    onClick={() => say(`Opened note ${x}`)}
                                    key={x}
                                >
                                    <b>Lesson {x.replace("-", " · ")}</b>
                                    <small>
                                        {v.slice(0, 50) || "Empty note"}…
                                    </small>
                                </button>
                            ))
                    ) : (
                        <p>
                            No notes yet — your lesson notes will appear here.
                        </p>
                    )}
                    <div>
                        <b>Suggested tag</b>
                        <span>foundation</span>
                        <span>mental-models</span>
                    </div>
                </aside>
            </div>
        </div>
    );
}
function Practice({ say }: { say: (x: string) => void }) {
    const [attempt, setAttempt] = useState(false);
    return (
        <div className="page">
            <p className="eyebrow">DSA PRACTICE CENTER</p>
            <h1>Build problem-solving fluency</h1>
            <div className="practice-grid">
                <section className="problem">
                    <span className="orange-chip">EASY · ARRAYS</span>
                    <h2>Two Sum</h2>
                    <p>
                        Given an array of integers and a target, return the
                        indices of two numbers whose sum equals the target.
                    </p>
                    <pre>
                        {
                            "int[] nums = {2, 7, 11, 15};\nint target = 9;\n// return [0, 1]"
                        }
                    </pre>
                    <button
                        className="secondary"
                        onClick={() =>
                            say(
                                "Hint: think about the complement each number needs.",
                            )
                        }
                    >
                        Show hint
                    </button>{" "}
                    <button
                        className="primary"
                        onClick={() => {
                            setAttempt(true);
                            say("Attempt saved.");
                        }}
                    >
                        {attempt ? "✓ Attempt saved" : "Save attempt"}
                    </button>
                </section>
                <aside className="skills">
                    <h3>Your practice</h3>
                    <strong>
                        6 <small>problems this week</small>
                    </strong>
                    {[
                        ["Arrays", "30%"],
                        ["Strings", "3%"],
                        ["Hashing", "12%"],
                        ["Trees", "3%"],
                    ].map(([x, w]) => (
                        <div key={x}>
                            <span>{x}</span>
                            <i>
                                <b style={{ width: w }} />
                            </i>
                        </div>
                    ))}
                    <button onClick={() => say("Revision queue opened.")}>
                        View revision queue →
                    </button>
                </aside>
            </div>
        </div>
    );
}
function Projects({ say }: { say: (x: string) => void }) {
    const [done, setDone] = useState(false);
    return (
        <div className="page">
            <p className="eyebrow">CAPSTONE WORKSPACE</p>
            <h1>Build something that survives real usage.</h1>
            <section className="project">
                <div className="arch">
                    <b>
                        React<small>Client</small>
                    </b>
                    <i>↕</i>
                    <b>
                        Spring Boot<small>API</small>
                    </b>
                    <i>↕</i>
                    <b>
                        PostgreSQL<small>Data</small>
                    </b>
                    <i>↕</i>
                    <b>
                        Redis + Kafka<small>Reliability</small>
                    </b>
                </div>
                <div>
                    <span className="violet-chip">CAPSTONE · 0%</span>
                    <h2>High-Concurrency Event Ticketing Platform</h2>
                    <p>
                        Design and build a booking service that protects
                        inventory, handles repeat requests safely, and
                        communicates status changes asynchronously.
                    </p>
                    {[
                        [
                            "01",
                            "Model events and ticket inventory",
                            "API contracts, schema, test cases",
                        ],
                        [
                            "02",
                            "Implement reservation and expiry flow",
                            "Transactions, locking, idempotency",
                        ],
                        [
                            "03",
                            "Add payment simulation and notifications",
                            "Outbox, Kafka, observability",
                        ],
                    ].map(([n, t, s], i) => (
                        <div className="milestone" key={n}>
                            <b>{n}</b>
                            <span>
                                <strong>{t}</strong>
                                <small>{s}</small>
                            </span>
                            <button
                                onClick={() => {
                                    if (i === 0) {
                                        setDone(!done);
                                        say(
                                            done
                                                ? "Task reset."
                                                : "Milestone task completed.",
                                        );
                                    }
                                }}
                            >
                                {i === 0
                                    ? done
                                        ? "✓ Done"
                                        : "Mark done"
                                    : i === 1
                                        ? "Start →"
                                        : "Locked"}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
createRoot(document.getElementById("root")!).render(<App />);
