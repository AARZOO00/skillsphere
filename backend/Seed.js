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
    description: `We are a growing D2C brand looking for an experienced full-stack developer to build our e-commerce platform from scratch.\n\nWhat you'll build:\n• Product catalog with advanced filters and search\n• Shopping cart and checkout flow\n• Razorpay payment integration\n• Order management dashboard\n• Customer account portal\n• Admin panel for inventory management\n• SEO-optimized pages\n• Mobile-first responsive design\n\nTech stack preference: React.js, Node.js, MongoDB, Redis for caching, AWS S3 for file uploads.`,
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
    description: `HealthTrack is looking for a skilled React Native developer to build our patient management mobile app.\n\nKey features:\n• Patient registration and appointment booking\n• Doctor-patient video consultation (WebRTC)\n• Medical records and prescription management\n• Push notifications for reminders\n• Real-time chat between doctor and patient\n• Health metrics tracking with charts\n• Integration with wearable devices API\n\nThe app needs to be HIPAA-compliant with proper data encryption.`,
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
    description: `We are building a B2B financial analytics platform and need a talented UI/UX designer to own the entire design system.\n\nProject scope:\n• User research and persona development\n• Information architecture and user flows\n• Wireframes for 25+ screens\n• High-fidelity Figma mockups with a complete design system\n• Interactive prototype for investor demo\n• Component library documentation\n• Handoff-ready assets for developers\n\nOur platform handles complex financial data — we need someone who can make dense information visually digestible.`,
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
    description: `Our HR-tech startup is building an AI-powered resume screening tool to automate the hiring process for large enterprises.\n\nWhat to build:\n• NLP-based resume parser (extract skills, experience, education)\n• Job description matching algorithm using cosine similarity + BERT\n• Ranking and scoring system for candidates\n• REST API with FastAPI\n• PostgreSQL database with optimized queries\n• Docker containerization\n• Simple React dashboard for HR teams\n\nWe process 10,000+ resumes per day so performance is critical.`,
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
    description: `We are migrating our monolithic application to microservices on Kubernetes and need an experienced DevOps engineer.\n\nScope of work:\n• Migrate 8 services to Docker containers\n• Set up Kubernetes cluster on AWS EKS\n• Configure Helm charts for each service\n• Build CI/CD pipeline with GitHub Actions\n• Set up monitoring with Prometheus + Grafana\n• Configure centralized logging with ELK stack\n• Implement auto-scaling policies\n• Security hardening and network policies\n• Complete runbook documentation`,
    requirements: '3+ years DevOps experience. AWS certification preferred. Must have hands-on Kubernetes experience in production.',
    skills: ['Kubernetes', 'AWS EKS', 'Docker', 'Helm', 'GitHub Actions', 'Terraform', 'Prometheus', 'ELK Stack'],
    budget: 85000, budgetType: 'fixed', workType: 'remote',
    experienceLevel: 'expert', deadline: new Date(Date.now() + 20 * 864e5),
    milestones: [],
  },
  {
    title: 'Content Writer — Tech Blog (React, Node.js, Cloud Topics)',
    category: 'writing',
    description: `We run a popular tech blog with 50,000 monthly readers and need a skilled technical content writer.\n\nWhat you'll write:\n• 8 in-depth technical articles per month (2000-3000 words each)\n• Topics: React.js, Node.js, cloud architecture, system design, DevOps\n• Code examples must be tested and working\n• SEO-optimized with proper meta descriptions\n• Articles for both beginners and intermediate developers\n\nExisting articles: https://techblog.example.com\nAll articles must pass Grammarly (90+ score) and Copyscape.`,
    requirements: 'Strong technical background (must be able to write and test code). Portfolio of at least 10 technical articles. Native or near-native English.',
    skills: ['Technical Writing', 'React.js', 'Node.js', 'SEO', 'Content Strategy', 'Markdown'],
    budget: 3500, budgetType: 'hourly', workType: 'remote',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 60 * 864e5),
    milestones: [],
  },
  {
    title: 'Next.js Developer for Real Estate Platform with Map Integration',
    category: 'webdev',
    description: `BuildProp is building the next-generation real estate discovery platform for India.\n\nFeatures to build:\n• Property listing with advanced search (location, price, BHK, amenities)\n• Google Maps integration with property markers\n• Virtual tour integration (360° photos)\n• Mortgage/EMI calculator\n• Saved properties and alerts\n• Agent dashboard and lead management\n• WhatsApp inquiry integration\n• Mobile-responsive with PWA support\n• Server-side rendering for SEO`,
    requirements: 'Next.js experience mandatory. Google Maps API integration experience required. Must understand SSR/SSG patterns.',
    skills: ['Next.js', 'React.js', 'Google Maps API', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'PWA'],
    budget: 65000, budgetType: 'fixed', workType: 'hybrid',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 28 * 864e5),
    milestones: [],
  },
  {
    title: 'Flutter Developer for EdTech App — Live Classes & Quizzes',
    category: 'mobile',
    description: `EduLeap is building an edtech platform for K-12 students. We need a Flutter developer for our mobile app.\n\nKey features:\n• Live class streaming with chat\n• Recorded video lectures with playback controls\n• Interactive quizzes and assessments\n• Progress tracking and analytics\n• Offline content download\n• Parent monitoring dashboard\n• Push notifications for class reminders\n• Gamification — badges, leaderboards, streaks\n\nWe already have the backend APIs ready. You will focus purely on Flutter development.`,
    requirements: '2+ years Flutter experience. Experience with video streaming (HLS/DASH). State management with Bloc or Riverpod.',
    skills: ['Flutter', 'Dart', 'Firebase', 'Bloc', 'HLS Streaming', 'SQLite', 'Push Notifications'],
    budget: 60000, budgetType: 'fixed', workType: 'remote',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 22 * 864e5),
    milestones: [],
  },
  {
    title: 'Digital Marketing Expert — SEO + Performance Marketing (SaaS)',
    category: 'marketing',
    description: `ScaleUp SaaS is looking for a performance marketing expert to drive growth for our B2B project management tool.\n\nResponsibilities:\n• Audit current SEO and create 6-month roadmap\n• Keyword research and on-page optimization\n• Google Ads campaign setup and management (₹2L/month budget)\n• LinkedIn Ads for B2B lead generation\n• Email marketing sequences (Mailchimp)\n• Monthly reporting with KPIs\n• Content calendar for blog SEO\n• CRO analysis and A/B test recommendations\n\nTarget: 40% MoM growth in organic traffic, 50 qualified leads per month.',
    requirements: 'Google Ads certification required. Proven track record with B2B SaaS marketing. Experience with HubSpot or similar CRM.',
    skills: ['SEO', 'Google Ads', 'LinkedIn Ads', 'Email Marketing', 'Analytics', 'HubSpot', 'A/B Testing'],
    budget: 35000, budgetType: 'fixed', workType: 'remote',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 15 * 864e5),
    milestones: [],
  },
  {
    title: 'WordPress + WooCommerce Developer for Fashion E-Commerce',
    category: 'webdev',
    description: `StyleHive is launching an online fashion store targeting millennials. We need a WordPress expert for a full setup.\n\nDeliverables:\n• Custom Elementor theme (design will be provided)\n• WooCommerce setup with 500+ products\n• Payment gateway: Razorpay + UPI\n• Wishlist, size guide, and product comparison\n• Instagram shop integration\n• Loyalty points system plugin\n• Speed optimization (target: <2s load time)\n• SSL, security hardening\n• Basic SEO setup`,
    requirements: 'Strong WordPress + WooCommerce expertise. Portfolio of e-commerce sites required. Experience with Elementor Pro.',
    skills: ['WordPress', 'WooCommerce', 'Elementor', 'Razorpay', 'PHP', 'CSS', 'SEO'],
    budget: 28000, budgetType: 'fixed', workType: 'onsite',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 14 * 864e5),
    milestones: [],
  },
  {
    title: 'Graphic Designer — Brand Identity Package for Startup',
    category: 'design',
    description: `GreenLeaf Organics is a new organic food brand launching in India. We need a complete brand identity created.\n\nDeliverables:\n• Logo (3 concepts + 2 revision rounds)\n• Color palette and typography guide\n• Brand guidelines document (30+ pages)\n• Business card design\n• Letterhead and email signature\n• Social media templates (10 posts)\n• Product label designs (5 products)\n• Packaging design for 3 product lines\n• All files in AI, EPS, PDF, PNG formats`,
    requirements: 'Portfolio with FMCG or food brand identity work preferred. Proficiency in Illustrator and Photoshop. Understanding of print production.',
    skills: ['Illustrator', 'Photoshop', 'Brand Identity', 'Logo Design', 'Packaging Design', 'Typography'],
    budget: 32000, budgetType: 'fixed', workType: 'remote',
    experienceLevel: 'intermediate', deadline: new Date(Date.now() + 12 * 864e5),
    milestones: [],
  },
  {
    title: 'Backend Developer — Node.js Microservices + Socket.IO Real-Time',
    category: 'webdev',
    description: `LogiTrack is building a real-time logistics tracking platform. We need a strong Node.js backend developer.\n\nWhat to build:\n• Microservices architecture (6 services)\n• Real-time GPS tracking with Socket.IO\n• Driver app API (REST + WebSocket)\n• Route optimization using Google Maps Directions API\n• Notification service (SMS via Twilio + email)\n• Admin analytics dashboard APIs\n• Redis for caching and pub/sub\n• JWT + OAuth2 authentication\n• API documentation with Swagger`,
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
    console.log(`🗑  Removed ${deleted.deletedCount} old demo gigs`);

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
    console.log(`✅ Created ${created.length} real job postings!`);
    console.log('\n📋 Jobs added:');
    created.forEach((g,i) => console.log(`  ${i+1}. ${g.title.slice(0,60)}...`));
    console.log('\n🚀 Seed complete! Restart your backend server and refresh /gigs');

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();