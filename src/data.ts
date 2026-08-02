import type { Publication, FocusArea, TeamMember, StudentResearcher, Alumni } from './types';
import teamData from './data.json';

export const PUBLICATIONS: Publication[] = [
  {
    id: 'pub-1',
    category: 'INTELLIGENCE',
    title: '"Cross-Cultural Bias in Sentiment Analysis: A Sri Lankan Case Study"',
    authors: 'Chen, A., Taylor, J., & Patel, R.',
    publishedIn: 'ICLR 2024, Vienna',
    year: 2024,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
    abstract: 'Sentiment analysis models trained primarily on Western datasets exhibit severe degradation when applied to South Asian contexts, particularly in Sri Lanka. This research details how local linguistic nuances, sarcasm forms, and cultural codes alter emotional expression. We introduce "LankaSent", a culture-sensitive tokenization and training corpus that reduces cultural bias in machine learning by 34% while improving contextual accuracy.',
    keyFindings: [
      'Identified 14 specific cultural linguistic markers in Sri Lankan English and Sinhala-Tamil code-switching ignored by standard LLMs.',
      'Constructed a benchmark dataset of 50,000 human-annotated local statements for training.',
      'Demonstrated that adjusting word embeddings with local socio-cultural context vectors increases sentiment classification F1-score from 0.62 to 0.89.'
    ],
    citation: 'Chen, A., Taylor, J., & Patel, R. (2024). Cross-Cultural Bias in Sentiment Analysis: A Sri Lankan Case Study. In Proceedings of the International Conference on Learning Representations (ICLR 2024), Vienna, Austria.'
  },
  {
    id: 'pub-2',
    category: 'ETHICS',
    title: '"Human-in-the-loop: Ethical Frameworks for Urban Planning AI"',
    authors: 'Chen, A. & White, I.',
    publishedIn: 'Nature Machine Intelligence, Vol 12',
    year: 2024,
    abstract: 'Autonomous algorithmic decision-making in urban rezoning and infrastructure allocation often exacerbates historic socio-economic disparities. This paper introduces an actionable "Human-in-the-Loop" (HITL) ethical framework designed for municipal planning departments in developing economies. We detail a participatory governance pipeline that integrates machine learning simulations with public assembly inputs to foster equitable resource distribution.',
    keyFindings: [
      'Proposed a multi-stakeholder mathematical constraint optimization model that guarantees a baseline resource equity index.',
      'Conducted a comparative trial across three developing metro regions, showing a 40% increase in public satisfaction metrics with algorithmic suggestions.',
      'Formulated the "Participatory AI Charter" containing audit guidelines for civil servants using predictive urban planning systems.'
    ],
    citation: 'Chen, A., & White, I. (2024). Human-in-the-loop: Ethical Frameworks for Urban Planning AI. Nature Machine Intelligence, 12(4), 312-325.'
  },
  {
    id: 'pub-3',
    category: 'DESIGN',
    title: '"Tangible Interfaces for Elder Care via Assistive Robotics"',
    authors: 'Davis, A., et al.',
    publishedIn: 'CHI Conference 2023',
    year: 2023,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=1200',
    abstract: 'As populations age, particularly in South Asia where family-based care is the cultural cornerstone, assistive robotic technologies must align with domestic physical rituals. This paper presents the design and evaluation of "Ayu-Node", a tangible wooden control interface integrated into domestic helper robots. Rather than screens or voice controls, Ayu-Node uses tactile physical geometries that mimic traditional Sri Lankan domestic utilities, making elder interaction natural, non-threatening, and highly intuitive.',
    keyFindings: [
      'Developed and user-tested 5 physical interaction metaphors among elder demographics (ages 70-90) with no previous computer literacy.',
      'Proved that wooden tangible interfaces reduce task anxiety by 55% compared to tablet-based touch screen interfaces.',
      'Maintained 94% task completion rates for daily medical reminders and micro-interaction prompts via assistive domestic devices.'
    ],
    citation: 'Davis, A., Green, S., Parker, O., & Taylor, J. (2023). Tangible Interfaces for Elder Care via Assistive Robotics. In Proceedings of the ACM CHI Conference on Human Factors in Computing Systems (CHI 2023).'
  },
  {
    id: 'pub-4',
    category: 'INTELLIGENCE',
    title: '"Low-Resource Language LLM Fine-Tuning: Methods and Sinhalese Benchmarks"',
    authors: 'Patel, R., Taylor, J., & Chen, A.',
    publishedIn: 'AAAI 2024, Vancouver',
    year: 2024,
    abstract: 'Fine-tuning large language models on low-resource morphological languages like Sinhalese often causes model collapse or severe vocabulary dilution. We present a novel Parameter-Efficient Fine-Tuning (PEFT) framework using localized adapters trained on custom syntactic trees. We introduce "LankaGLUE", the first comprehensive benchmark suite for evaluating Sinhala language understanding, featuring reading comprehension, sentiment analysis, and semantic similarity tasks.',
    keyFindings: [
      'Mitigated vocabulary dilution by implementing a custom morphological sub-word tokenizer for Sinhalese.',
      'Validated LankaGLUE benchmarks across 8 open-weight models, showcasing standard fine-tuning limitations.',
      'Achieved a 22% improvement in reasoning tasks in low-resource environments using custom localized adapters.'
    ],
    citation: 'Patel, R., Taylor, J., & Chen, A. (2024). Low-Resource Language LLM Fine-Tuning: Methods and Sinhalese Benchmarks. In Proceedings of the AAAI Conference on Artificial Intelligence (AAAI 2024), Vancouver, Canada.'
  },
  {
    id: 'pub-5',
    category: 'ROBOTICS',
    title: '"Collaborative Kinematics: Safe Multi-Agent Navigation in Agricultural Labs"',
    authors: 'Taylor, J. & Chen, A.',
    publishedIn: 'IEEE Transactions on Robotics, Vol 39',
    year: 2023,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
    abstract: 'In high-density indoor agricultural setups in tropical nations, collaborative robotic fleets must operate alongside human farm workers. We detail a novel kinematics planner using localized multi-agent reinforcement learning with safety guarantees. Our system handles unexpected obstacle avoidance (such as dynamic human steps or falling produce) in tight, unstructured greenhouse lanes without requiring extensive high-power visual processing.',
    keyFindings: [
      'Constructed a lightweight 2D spatial occupancy grid model running on edge microcontrollers (under 5W consumption).',
      'Tested fleet efficiency across a 1200-hour operational simulation, reporting zero collisions with human workers.',
      'Enhanced fleet-wide navigation efficiency by 18% compared to standard decentralized path planners.'
    ],
    citation: 'Taylor, J., & Chen, A. (2023). Collaborative Kinematics: Safe Multi-Agent Navigation in Agricultural Labs. IEEE Transactions on Robotics, 39(6), 1482-1498.'
  }
];

