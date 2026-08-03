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
    abstract: 'This study investigates mood during eating using passive smartphone sensing and self-reported data from two large datasets collected in Mexico and eight countries. The results show that generic mood inference models perform poorly in eating-specific contexts, while traditional population-level and user-level personalization methods are limited by context shifts and scarce negative mood labels. To address these challenges, the authors propose a community-based personalization approach that groups similar users, achieving the best mood-while-eating prediction performance with F1 scores of 62.5% (Mexico) and 85.7% (multinational dataset).',
    keyFindings: [
      'Generic mood inference models perform worse when applied to eating-specific contexts.',
      'Traditional population-level and user-level personalization methods struggle due to limited negative mood data.',
      'Community-based personalization improves mood-while-eating prediction accuracy.'
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
    abstract: 'This paper presents an intent classification module for the Learner-Aware AI (LAAI) intelligent tutoring system to identify diverse student behaviors during interactions. The authors introduce the LAAIIntentD dataset and fine-tune a lightweight large language model using LoRA techniques for efficient intent recognition. The proposed LAAI-intent-classifier outperforms GPT-based approaches in overall Precision, Recall, and F1-score, demonstrating its effectiveness for personalized educational AI systems.',
    keyFindings: [
      'A custom LAAIIntentD dataset was developed for student intent classification in intelligent tutoring systems.',
      'LoRA-based fine-tuning produced a lightweight intent classifier with improved Precision, Recall, and F1-score compared to GPT-based methods.',
      'The proposed model provides an efficient and scalable solution for personalized AI-driven educational interactions.'
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
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
    abstract: 'As populations age, particularly in South Asia where family-based care is the cultural cornerstone, assistive robotic technologies must align with domestic physical rituals. This paper presents the design and evaluation of "Ayu-Node", a tangible wooden control interface integrated into domestic helper robots. Rather than screens or voice controls, Ayu-Node uses tactile physical geometries that mimic traditional Sri Lankan domestic utilities, making elder interaction natural, non-threatening, and highly intuitive.',
    keyFindings: [
      'Capsule networks can effectively handle Twitter-based hate speech classification tasks.',
      'The proposed embedded capsule network model outperformed CNN and traditional machine learning approaches.',
      'The model achieved 93% accuracy on widely used hate speech benchmark datasets.'
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
      'A machine learning-based AUI platform was developed for automatic user interface customization.',
      'The AdaBoost classifier achieved 100% accuracy in predicting large UI components and user scenarios.',
      'The adaptive interface improved usability compared to non-adaptive interfaces, achieving higher SUS scores.'
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
    abstract: 'This paper presents an activity recognition system for Activities of Daily Living (ADLs) using combined depth video and audio modalities to improve privacy and recognition performance. The authors adapt CNN architectures for depth-based video analysis by extracting silhouettes and modifying networks to handle noisy and limited depth datasets. The proposed multimodal approach enables accurate ADL recognition and is extended into a real-time recognition system for ambient assisted living applications.',
    keyFindings: [
      'A multimodal ADL recognition system combining depth video and audio data was proposed.',
      'CNN-based methods were adapted for depth data using silhouette extraction and shallower architectures.',
      'The proposed approach enables privacy-preserving and real-time activity recognition for assisted living systems.'
    ],
    citation: 'Taylor, J., & Chen, A. (2023). Collaborative Kinematics: Safe Multi-Agent Navigation in Agricultural Labs. IEEE Transactions on Robotics, 39(6), 1482-1498.'
  }
];

export const FOCUS_AREAS: FocusArea[] = [
  {
    id: 'focus-1',
    title: 'Model Building and Model Engineering',
    type: 'CORE THEME',
    description: 'This area focuses on the design, development, and refinement of mathematical and computational models that underpin intelligent systems. It bridges theoretical foundations with practical engineering to produce robust, scalable, and interpretable models.',
    iconName: 'robot',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
    bgClass: 'bg-stone-900',
    textClass: 'text-white',
    detailedDescription: 'Model Building and Model Engineering encompasses the systematic process of constructing, validating, and optimising mathematical, statistical, and machine learning models for real-world problem solving. Researchers in this area work across the full modelling lifecycle — from problem formulation and data-driven model design to parameter tuning, uncertainty quantification, and model evaluation. Emphasis is placed on developing models that are not only accurate but also computationally efficient, generalizable, and interpretable. Key methodologies include differential equation modelling, probabilistic graphical models, neural architecture design, ensemble methods, and simulation-based modelling. This area serves as the theoretical and methodological backbone for applied research across all other focus areas within the department.',
    projects: [
      'Project 1 (TBA)',
      'Project 2 (TBA)',
      'Project 3 (TBA)'
    ],
    leadResearcher: 'Dr. Jordan Taylor'
  },
  {
    id: 'focus-2',
    title: 'Applied AI with domains',
    type: 'CORE THEME',
    description: 'This area explores the practical deployment of artificial intelligence techniques across diverse application domains including healthcare, logistics, finance, and engineering. It translates AI research into domain-specific solutions that address real-world challenges.',
    iconName: 'brain',
    bgClass: 'bg-[#faf3e5]',
    textClass: 'text-[#1e1b13]',
    detailedDescription: 'Applied AI with Domains focuses on the cross-disciplinary integration of artificial intelligence and machine learning methodologies into specialized fields to solve domain-specific problems. Researchers collaborate with industry partners and domain experts to identify high-impact challenges and develop AI-driven solutions tailored to the constraints and requirements of each application area. Research activities span predictive analytics, computer vision, natural language processing, optimization, and decision support systems deployed within sectors such as transportation, healthcare diagnostics, agricultural monitoring, financial forecasting, and smart manufacturing. A core objective of this area is to ensure that AI solutions are not only technically sound but also practically viable, ethically responsible, and contextually appropriate for real-world deployment.',
    projects: [
      'Project 1 (TBA)',
      'Project 2 (TBA)',
      'Project 3 (TBA)'
    ],
    leadResearcher: 'Dr. Alex Chen'
  },
  {
    id: 'focus-3',
    title: 'AI Governance and Policy making',
    type: 'CORE THEME',
    description: 'This area examines the ethical, regulatory, and policy dimensions of artificial intelligence development and deployment. It aims to produce frameworks and guidelines that ensure AI systems are fair, transparent, accountable, and aligned with societal values.',
    iconName: 'shield',
    bgClass: 'bg-[#f5e1aa]',
    textClass: 'text-[#52461d]',
    detailedDescription: 'AI Governance and Policy Making addresses the growing need for structured oversight of AI systems as they become increasingly embedded in critical societal functions. Research in this area investigates the ethical implications of AI decision-making, the development of fairness and bias mitigation frameworks, transparency and explainability standards, and the design of regulatory instruments suitable for rapidly evolving AI technologies. Interdisciplinary in nature, this area draws from computer science, law, philosophy, economics, and public policy to produce actionable governance models and policy recommendations. Researchers engage with government bodies, standards organisations, and civil society to translate technical insights into policy-relevant outputs, contributing to the responsible and inclusive development of AI at both national and international levels.',
    projects: [
      'Project 1 (TBA)',
      'Project 2 (TBA)',
      'Project 3 (TBA)'
    ],
    leadResearcher: 'Dr. Alex Chen'
  },
  {
    id: 'focus-4',
    title: 'MAS and Applications',
    type: 'NEW INITIATIVE',
    description: 'This area investigates the theory and application of systems composed of multiple interacting autonomous agents capable of cooperative, competitive, or adaptive behaviour. It addresses complex problems where decentralized intelligence and coordination are essential.',
    iconName: 'eye',
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=1200',
    bgClass: 'bg-stone-950',
    textClass: 'text-white',
    detailedDescription: 'Multi-Agent Systems (MAS) and Applications focuses on the design, analysis, and deployment of systems in which multiple autonomous agents — each with their own goals, knowledge, and decision-making capabilities — interact within a shared environment to achieve individual or collective objectives. Research spans foundational topics including agent architectures, communication protocols, negotiation mechanisms, game-theoretic modelling, and emergent behaviour, as well as applied domains such as autonomous vehicle coordination, smart grid management, supply chain optimization, robotic swarms, and distributed simulation environments. A key research challenge addressed in this area is enabling agents to operate effectively under uncertainty, with incomplete information, and in dynamic environments. MAS research at the department aims to develop scalable, robust, and verifiable multi-agent frameworks with direct applicability to complex real-world systems.',
    projects: [
      'Project 1 (TBA)',
      'Project 2 (TBA)',
      'Project 3 (TBA)'
    ],
    leadResearcher: 'Prof. Emeritus Morgan Smith'
  }
];

export const TEAM_MEMBERS: TeamMember[] = teamData.teamMembers;

export const FOUNDING_RAS: TeamMember[] = teamData.foundingRAs;

export const RESEARCH_ASSISTANTS: TeamMember[] = (teamData as any).researchAssistants || [];

export const STUDENT_RESEARCHERS: StudentResearcher[] = teamData.studentResearchers;

export const ALUMNI: Alumni[] = teamData.alumni;
