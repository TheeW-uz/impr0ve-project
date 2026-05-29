export interface GeneratedTask {
  title: string;
  description: string;
  resource: string;
  isProject: boolean;
  order: number;
}

export interface GeneratedPhase {
  title: string;
  description: string;
  order: number;
  tasks: GeneratedTask[];
}

export interface GeneratedRoadmap {
  phases: GeneratedPhase[];
  estimatedWeeks: number;
  adaptationNote: string;
}

// Highly comprehensive preloaded syllabus database
const TECH_DATABASE: Record<string, {
  category: string;
  beginner: string[];
  intermediate: string[];
  advanced: string[];
  projects: string[];
}> = {
  'React': {
    category: 'Frontend',
    beginner: [
      'Foundations: Learn JSX, rendering, and embedding expressions',
      'Components & Props: Master functional components and props passing',
      'State Management: Deep dive into useState and rendering cycles',
      'Handling Events: Event systems, forms, and controlled inputs',
      'Conditional Rendering: Standard UI conditional rendering strategies'
    ],
    intermediate: [
      'Side Effects: Master useEffect, cleanup functions, and basic fetches',
      'Advanced Hooks: Learn useRef, useMemo, and useCallback for optimization',
      'Context API: Global state sharing without prop drilling',
      'Routing: Implement dynamic multi-page routing with React Router',
      'Custom Hooks: Extract reusable stateful logic into clean hooks'
    ],
    advanced: [
      'State Managers: Set up Redux Toolkit or Zustand state systems',
      'Performance Optimization: Code splitting, lazy loading, and React.memo',
      'Testing: Write unit & integration tests with Jest & React Testing Library',
      'Server-Side: Learn React Server Components concepts and hydration',
      'Deployment & CI/CD: Deploy to Vercel, setup GitHub actions build tests'
    ],
    projects: [
      'Build a dynamic Kanban Board app with custom drag-and-drop state',
      'Create a premium Music Player dashboard utilizing Audio APIs and Zustand state',
      'Develop a real-time Chatroom app connecting to a Supabase or Firebase socket backend'
    ]
  },
  'Next.js': {
    category: 'Frontend',
    beginner: [
      'App Router Basics: File-based routing, pages, and layouts in Next.js',
      'Server & Client Components: Master RSC architecture and when to use client boundaries',
      'Navigation: Setup Link components, useRouter programmatic navigation',
      'Static Asset Optimization: Optimize images with next/image and fonts with next/font'
    ],
    intermediate: [
      'Data Fetching: Learn fetch options, static generation, server-side rendering, and revalidation',
      'API Routes: Write serverless Next.js route handlers in the app directory',
      'Dynamic Routing: Setup [slug] paths, generateStaticParams metadata configurations',
      'Server Actions: Secure form handling, mutations, and automatic cache revalidation'
    ],
    advanced: [
      'Middleware: Setup edge redirecting, geolocation checks, and session cookie validation',
      'Authentication: Integrate NextAuth.js or custom JWT cookie validations',
      'Caching Internals: Master Next.js Full Route Cache, Data Cache, and Request Memoization',
      'Deployment: Deploy to Vercel, setup custom domains, CDN edge configurations'
    ],
    projects: [
      'Create a beautiful responsive SaaS marketing page and checkout dashboard',
      'Develop a markdown-powered developer Blog engine with comments and real-time page-view counters'
    ]
  },
  'Python': {
    category: 'Languages',
    beginner: [
      'Basics: Variables, data types, standard input/output operations',
      'Control Flow: Implement logical statements, loops, and conditions',
      'Functions: Define functions, parameters, return statements, scope rules',
      'Data Structures: Master lists, tuples, sets, and dictionaries'
    ],
    intermediate: [
      'Object Oriented Programming: Classes, inheritance, polymorphism, encapsulation',
      'File Handling & Modules: Read/write files, manage directories, standard imports',
      'Exception Handling: Try-except blocks, raising custom exceptions, cleanups',
      'Functional Utilities: Comprehensions, lambda expressions, map/filter/reduce'
    ],
    advanced: [
      'Concurrency: Multithreading vs multiprocessing, asyncio asynchronous loops',
      'Advanced Mechanics: Decorators, generators, context managers, metaclasses',
      'Testing: Write unit tests with unittest, pytest, mock interfaces',
      'Packaging: Create setup.py configurations, bundle wheels, distribute on PyPI'
    ],
    projects: [
      'Build a local Web Scraper utilizing BeautifulSoup/Playwright to export CSV sheets',
      'Create an automated Command-line system tool to parse and organize massive directory backups'
    ]
  },
  'TypeScript': {
    category: 'Languages',
    beginner: [
      'Type System: Primitive types, type annotations, and implicit type inference',
      'Interfaces & Types: Define custom data objects, read-only fields, optional items',
      'Functions in TS: Typing arguments, return types, functional signatures'
    ],
    intermediate: [
      'Generics: Build reusable generic functions, interfaces, and classes',
      'Unions & Intersections: Dynamic types combination, type narrowing, type assertions',
      'Utility Types: Master Partial, Omit, Pick, Record, and Readonly',
      'Tooling: Setup tsconfig.json configurations, build compile pipelines'
    ],
    advanced: [
      'Advanced Typing: Conditional types, mapped types, template literal types',
      'Decorators & Metadata: Reflective programming, class descriptors',
      'Strict Mode Migrations: Convert legacy JavaScript repos to fully typed TS code bases'
    ],
    projects: [
      'Build a robust strongly-typed Event Bus system for publish-subscribe patterns',
      'Develop a type-safe dynamic REST Request builder client utilizing advanced generics'
    ]
  },
  'Rust': {
    category: 'Languages',
    beginner: [
      'Cargo & Project Setup: Compile, run, manage dependencies, standard tools',
      'Variable Binding & Mutability: Safe memory binding principles',
      'Basic Data Types: Structs, enums, arrays, tuples, match expressions',
      'Ownership & Borrowing: Master Rust reference rules, borrow checker checks'
    ],
    intermediate: [
      'Lifetimes: Understand lifetime annotations, explicit definitions',
      'Traits: Implement reusable interface behavior, generics parameters, trait bounds',
      'Error Handling: Result and Option enums, matching, propagating errors with ? operator',
      'Collections: Vector lists, String mutations, HashMap collections'
    ],
    advanced: [
      'Smart Pointers: Master Box, Rc, Arc, RefCell, safe heap allocations',
      'Concurrency: Safe multithreaded spawning, channels, mutex sync locks',
      'Unsafe Rust: Bare metal memory operations, FFI integrations',
      'Macros: Standard declarative and complex procedural macro definitions'
    ],
    projects: [
      'Build a blazing fast CLI search utility parsing system files with regular expressions',
      'Create an asynchronous TCP Chat server utilizing Tokio runtime and custom messaging'
    ]
  },
  'Go': {
    category: 'Languages',
    beginner: [
      'Environment & Setup: Setup GOROOT/GOPATH, workspace modules, compilation',
      'Variables & Structs: Declare types, compile checks, custom objects',
      'Control Flow: Standard loops, switch statements, simple conditions'
    ],
    intermediate: [
      'Pointers & Memory: Address referencing, zero-copy mutations',
      'Interfaces: Decoupled interface patterns, structural typing rules',
      'Goroutines: Concurrent threads, call schedulers',
      'Channels: Thread communication, buffered vs unbuffered channels, select multiplexer'
    ],
    advanced: [
      'Reflect & Generics: Parametric types, custom runtime inspection',
      'Go Profiling: CPU/Memory profiling, pprof trace analysis, GC optimization',
      'Network Services: Build production standard HTTP routers and RPC systems'
    ],
    projects: [
      'Build a robust concurrent Web crawler scraping link maps with Goroutines',
      'Develop a fully-featured, ultra-fast JSON REST API from scratch with zero third-party dependencies'
    ]
  },
  'Node.js': {
    category: 'Backend',
    beginner: [
      'Runtime Basics: Event loop internals, standard globally scoped functions',
      'File System (FS): Read and write system files, create streaming handlers',
      'NPM Ecosystem: Package management, scripts, dependency locking'
    ],
    intermediate: [
      'Express framework: Route routing, middleware interceptors, error boundaries',
      'Asynchronous flow: Promises, async/await handlers, exception captures',
      'Authentication: Simple JWT token creation, session storage'
    ],
    advanced: [
      'Streaming & Buffers: High performance binary chunks manipulations',
      'Clusters & Workers: CPU scaling, child processes, parent-child pipes',
      'Microservices: Setup REST/gRPC endpoints, service discovery'
    ],
    projects: [
      'Build a robust RESTful File Server with directory indexing and dynamic ZIP packaging on-the-fly',
      'Create a concurrent real-time Log Aggregator routing microservices feeds into single files'
    ]
  },
  'PostgreSQL': {
    category: 'Databases',
    beginner: [
      'SQL Basics: Selects, inserts, updates, deletes, basic filtering joins',
      'Table Definitions: Setup schemas, primary/foreign constraints, data types',
      'CRUD Operations: Manage related database tables'
    ],
    intermediate: [
      'Indexes: Optimize lookups with B-Tree, Hash, GiST/GIN indexes, analyze queries',
      'Transactions: ACID compliance, transactional savepoints, isolation levels',
      'Views & Aggrs: Complex groupings, common table expressions (CTEs)'
    ],
    advanced: [
      'Stored Procedures: Write PL/pgSQL database scripts, trigger automated callbacks',
      'Scaling PG: Master replication systems, partition massive tables',
      'Full-Text Search: Implement fast dictionary searches without external search engines'
    ],
    projects: [
      'Design a comprehensive E-commerce database schema complete with indexes, triggers, and migrations',
      'Build a dynamic DB Query dashboard displaying real-time table sizes, slow queries, and missing indexes'
    ]
  }
};