export const FOCUS_AREAS: FocusArea[] = [
  {
    id: 'focus-1',
    title: 'Human-Robot Interaction',
    type: 'CORE THEME',
    description: 'Developing social intelligences that understand non-verbal cues and emotional context in collaborative workspace.',
    iconName: 'robot',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
    bgClass: 'bg-stone-900',
    textClass: 'text-white',
    detailedDescription: 'The Human-Robot Interaction (HRI) theme focuses on transitioning robots from isolated industrial assets to safe, empathetic, and collaborative teammates. Our researchers study the subtle physical and non-verbal interfaces of collaboration—such as micro-gestures, gaze-tracking, spatial pacing, and posture—to design systems that naturally adjust to their human partners. By combining computer vision, force-feedback, and real-time behavioral adaptation, we build interfaces that feel intuitive and secure.',
    projects: [
      'Ayu-Node: Tangible wooden controls for domestic elder care robots.',
      'Kinesics-AI: Multi-agent spatial awareness models for collaborative lab spaces.',
      'Gaze-Sync: Predicting human manipulation intentions in assembly lines through continuous gaze-tracking.'
    ],
    leadResearcher: 'Dr. Jordan Taylor'
  },
  {
    id: 'focus-2',
    title: 'Cognitive Modeling',
    type: 'CORE THEME',
    description: 'Simulating human decision-making patterns to improve the predictability of AI assistants.',
    iconName: 'brain',
    bgClass: 'bg-[#faf3e5]',
    textClass: 'text-[#1e1b13]',
    detailedDescription: 'Predictable and safe artificial systems must be built on mathematically robust models of human cognition. The Cognitive Modeling core research path builds operational models of human attention, memory retention, decision fatigue, and risk aversion. Instead of relying on general statistical averages, our models incorporate demographic, cultural, and environmental parameters to predict how specific human groups interact with algorithmic suggestions, ensuring smoother technology transitions.',
    projects: [
      'Assistive-Predict: Simulating doctor decision loops to flag automated diagnostic errors.',
      'Cognitive-Load Tracker: Real-time calculation of human user mental fatigue using low-intrusive behavioral markers.',
      'Decision-Bridges: Aligning LLM reasoning hierarchies with human heuristic patterns.'
    ],
    leadResearcher: 'Dr. Alex Chen'
  },
  {
    id: 'focus-3',
    title: 'Algorithmic Ethics',
    type: 'CORE THEME',
    description: 'Auditing local datasets for cultural biases and developing mitigation frameworks for public policy.',
    iconName: 'shield',
    bgClass: 'bg-[#f5e1aa]',
    textClass: 'text-[#52461d]',
    detailedDescription: 'Algorithms imported from Western tech hubs often amplify historic and cultural imbalances when applied in the Global South. The Algorithmic Ethics division audits local classification datasets, tests text embeddings for cultural biases, and defines participatory regulatory blueprints for municipal authorities. We collaborate directly with civil organizations and policy-makers to ensure that deployed AI tools protect marginal populations and distribute resources fairly.',
    projects: [
      'LankaSent Bias Audit: Benchmarking major NLP models for South Asian gender and geographic bias.',
      'Ethical Rezoning Charter: Participatory templates for public infrastructure machine-learning tools.',
      'AI-Impact Matrix: Quantifying the socio-economic displacement of automated services in regional industries.'
    ],
    leadResearcher: 'Dr. Alex Chen'
  },
  {
    id: 'focus-4',
    title: 'Explainable Systems',
    type: 'NEW INITIATIVE',
    description: 'Transforming "black-box" models into transparent tools that medical professionals can trust.',
    iconName: 'eye',
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=1200',
    bgClass: 'bg-stone-950',
    textClass: 'text-white',
    detailedDescription: 'The Explainable Systems initiative bridges the gap between raw predictive power and actionable human comprehension. We develop novel visualization interfaces, semantic attribution frameworks, and real-time step-by-step logic maps that show exactly how an artificial network reached a specific classification. Focusing heavily on critical applications like oncology diagnostics, localized climate predictions, and credit access, our goal is to eliminate opaque "black-box" decision loops.',
    projects: [
      'Med-Explain: Clinical visualizers highlighting precise radiology features driving diagnostic classifications.',
      'Heuristic Maps: Translating neural network weight shifts into high-level human semantic concepts.',
      'Explainable-Water: Transparent predictive models for regional reservoir discharge and drought management.'
    ],
    leadResearcher: 'Prof. Emeritus Morgan Smith'
  }
];

export const TEAM_MEMBERS: TeamMember[] = teamData.teamMembers;

export const FOUNDING_RAS: TeamMember[] = teamData.foundingRAs;

export const RESEARCH_ASSISTANTS: TeamMember[] = (teamData as any).researchAssistants || [];

export const STUDENT_RESEARCHERS: StudentResearcher[] = teamData.studentResearchers;

export const ALUMNI: Alumni[] = teamData.alumni;
