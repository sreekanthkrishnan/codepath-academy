package com.codepathacademy.curriculum;

import jakarta.annotation.PostConstruct; import java.util.*; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
@Service public class CurriculumSeedService {
 private final CurriculumProgramRepository programs; private final CurriculumWeekRepository weeks; private final CurriculumClassRepository classes;
 public CurriculumSeedService(CurriculumProgramRepository programs,CurriculumWeekRepository weeks,CurriculumClassRepository classes){this.programs=programs;this.weeks=weeks;this.classes=classes;}
 @PostConstruct @Transactional public void seed(){var program=programs.findByCode("CPA-BACKEND-40").orElseGet(()->programs.save(new CurriculumProgram("CPA-BACKEND-40","CodePath Academy Backend Engineering","കോഡ്പാത്ത് അക്കാദമി ബാക്കെൻഡ് എഞ്ചിനീയറിംഗ്","A 40-week computer science and Java backend engineering path."))); for(int i=0;i<CATALOG.size();i++){var entry=CATALOG.get(i);int number=i+1;String weekCode=String.format("CPA-W%02d",number);var week=weeks.findByCode(weekCode).orElseGet(()->weeks.save(new CurriculumWeek(program,weekCode,number,entry.phase)));for(int slot=0;slot<entry.titles.size();slot++){int n=slot+1;String code=String.format("CPA-W%02d-C%02d",number,n);String title=entry.titles.get(slot);String ml=MALAYALAM.get(title);if(classes.findByCode(code).isEmpty())classes.save(new CurriculumClass(week,code,n,title,ml));}}}
 public record WeekSeed(String phase,List<String> titles){}
 private static WeekSeed w(String phase,String... titles){return new WeekSeed(phase,List.of(titles));}
 private static final List<WeekSeed> CATALOG=List.of(
  w("Foundation · Introduction to Computers","What Is a Computer and How Does It Work?","Hardware, Software, CPU, RAM and Storage","Operating Systems, Files and Folders","Installing and Using Developer Tools","Lab: Set Up a Development Environment"),
  w("Foundation · Internet & Software","What Is Software Development?","How the Internet Works","Browsers, Websites, Clients and Servers","Introduction to HTML, CSS and HTTP","Lab: Create and Open a Simple Webpage"),
  w("Foundation · Computational Thinking","What Is an Algorithm?","Logic, Conditions and Decision Making","Flowcharts and Pseudocode","Binary Numbers, Data and Information","Lab: Solve Problems Without a Programming Language"),
  w("Foundation · Developer Foundations","Introduction to the Terminal","Files, Paths and Basic Shell Commands","Git and Version Control","GitHub, Repositories and Commits","Lab: Publish a First Project"),
  w("Month 1 · Core Java","Java, JDK, JRE and JVM","Writing and Running Java Programs","Variables, Literals and Data Types","Operators and Expressions","Lab: Build a Basic Calculator"),
  w("Month 1 · Core Java","Boolean Logic and Conditions","If-Else and Switch Statements","For, While and Do-While Loops","Nested Loops and Problem Solving","Lab: Number and Pattern Problems"),
  w("Month 1 · Core Java","Methods, Parameters and Return Values","Scope, Stack Frames and Call Flow","Arrays and Strings","Recursion Fundamentals","Lab: Build a Student Marks Calculator"),
  w("Month 1 · OOP","Classes and Objects","Constructors and Encapsulation","Inheritance and Polymorphism","Interfaces and Abstraction","Lab: Object-Oriented Banking Application"),
  w("Month 2 · Advanced Java","Object Identity, Equality and Hashing","Immutability, Records and Enums","Exceptions and Error Handling","Generics and Type Safety","Lab: Refactor the Banking Application"),
  w("Month 2 · Collections","Lists and ArrayList","Sets and HashSet","Maps and HashMap","Collections Complexity and Internal Behavior","Lab: Build a Library Management System"),
  w("Month 2 · Modern Java","Functional Interfaces and Lambdas","Streams and Collectors","Optional and Method References","Files, Serialization and Date-Time APIs","Lab: Data Processing Application"),
  w("Month 2 · JVM and Concurrency","JVM Architecture, Stack and Heap","Garbage Collection and Memory","Threads and Synchronization","Executors, Futures and Virtual Threads","Lab: Concurrent Transaction Processor"),
  w("Month 3 · Networking","Network Models and TCP/IP","DNS, IP Addresses and Ports","HTTP and HTTPS","REST APIs and Request Lifecycles","Lab: Inspect Real API Requests"),
  w("Month 3 · Relational Databases","Introduction to Databases and RDBMS","PostgreSQL Installation and Data Types","Tables, Keys, Constraints and Relationships","SQL SELECT, INSERT, UPDATE and DELETE","Lab: Design a Library Database"),
  w("Month 3 · Advanced SQL","Joins and Subqueries","Aggregation and Grouping","CTEs and Window Functions","Indexes and Query Execution Plans","Lab: SQL Reporting Problems"),
  w("Month 3 · Database Internals","Normalization and Data Modeling","Transactions and ACID","Isolation Levels and Locking","JDBC and Connection Pooling","Lab: Concurrent Database Transactions"),
  w("Month 4 · Spring Boot","Spring Framework Architecture","Dependency Injection and IoC","Beans, Configuration and Lifecycle","Spring Boot Auto-Configuration","Lab: Create a Spring Boot Application"),
  w("Month 4 · REST APIs","Controllers and Request Mapping","Service Layers and DTOs","Validation and Exception Handling","Pagination, Filtering and API Contracts","Lab: Create a REST API"),
  w("Month 4 · Persistence","Spring Data JPA","Hibernate and Entity Mapping","Relationships and Fetch Strategies","N+1 Queries and Transaction Management","Lab: PostgreSQL-Backed REST API"),
  w("Month 4 · Professional APIs","Flyway Database Migrations","API Documentation with OpenAPI","Logging and Configuration","API Testing and Error Design","Lab: Event Management Backend"),
  w("Month 5 · Authentication","Authentication Fundamentals","Spring Security Architecture","Sessions, JWT and OAuth2 Concepts","Role-Based Access Control","Lab: Secure an API"),
  w("Month 5 · Security","OWASP Fundamentals","SQL Injection, XSS, CSRF and CORS","Password Hashing and Secrets","Multi-Tenant Security and Data Isolation","Lab: Security Testing"),
  w("Month 5 · Automated Testing","Unit Testing with JUnit","Mocking with Mockito","Integration Testing with Testcontainers","Test Design, Fixtures and Coverage","Lab: Test the Booking Backend"),
  w("Month 5 · Maintainable Design","SOLID Principles","Clean Architecture and Separation of Concerns","Design Patterns","Modular Monoliths and API Boundaries","Lab: Refactor a Backend Module"),
  w("Month 6 · Caching","Why Caching Is Needed","Redis Fundamentals","Cache-Aside and Cache Strategies","Expiration, Eviction and Invalidation","Lab: Add Redis to Spring Boot"),
  w("Month 6 · Messaging","Synchronous vs Asynchronous Communication","Kafka Architecture","Producers, Consumers and Partitions","Delivery Guarantees and Error Recovery","Lab: Event-Driven Notifications"),
  w("Month 6 · Correctness","Race Conditions in Backend Systems","Optimistic and Pessimistic Locking","Idempotency and Deduplication","Transactional Outbox and Reliable Events","Lab: Prevent Ticket Overselling"),
  w("Month 6 · Reliability","Latency, Throughput and Bottlenecks","Load Testing Fundamentals","Timeouts, Retries and Circuit Breakers","Rate Limiting and Failure Handling","Lab: Benchmark the Booking Platform"),
  w("Month 7 · Algorithms","Time and Space Complexity","Arrays, Hashing and Sliding Windows","Sorting and Binary Search","Recursion and Backtracking","Lab: Timed DSA Assessment"),
  w("Month 7 · Data Structures","Linked Lists, Stacks and Queues","Trees and Binary Search Trees","Heaps and Priority Queues","Graphs, BFS and DFS","Lab: Data Structure Problems"),
  w("Month 7 · Algorithms & LLD","Dynamic Programming","Greedy Algorithms","Object Modeling and UML","Factory, Strategy, Observer and State Patterns","Lab: Parking Lot System Design"),
  w("Month 7 · System Design","Requirement Analysis and Capacity Estimation","Load Balancing and Horizontal Scaling","Database Replication and Partitioning","Consistency, Availability and Distributed Systems","Lab: Design a Ticket Booking System"),
  w("Month 8 · Linux & Containers","Linux Fundamentals","Processes, Permissions and Networking","Docker Images and Containers","Docker Compose and Container Networks","Lab: Containerize Spring Boot"),
  w("Month 8 · AWS","Cloud Architecture and Shared Responsibility","AWS IAM and Network Fundamentals","EC2, S3 and RDS","Deployment, Security and Cost Management","Lab: Deploy the Backend"),
  w("Month 8 · Continuous Delivery","CI/CD Concepts","GitHub Actions","Automated Quality Checks","Deployment Strategies and Rollbacks","Lab: Automated Deployment Pipeline"),
  w("Month 8 · Production Engineering","Structured Logging","Application Metrics","Distributed Tracing","Monitoring, Alerting and Incident Response","Lab: Diagnose a Production-Like Failure"),
  w("Month 9 · Capstone","Complete Backend Architecture","API Integration with React","Security and Data Integrity Review","Automated Testing and Performance Review","Capstone Milestone Review"),
  w("Month 9 · Engineering Depth","Advanced Java Revision","JVM and Concurrency Interview Questions","Spring Boot and SQL Interview Questions","Distributed Systems Design Review","Timed Technical Mock Interview"),
  w("Month 9 · Interviews","DSA Revision","Advanced Problem-Solving Workshop","Low-Level Design Mock Interview","High-Level Design Mock Interview","Full Technical Interview Simulation"),
  w("Month 9 · Career Preparation","Product-Company Resume Preparation","Portfolio and GitHub Review","Behavioral and Leadership Interviews","Interview Performance Analysis","Final Assessment and Individual Growth Plan"));
 private static final Map<String,String> MALAYALAM=Map.of("What Is a Computer and How Does It Work?","കമ്പ്യൂട്ടർ എന്താണ്, അത് എങ്ങനെ പ്രവർത്തിക്കുന്നു?","Hardware, Software, CPU, RAM and Storage","ഹാർഡ്‌വെയർ, സോഫ്റ്റ്‌വെയർ, CPU, RAM, സ്റ്റോറേജ്","Operating Systems, Files and Folders","ഓപ്പറേറ്റിംഗ് സിസ്റ്റം, ഫയലുകൾ, ഫോൾഡറുകൾ","Installing and Using Developer Tools","ഡെവലപ്പർ ടൂളുകൾ ഇൻസ്റ്റാൾ ചെയ്യുകയും ഉപയോഗിക്കുകയും ചെയ്യുക","Lab: Set Up a Development Environment","ലാബ്: ഡെവലപ്‌മെന്റ് പരിസരം സജ്ജമാക്കുക","What Is Software Development?","സോഫ്റ്റ്‌വെയർ ഡെവലപ്‌മെന്റ് എന്താണ്?","How the Internet Works","ഇന്റർനെറ്റ് എങ്ങനെ പ്രവർത്തിക്കുന്നു?","Browsers, Websites, Clients and Servers","ബ്രൗസറുകൾ, വെബ്സൈറ്റുകൾ, ക്ലയന്റുകൾ, സെർവറുകൾ");
}
