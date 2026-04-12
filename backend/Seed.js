// backend/seed.js
// Run: node seed.js
// This adds real job postings to your MongoDB database

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsphere';

// ── Inline schemas (works without importing models) ─────────────
const userSchema = new mongoose.Schema({ name:String, email:String, password:String, role:String, title:String, location:String, rating:Number, reviewCount:Number, completedProjects:Number, isVerified:Boolean, avatar:String }, { strict:false });
const gigSchema  = new mongoose.Schema({ title:String, category:String, description:String, requirements:String, skills:[String], budget:Number, budgetType:String, deadline:Date, experienceLevel:String, workType:String, allowBids:Boolean, visibility:String, status:String, client:mongoose.Schema.Types.ObjectId, bidsCount:Number, milestones:[{ title:String, amount:Number, deadline:Date, description:String }] }, { strict:false, timestamps:true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Gig  = mongoose.models.Gig  || mongoose.model('Gig',  gigSchema);

const REAL_JOBS = [
  {
    title: 'Build Full-Stack E-Commerce Platform with React & Node.js',
    category: 'webdev',
    description: 'We are a building a full-stack e-commerce platform. Features: product catalog with advanced filters, shopping cart and checkout, Razorpay payment integration, order management dashboard, customer account portal, admin inventory panel, SEO-optimized pages, mobile-first responsive design. Tech stack: React.js, Node.js, MongoDB, Redis for caching, AWS S3 for file uploads.',
    requirements: 'Minimum 3 years of React + Node.js experience. Must have built at least 2 production e-commerce sites. Portfolio required.',
    skills: ['React.js', 'Node.js', 'MongoDB', 'Razorpay', 'Redux', 'AWS S3', 'Redis'],
    budget: 75000, budgetType: 'fixed', workType: 'remote',
    experienceLevel: 'expert', deadline: new Date(Date.now() + 21 * 864e5),
    milestones: [
      { title: 'UI Design & Wireframes', amount: 15000, deadline: new Date(Date.now() + 5 * 864e5), description: 'Figma mockups for all pages' },
      { title: 'Backend API + Database', amount: 25000, deadline: new Date(Date.now() + 12 * 864e5), description: 'REST APIs, auth, payment integration' },
      { title: 'Frontend Development',   amount: 20000, deadline: new Date(Date.now() + 18 * 864e5), description: 'All pages with responsive design' },
      { title: 'Testing & Deployment',   amount: 15000, deadline: new Date(Date.now() + 21 * 864e5), description: 'QA, bug fixes, AWS deployment' },
    ],
  },
  {
    title: 'React Native Developer for Healthcare App (iOS + Android)',
    category: 'mobile',
    description: 'HealthTrack is building a patient management mobile app. Key features: Patient registration and appointment booking, doctor-patient video consultation with WebRTC, medical records and prescription management, push notifications for reminders, real-time chat between doctor and patient, health metrics tracking with charts, integration with wearable devices API. The app must be HIPAA-compliant with proper data encryption.',
    requirements: '2+ years React Native experience. Must have published apps on both App Store and Play Store. Experience with healthcare or fintech apps preferred.',
    skills: ['React Native', 'Firebase', 'WebRTC', 'Redux', 'Push Notifications', 'REST API'],
    budget: 95000, budgetType: 'fixed', workType: 'remote',
    experienceLevel: 'expert', deadline: new Date(Date.now() + 30 * 864e5),
    milestones: [
      { title: 'App Architecture + Auth', amount: 20000, deadline: new Date(Date.now() + 8 * 864e5)  },
      { title: 'Core Features',           amount: 40000, deadline: new Date(Date.now() + 20 * 864e5) },
      { title: 'Video Call + Chat',       amount: 20000, deadline: new Date(Date.now() + 26 * 864e5) },
      { title: 'Testing + App Store',     amount: 15000, deadline: new Date(Date.now() + 30 * 864e5) },
    ],
  },
  {
    title: 'Senior UI/UX Designer for FinTech SaaS Dashboard',
    category: 'design',
    description: 'B2B financial analytics platform needs a UI/UX designer to own the design system. Project scope: User research and persona development, information architecture and user flows, wireframes for 25+ screens, high-fidelity Figma mockups with complete design system, interactive prototype for investor demo, component library documentation, handoff-ready assets for developers. Need someone who can make dense financial data visually digestible.',
    requirements: 'Portfolio with SaaS/dashboard design mandatory. Experience with data-heavy interfaces. Proficiency in Figma and FigJam.',
    skills: ['Figma', 'UI Design', 'UX Research', 'Design Systems', 'Prototyping', 'Data Visualization'],
    budget: 55000, budgetType: 'fixed', workType: 'remote',
    experienceLevel: 'expert', deadline: new Date(Date.now() + 18 * 864e5),
    milestones: [
      { title: 'Research + IA',        amount: 12000, deadline: new Date(Date.now() + 5 * 864e5)  },
      { title: 'Wireframes',           amount: 15000, deadline: new Date(Date.now() + 10 * 864e5) },
      { title: 'High-fi Designs',      amount: 18000, deadline: new Date(Date.now() + 15 * 864e5) },
      { title: 'Design System + Docs', amount: 10000, deadline: new Date(Date.now() + 18 * 864e5) },
    ],
  },
  {
    title: 'Python Developer for AI-Powered Resume Screening System',
    category: 'datascience',
    description: 'HR-tech startup building AI-powered resume screening tool. What to build: NLP-based resume parser to extract skills and experience, job description matching algorithm using cosine similarity and BERT, ranking and scoring system for candidates, REST API with FastAPI, PostgreSQL database with optimized queries, Docker containerization, React dashboard for HR teams. Processes 10,000+ resumes per day so performance is critical.',
    requirements: 'Strong Python skills with NLP experience (NLTK, spaCy, or Transformers). Experience with ML model deployment. FastAPI and PostgreSQL knowledge required.',
    skills: ['Python', 'NLP', 'BERT', 'FastAPI', 'PostgreSQL', 'Docker', 'scikit-learn'],
    budget: 1800, budgetType: 'hourly', workType: 'remote',
    experienceLevel: 'expert', deadline: new Date(Date.now() + 25 * 864e5),
    milestones: [
      { title: 'Resume Parser + NLP',    amount: 0, deadline: new Date(Date.now() + 10 * 864e5) },
      { title: 'Matching Algorithm',     amount: 0, deadline: new Date(Date.now() + 18 * 864e5) },
      { title: 'API + Dashboard',        amount: 0, deadline: new Date(Date.now() + 22 * 864e5) },
      { title: 'Testing + Docker',       amount: 0, deadline: new Date(Date.now() + 25 * 864e5) },
    ],
  },
  {
    title: 'DevOps Engineer — Kubernetes Migration & CI/CD Pipeline Setup',
    category: 'devops',
    description: 'Migrating monolithic application to microservices on Kubernetes. Scope: Migrate 8 services to Docker containers, set up Kubernetes cluster on AWS EKS, configure Helm charts for each service, build CI/CD pipeline with GitHub Actions, set up monitoring with Prometheus and Grafana, configure centralized logging with ELK stack, implement auto-scaling policies, security hardening and network policies, complete runbook documentation.',
    requirements: '3+ years DevOps experience. AWS certification preferred. Must have hands-on Kubernetes experience in production.',
    skills: ['Kubernetes', 'AWS EKS', 'Docker', 'Helm', 'GitHub Actions', 'Terraform', 'Prometheus', 'ELK Stack'],
    budget: 85000, budgetType: 'fixed', workType: 'remote',
    experienceLevel: 'expert', deadline: new Date(Date.now() + 20 * 864e5),
    milestones: [],
  },
  {
    title: 'Content Writer — Tech Blog (React, Node.js, Cloud Topics)',
    category: 'writing',
    description: 'Tech blog with 50,000 monthly readers needs technical content writer. Write 8 in-depth articles per month of 2000-3000 words each. Topics: React.js, Node.js, cloud architecture, system design, DevOps. Code examples must be tested and working. SEO-optimized with proper meta descriptions. Articles for both beginners and intermediate developers. All articles must pass Grammarly and Copyscape.',
    requirements: 'Strong technical background (must be able to write and test code). Portfolio of at least 10 technical articles. Native or near-native English.',
    skills: ['Technical Writing', 'React.js', 'Node.js', 'SEO', 'Content Strategy', 'Markdown'],
    budget: 3500, budgetType: 'hourly', workType: 'remote',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 60 * 864e5),
    milestones: [],
  },
  {
    title: 'Next.js Developer for Real Estate Platform with Map Integration',
    category: 'webdev',
    description: 'BuildProp is building the next-generation real estate discovery platform for India. Features: Property listing with advanced search by location, price, BHK, amenities, Google Maps integration with property markers, virtual tour integration with 360 degree photos, mortgage/EMI calculator, saved properties and alerts, agent dashboard and lead management, WhatsApp inquiry integration, mobile-responsive with PWA support, server-side rendering for SEO.',
    requirements: 'Next.js experience mandatory. Google Maps API integration experience required. Must understand SSR/SSG patterns.',
    skills: ['Next.js', 'React.js', 'Google Maps API', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'PWA'],
    budget: 65000, budgetType: 'fixed', workType: 'hybrid',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 28 * 864e5),
    milestones: [],
  },
  {
    title: 'Flutter Developer for EdTech App — Live Classes & Quizzes',
    category: 'mobile',
    description: 'EduLeap is building edtech platform for K-12 students. Need Flutter developer. Key features: Live class streaming with chat, recorded video lectures with playback controls, interactive quizzes and assessments, progress tracking and analytics, offline content download, parent monitoring dashboard, push notifications for class reminders, gamification with badges, leaderboards, and streaks. Backend APIs are ready, focus purely on Flutter development.',
    requirements: '2+ years Flutter experience. Experience with video streaming (HLS/DASH). State management with Bloc or Riverpod.',
    skills: ['Flutter', 'Dart', 'Firebase', 'Bloc', 'HLS Streaming', 'SQLite', 'Push Notifications'],
    budget: 60000, budgetType: 'fixed', workType: 'remote',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 22 * 864e5),
    milestones: [],
  },
  {
    title: 'Digital Marketing Expert — SEO + Performance Marketing (SaaS)',
    category: 'marketing',
    description: 'ScaleUp SaaS needs performance marketing expert for B2B project management tool. Responsibilities: Audit current SEO and create 6-month roadmap, keyword research and on-page optimization, Google Ads campaign setup and management, LinkedIn Ads for B2B lead generation, email marketing sequences with Mailchimp, monthly reporting with KPIs, content calendar for blog SEO, CRO analysis and A/B testing recommendations. Target: 40 percent MoM growth in organic traffic and 50 qualified leads per month.',
    requirements: 'Google Ads certification required. Proven track record with B2B SaaS marketing. Experience with HubSpot or similar CRM.',
    skills: ['SEO', 'Google Ads', 'LinkedIn Ads', 'Email Marketing', 'Analytics', 'HubSpot', 'A/B Testing'],
    budget: 35000, budgetType: 'fixed', workType: 'remote',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 15 * 864e5),
    milestones: [],
  },
  {
    title: 'WordPress + WooCommerce Developer for Fashion E-Commerce',
    category: 'webdev',
    description: 'StyleHive is launching an online fashion store targeting millennials. We need a WordPress expert for a full setup. Custom Elementor theme design, WooCommerce setup with 500+ products, Razorpay and UPI payment integration, wishlist and product comparison features, Instagram shop integration, loyalty points system, load time optimization, SSL and security hardening.',
    requirements: 'Strong WordPress + WooCommerce expertise. Portfolio of e-commerce sites required. Experience with Elementor Pro.',
    skills: ['WordPress', 'WooCommerce', 'Elementor', 'Razorpay', 'PHP', 'CSS', 'SEO'],
    budget: 28000, budgetType: 'fixed', workType: 'onsite',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 14 * 864e5),
    milestones: [],
  },
  {
    title: 'Graphic Designer — Brand Identity Package for Startup',
    category: 'design',
    description: 'GreenLeaf Organics is a new organic food brand launching in India. We need a complete brand identity created. Deliverables: Logo with 3 concepts and 2 revision rounds, color palette and typography guide, brand guidelines document with 30+ pages, business card design, letterhead and email signature, social media templates for 10 posts, product label designs for 5 products, packaging design for 3 product lines, all files in AI, EPS, PDF, PNG formats.',
    requirements: 'Portfolio with FMCG or food brand identity work preferred. Proficiency in Illustrator and Photoshop. Understanding of print production.',
    skills: ['Illustrator', 'Photoshop', 'Brand Identity', 'Logo Design', 'Packaging Design', 'Typography'],
    budget: 32000, budgetType: 'fixed', workType: 'remote',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 12 * 864e5),
    milestones: [],
  },
  {
    title: 'Backend Developer — Node.js Microservices + Socket.IO Real-Time',
    category: 'webdev',
    description: 'LogiTrack is building a real-time logistics tracking platform. We need a strong Node.js backend developer. What to build: Microservices architecture with 6 services, real-time GPS tracking with Socket.IO, driver app API with REST and WebSocket, route optimization using Google Maps Directions API, notification service with SMS via Twilio and email, admin analytics dashboard APIs, Redis for caching and pub/sub, JWT and OAuth2 authentication, API documentation with Swagger.',
    requirements: 'Strong Node.js + Express. Socket.IO experience required. Understanding of microservices patterns. Redis and MongoDB expertise.',
    skills: ['Node.js', 'Express', 'Socket.IO', 'Redis', 'MongoDB', 'Microservices', 'Docker', 'Swagger'],
    budget: 1500, budgetType: 'hourly', workType: 'remote',
    experienceLevel: 'expert', deadline: new Date(Date.now() + 35 * 864e5),
    milestones: [],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Find or create a demo client user
    let client = await User.findOne({ email:'client@skillsphere.com' });
    if (!client) {
      client = await User.create({
        name:'SkillSphere Demo Client', email:'client@skillsphere.com',
        password:'$2a$10$demo', role:'client',
        rating:4.8, reviewCount:47, completedProjects:23,
        isVerified:true, location:'Bangalore, India',
        title:'Product Manager at TechCorp',
      });
      console.log('✅ Demo client user created');
    }

    // Clear existing demo gigs (keep real user gigs)
    const deleted = await Gig.deleteMany({ client: client._id });
    console.log('Removed ' + deleted.deletedCount + ' old demo gigs');

    // Insert new real jobs
    const jobs = REAL_JOBS.map(job => ({
      ...job,
      client:     client._id,
      status:     'open',
      visibility: 'public',
      allowBids:  true,
      bidsCount:  Math.floor(Math.random() * 15),
    }));

    const created = await Gig.insertMany(jobs);
    console.log('Created ' + created.length + ' real job postings!');
    console.log('\nJobs added:');
    created.forEach((g,i) => console.log((i+1) + '. ' + g.title.slice(0,60) + '...'));
    console.log('\nSeed complete! Restart your backend server and refresh /gigs');

  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();