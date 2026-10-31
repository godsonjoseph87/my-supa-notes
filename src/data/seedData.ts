import { Note, NotificationItem } from '../types/note';

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
const daysAgoHours = (d: number, h: number = 2) =>
  new Date(now.getTime() - (d * 24 + h) * 60 * 60 * 1000).toISOString();

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Project Ideas',
    icon: '💡',
    category: 'Ideas',
    favorite: true,
    pinned: false,
    deleted: false,
    displayDate: 'Oct 28, 2025',
    createdAt: daysAgoHours(5),
    updatedAt: hoursAgo(2),
    preview: 'Here are some exciting project ideas to explore in the next quarter...',
    content: `<p>Here are some exciting project ideas to explore in the next quarter. These ideas can help improve productivity, streamline workflows, and bring creative solutions to real-world problems.</p>
<h3>✅ 1. Note Taking App (Current Project)</h3>
<ul>
  <li>Beautiful and minimal UI/UX</li>
  <li>Rich text support (images, links, code blocks)</li>
  <li>Cloud sync and offline support</li>
  <li>Tags and categories</li>
  <li>Dark mode</li>
</ul>
<h3>🧠 2. AI-Powered Study Assistant</h3>
<ul>
  <li>Summarize long notes or PDFs</li>
  <li>Generate quizzes from notes</li>
  <li>Ask questions about your notes (RAG)</li>
  <li>Voice-to-text support</li>
</ul>
<h3>📊 3. Personal Finance Tracker</h3>
<ul>
  <li>Track expenses and income</li>
  <li>Visual reports and insights</li>
  <li>Set budgets and goals</li>
  <li>Multi-currency support</li>
</ul>
<h3>🎯 4. Habit Tracker</h3>
<ul>
  <li>Daily/weekly habit tracking</li>
  <li>Streaks and reminders</li>
  <li>Progress charts and motivation</li>
</ul>`
  },
  {
    id: 'note-2',
    title: 'Meeting Notes - Oct 28',
    icon: '📅',
    category: 'Work',
    favorite: false,
    pinned: true,
    deleted: false,
    displayDate: 'Oct 28, 2025',
    createdAt: daysAgoHours(1),
    updatedAt: hoursAgo(4),
    preview: 'Discussed the roadmap, key features and next steps for the product...',
    content: `<p>Meeting Notes - October 28</p>
<ul class="list-disc pl-6 space-y-1 my-2 text-[#42577D]">
  <li>Review product roadmap</li>
  <li>Finalize core note editor experience</li>
  <li>Discuss search, tagging, and offline persistence</li>
  <li>Assign next implementation tasks</li>
</ul>`
  },
  {
    id: 'note-3',
    title: 'Daily Journal',
    icon: '✏️',
    category: 'Personal',
    favorite: true,
    pinned: false,
    deleted: false,
    createdAt: daysAgoHours(2),
    updatedAt: daysAgoHours(1, 3),
    preview: 'Grateful for the little things. Today was a productive day with good progress...',
    content: `<p>Today was a productive day. I made progress on a few important tasks, learned something new, and made time to reflect.</p>
<p class="font-semibold mt-3 mb-1">Gratitude:</p>
<ul class="list-disc pl-6 space-y-1 my-2 text-[#42577D]">
  <li>A fresh start</li>
  <li>Good conversations</li>
  <li>Progress on personal goals</li>
</ul>`
  },
  {
    id: 'note-4',
    title: 'Learning - Spring Boot',
    icon: '📖',
    category: 'Learning',
    favorite: false,
    pinned: false,
    deleted: false,
    createdAt: daysAgoHours(4),
    updatedAt: daysAgoHours(2, 2),
    preview: 'Key concepts: Dependency Injection, REST APIs, Profiles, Actuator...',
    content: `<p class="font-bold text-lg mb-2">Spring Boot Learning Notes</p>
<ul class="list-disc pl-6 space-y-1 my-2 text-[#42577D]">
  <li>Dependency Injection & Inversion of Control</li>
  <li>REST API design and Spring MVC</li>
  <li>Profiles and externalized configuration</li>
  <li>Actuator and health checks</li>
  <li>Exception handling and ControllerAdvice</li>
  <li>Testing with JUnit and Mockito</li>
</ul>`
  },
  {
    id: 'note-5',
    title: 'Travel Plans',
    icon: '✈️',
    category: 'Personal',
    favorite: false,
    pinned: false,
    deleted: false,
    createdAt: daysAgoHours(5),
    updatedAt: daysAgoHours(3, 2),
    preview: 'Bangalore → Goa\nCheck flights, stay options and itinerary...',
    content: `<p class="font-bold text-lg mb-2">Travel Plans — Bangalore → Goa</p>
<ul class="list-disc pl-6 space-y-1 my-2 text-[#42577D]">
  <li>Compare flight options vs overnight sleeper train</li>
  <li>Book beachside resort accommodation in South Goa</li>
  <li>Plan water sports and local heritage sightseeing</li>
  <li>Prepare travel packing checklist</li>
</ul>`
  },
  {
    id: 'note-6',
    title: 'Shopping List',
    icon: '☑️',
    category: 'Others',
    favorite: false,
    pinned: false,
    deleted: false,
    createdAt: daysAgoHours(6),
    updatedAt: daysAgoHours(4, 2),
    preview: '• Milk  • Bread  • Eggs  • Fruits',
    content: `<p class="font-bold text-lg mb-2">Weekly Grocery Shopping List</p>
<ul class="list-disc pl-6 space-y-1 my-2 text-[#42577D]">
  <li>Milk (2 cartons)</li>
  <li>Sourdough bread</li>
  <li>Free-range eggs (1 dozen)</li>
  <li>Seasonal fruits (Apples, Berries, Bananas)</li>
  <li>Greek yogurt and granola</li>
</ul>`
  },
  {
    id: 'note-7',
    title: 'Work Tasks',
    icon: '💼',
    category: 'Work',
    favorite: false,
    pinned: false,
    deleted: false,
    createdAt: daysAgoHours(6),
    updatedAt: daysAgoHours(4, 3),
    preview: 'Plan sprint tasks, review open pull requests, and track action items...',
    content: `<p class="font-bold text-lg mb-2">Sprint Backlog & Action Items</p>
<ul class="list-disc pl-6 space-y-1 my-2 text-[#42577D]">
  <li>Review open pull requests on the notes service</li>
  <li>Prepare sprint backlog for upcoming release</li>
  <li>Document release notes & deployment checklist</li>
</ul>`
  },
  {
    id: 'note-8',
    title: 'Book Recommendations',
    icon: '📚',
    category: 'Work',
    favorite: false,
    pinned: false,
    deleted: false,
    createdAt: daysAgoHours(7),
    updatedAt: daysAgoHours(5, 2),
    preview: 'Books to explore this month: Atomic Habits, Deep Work, Pragmatic Programmer...',
    content: `<p class="font-bold text-lg mb-2">Recommended Reading List</p>
<ul class="list-disc pl-6 space-y-1 my-2 text-[#42577D]">
  <li><strong>Atomic Habits</strong> by James Clear</li>
  <li><strong>Deep Work</strong> by Cal Newport</li>
  <li><strong>The Pragmatic Programmer</strong> by Andy Hunt and Dave Thomas</li>
  <li><strong>Designing Data-Intensive Applications</strong> by Martin Kleppmann</li>
</ul>`
  },
  {
    id: 'note-9',
    title: 'Weekend Ideas',
    icon: '✨',
    category: 'Ideas',
    favorite: false,
    pinned: false,
    deleted: false,
    createdAt: daysAgoHours(8),
    updatedAt: daysAgoHours(5, 4),
    preview: 'Things to try over the weekend: explore a new cafe, creative project, nature walk...',
    content: `<p class="font-bold text-lg mb-2">Weekend Adventures & Activities</p>
<ul class="list-disc pl-6 space-y-1 my-2 text-[#42577D]">
  <li>Explore a specialty coffee roaster</li>
  <li>Start a small open-source creative project</li>
  <li>Go for an early morning walk at the botanical park</li>
  <li>Read for two hours without device distractions</li>
</ul>`
  },
  {
    id: 'note-10',
    title: 'Important Links',
    icon: '🔗',
    category: 'Work',
    favorite: false,
    pinned: false,
    deleted: false,
    createdAt: daysAgoHours(9),
    updatedAt: daysAgoHours(6, 2),
    preview: 'Useful resources and reference links for team projects and documentation...',
    content: `<p class="font-bold text-lg mb-2">Team & Project Resources</p>
<ul class="list-disc pl-6 space-y-1 my-2 text-[#42577D]">
  <li><a href="#" class="text-blue-600 underline">API Architecture Documentation</a></li>
  <li><a href="#" class="text-blue-600 underline">Design System Figma Library</a></li>
  <li><a href="#" class="text-blue-600 underline">CI/CD Pipeline Dashboard</a></li>
  <li><a href="#" class="text-blue-600 underline">Incident Response Playbook</a></li>
</ul>`
  },
  {
    id: 'note-11',
    title: 'Health & Fitness',
    icon: '🏃',
    category: 'Personal',
    favorite: true,
    pinned: false,
    deleted: false,
    createdAt: daysAgoHours(10),
    updatedAt: daysAgoHours(6, 4),
    preview: 'Workout routine and weekly goals: daily steps, hydration, mobility...',
    content: `<p class="font-bold text-lg mb-2">Weekly Wellness Goals</p>
<ul class="list-disc pl-6 space-y-1 my-2 text-[#42577D]">
  <li>Complete 4 strength training sessions</li>
  <li>Target 10,000 steps daily average</li>
  <li>Hydrate with at least 3 liters of water per day</li>
  <li>15 minutes evening mobility and stretching</li>
</ul>`
  },
  {
    id: 'note-12',
    title: 'Sprint Planning & Review',
    icon: '📋',
    category: 'Work',
    favorite: false,
    pinned: false,
    deleted: false,
    createdAt: daysAgoHours(11),
    updatedAt: daysAgoHours(7, 2),
    preview: 'Sprint goals, team velocity, and milestone targets for upcoming deployment...',
    content: `<p class="font-bold text-lg mb-2">Sprint Goals & Milestones</p>
<ul class="list-disc pl-6 space-y-1 my-2 text-[#42577D]">
  <li>Frontend polish and visual matching</li>
  <li>Offline persistence resilience</li>
  <li>Performance benchmarks under 50ms render</li>
  <li>End-to-end integration walkthrough</li>
</ul>`
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Welcome to NoteNest',
    message: 'Your notes stay automatically saved to local storage on this device.',
    timestamp: 'Just now',
    read: false,
    type: 'info'
  },
  {
    id: 'notif-2',
    title: 'Keyboard Shortcuts Ready',
    message: 'Press ⌘K to search, ⌘N to create a note, and ⌘S to force save.',
    timestamp: '1h ago',
    read: false,
    type: 'tip'
  },
  {
    id: 'notif-3',
    title: 'Offline Storage Active',
    message: 'All your changes are synced instantly with fallback memory store.',
    timestamp: '2h ago',
    read: true,
    type: 'success'
  }
];
