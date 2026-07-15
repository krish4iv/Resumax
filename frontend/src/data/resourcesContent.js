export const roadmapsContent = {
  eyebrow: "CAREER PATHS",
  title: "Roadmaps",
  subtitle: "Stage-by-stage paths for common tech career tracks.",
  groups: [
    {
      heading: "Frontend Developer",
      description: "6 stages, beginner to senior",
      items: [
        { badge: "1", title: "HTML, CSS & JavaScript fundamentals", description: "DOM, events, ES6+, responsive layout" },
        { badge: "2", title: "A modern framework", description: "React, Vue, or Svelte — component patterns, state" },
        { badge: "3", title: "Tooling & build systems", description: "Vite/Webpack, npm, Git workflows" },
        { badge: "4", title: "Styling systems", description: "Tailwind, CSS-in-JS, design systems" },
        { badge: "5", title: "Testing & performance", description: "Unit/integration tests, Lighthouse, bundle size" },
        { badge: "6", title: "Advanced patterns", description: "SSR/SSG, accessibility, micro-frontends" },
      ],
    },
    {
      heading: "Backend Developer",
      description: "6 stages, beginner to senior",
      items: [
        { badge: "1", title: "A server-side language", description: "Node.js, Python, Go, or Java" },
        { badge: "2", title: "Databases", description: "SQL fundamentals, then Postgres/MySQL, plus one NoSQL store" },
        { badge: "3", title: "API design", description: "REST principles, auth, versioning, GraphQL basics" },
        { badge: "4", title: "Infrastructure basics", description: "Docker, CI/CD, environment config" },
        { badge: "5", title: "Scalability", description: "Caching, queues, load balancing, horizontal scaling" },
        { badge: "6", title: "Systems & reliability", description: "Observability, distributed systems, on-call practices" },
      ],
    },
    {
      heading: "Full-Stack Developer",
      description: "Combine the frontend and backend tracks above, in this order",
      items: [
        { title: "Frontend fundamentals first", description: "Get comfortable shipping UI before backend depth" },
        { title: "Then backend fundamentals", description: "APIs, databases, auth" },
        { title: "Then one deployment pipeline end to end", description: "Own a project from database to production" },
      ],
    },
  ],
}

export const projectsContent = {
  eyebrow: "PRACTICE",
  title: "Projects",
  subtitle: "Build these to strengthen your resume and portfolio.",
  groups: [
    {
      heading: "Beginner",
      items: [
        { title: "Personal portfolio site", description: "Static site with your projects, deployed live" },
        { title: "Todo app with persistence", description: "CRUD, local storage or a small backend" },
        { title: "Weather dashboard", description: "Consume a public API, handle loading/error states" },
      ],
    },
    {
      heading: "Intermediate",
      items: [
        { title: "Full-stack blog platform", description: "Auth, CRUD posts, comments, image uploads" },
        { title: "Real-time chat app", description: "WebSockets, rooms, presence indicators" },
        { title: "E-commerce cart & checkout flow", description: "Cart state, mock payment, order history" },
      ],
    },
    {
      heading: "Advanced",
      items: [
        { title: "Multi-tenant SaaS starter", description: "Auth, billing, role-based access, admin panel" },
        { title: "AI-powered app", description: "Wraps an LLM API for a specific task — like this project does" },
        { title: "Distributed job queue", description: "Workers, retries, dead-letter handling, monitoring" },
      ],
    },
  ],
}

export const guidesContent = {
  eyebrow: "CAREER GUIDES",
  title: "Guides",
  subtitle: "Short, practical reads on job hunting and career growth.",
  groups: [
    {
      heading: "Job Search",
      items: [
        { title: "How to tailor a resume for each job", description: "Match keywords without lying — what actually moves the needle" },
        { title: "Writing a cover letter that gets read", description: "Structure, length, and the one paragraph that matters most" },
        { title: "Reading a job description like a recruiter", description: "Spotting must-haves vs nice-to-haves" },
      ],
    },
    {
      heading: "Interviewing",
      items: [
        { title: "Answering 'tell me about yourself'", description: "A repeatable structure that doesn't sound rehearsed" },
        { title: "Negotiating your offer", description: "What to ask for, and how, once an offer is on the table" },
      ],
    },
    {
      heading: "Career Growth",
      items: [
        { title: "When to ask for a promotion", description: "Signals that you're ready, and how to build the case" },
        { title: "Switching industries with transferable skills", description: "Framing unrelated experience as relevant" },
      ],
    },
  ],
}

export const systemDesignContent = {
  eyebrow: "INTERVIEW PREP",
  title: "System Design",
  subtitle: "Common system design interview topics to practice.",
  groups: [
    {
      heading: "Core Concepts",
      items: [
        { title: "Load balancing", description: "Round robin, least connections, consistent hashing" },
        { title: "Caching strategies", description: "Write-through, write-back, cache invalidation" },
        { title: "Database scaling", description: "Replication, sharding, read/write splitting" },
        { title: "Message queues", description: "Pub/sub vs point-to-point, at-least-once delivery" },
      ],
    },
    {
      heading: "Classic Design Questions",
      items: [
        { title: "Design a URL shortener", description: "Hashing, collision handling, redirect latency" },
        { title: "Design a rate limiter", description: "Token bucket, sliding window, distributed enforcement" },
        { title: "Design a news feed", description: "Fan-out on write vs read, ranking, pagination" },
        { title: "Design a chat application", description: "Delivery guarantees, presence, message ordering" },
      ],
    },
  ],
}

export const behavioralContent = {
  eyebrow: "INTERVIEW PREP",
  title: "Behavioral Questions",
  subtitle: "Common behavioral questions, grouped by what they're testing.",
  groups: [
    {
      heading: "Teamwork & Conflict",
      items: [
        { title: "Tell me about a conflict with a coworker and how you resolved it." },
        { title: "Describe a time you disagreed with your manager's decision." },
        { title: "Tell me about a time you had to work with someone difficult." },
      ],
    },
    {
      heading: "Ownership & Impact",
      items: [
        { title: "Tell me about a project you're most proud of." },
        { title: "Describe a time you went above and beyond your role." },
        { title: "Tell me about a mistake you made and what you learned." },
      ],
    },
    {
      heading: "Leadership & Growth",
      items: [
        { title: "Tell me about a time you led a project without formal authority." },
        { title: "Describe how you've mentored someone." },
        { title: "Tell me about a time you had to learn something quickly." },
      ],
    },
  ],
}

export const templatesContent = {
  eyebrow: "RESUME",
  title: "Templates",
  subtitle: "Available templates in the Resume Builder's PDF export.",
  groups: [
    {
      heading: "Available Now",
      description: "Pick one when generating a PDF from Resume Builder",
      items: [
        { badge: "Classic", title: "Classic", description: "Traditional single-column layout, serif headings, safest for ATS" },
        { badge: "Modern", title: "Modern", description: "Blue accent color, clean sans-serif hierarchy" },
        { badge: "Creative", title: "Creative", description: "Colored header band, best for design-forward roles" },
      ],
    },
  ],
}