// Default template generator if technology is not pre-listed
const DEFAULT_TECH_TEMPLATE = {
  category: 'Languages',
  beginner: [
    'Syntax Basics: Standard syntax, variables, data structures, output variables',
    'Control structures: Basic loops, branches, functional declarations',
    'Data objects: Manage lists, dictionaries, key-value mappings',
    'Environment setup: Set up runtime compilers, IDE configurations, debug tools'
  ],
  intermediate: [
    'Advanced Types: Class structures, object definitions, encapsulation concepts',
    'Error handling: Raise and resolve runtime exceptions, safe execution wrappers',
    'External libraries: Connect and parse external API requests and packages',
    'Data flows: Stream input files, save logs, parse configs'
  ],
  advanced: [
    'System Optimization: Speed optimizations, code profiling, code structures',
    'Concurrency: Spawning simultaneous threads, managing task pipelines',
    'Testing & QA: Build unit test suites, configure CI test runs',
    'Distribution: Build binary wheels, bundle executable code, deploy'
  ],
  projects: [
    'Build a fully documented CLI application automation utility',
    'Create an interactive dashboard showcasing system metrics and performance data'
  ]
};

export function generateRoadmapFor(
  technology: string,
  currentLevel: string,
  targetLevel: string,
  estimatedStudyHours: number,
  dailyMinutes: number
): GeneratedRoadmap {
  const techData = TECH_DATABASE[technology] || {
    ...DEFAULT_TECH_TEMPLATE,
    category: technology.toLowerCase().includes('react') || technology.toLowerCase().includes('vue') || technology.toLowerCase().includes('html') ? 'Frontend' :
              technology.toLowerCase().includes('node') || technology.toLowerCase().includes('django') || technology.toLowerCase().includes('api') ? 'Backend' : 'Languages'
  };

  const phases: GeneratedPhase[] = [];
  let order = 0;

  // Level levels weights mapping
  const levels = ['Beginner', 'Junior', 'Intermediate', 'Advanced', 'Professional', 'Expert'];
  const curIdx = levels.indexOf(currentLevel) >= 0 ? levels.indexOf(currentLevel) : 0;
  const tgtIdx = levels.indexOf(targetLevel) >= 0 ? levels.indexOf(targetLevel) : 3;

  // Estimated weeks
  const totalMinutes = estimatedStudyHours * 60;
  const daysNeeded = Math.ceil(totalMinutes / dailyMinutes);
  const estimatedWeeks = Math.ceil(daysNeeded / 7);

  // 1. Beginner Phase (Always generate if target is high, adapt based on starting level)
  const begTasks: GeneratedTask[] = [];
  techData.beginner.forEach((title, idx) => {
    // Skip beginner tasks if starting beyond Junior
    if (curIdx < 2) {
      begTasks.push({
        title: title.split(':')[0],
        description: title.split(':')[1] || 'Foundational topic study.',
        resource: `https://www.google.com/search?q=${encodeURIComponent(technology + ' ' + title.split(':')[0])}`,
        isProject: false,
        order: idx,
      });
    }
  });

  if (begTasks.length > 0) {
    phases.push({
      title: 'Phase 1: Foundational Sync',
      description: `Establish primary abstractions, environment structures, and syntax logic for ${technology}.`,
      order: order++,
      tasks: begTasks,
    });
  }

  // 2. Intermediate Phase
  const intTasks: GeneratedTask[] = [];
  techData.intermediate.forEach((title, idx) => {
    // Skip if user starts expert
    if (curIdx < 4) {
      intTasks.push({
        title: title.split(':')[0],
        description: title.split(':')[1] || 'Core principles integration.',
        resource: `https://roadmap.sh/search?q=${encodeURIComponent(technology)}`,
        isProject: false,
        order: idx,
      });
    }
  });

  if (intTasks.length > 0) {
    phases.push({
      title: 'Phase 2: Core Engineering Integration',
      description: `Dive deeper into custom modules, architecture principles, and mid-tier design workflows in ${technology}.`,
      order: order++,
      tasks: intTasks,
    });
  }

  // 3. Advanced Phase
  const advTasks: GeneratedTask[] = [];
  techData.advanced.forEach((title, idx) => {
    // Skip if target is low
    if (tgtIdx >= 3) {
      advTasks.push({
        title: title.split(':')[0],
        description: title.split(':')[1] || 'Highly complex abstractions.',
        resource: `https://api.github.com/search/repositories?q=${encodeURIComponent(technology)}+stars:%3E1000`,
        isProject: false,
        order: idx,
      });
    }
  });

  if (advTasks.length > 0) {
    phases.push({
      title: 'Phase 3: Production Scale Architectures',
      description: `Learn optimizations, microservices patterns, testing architectures, and deployment infrastructure for ${technology}.`,
      order: order++,
      tasks: advTasks,
    });
  }

  // 4. Capstone Practice Projects Phase
  const projTasks: GeneratedTask[] = [];
  techData.projects.forEach((projText, idx) => {
    projTasks.push({
      title: `Capstone Sprint #${idx + 1}`,
      description: projText,
      resource: 'GitHub Open Source Ideas',
      isProject: true,
      order: idx,
    });
  });

  if (projTasks.length > 0) {
    phases.push({
      title: 'Phase 4: Synthesis & Capstone Projects',
      description: `Synthesize your cumulative theoretical framework by engineering production-grade solutions.`,
      order: order++,
      tasks: projTasks,
    });
  }

  // Adaptation Note
  const dailyTimeHours = (dailyMinutes / 60).toFixed(1);
  const adaptationNote = `System auto-optimized. Calculated trajectory: ${estimatedStudyHours} total hours allocated, study rate set to ${dailyTimeHours}h/day. Expect milestones review in ${estimatedWeeks} weeks. Adaptations will automatically trigger based on task completion pace.`;

  return {
    phases,
    estimatedWeeks,
    adaptationNote,
  };
}
