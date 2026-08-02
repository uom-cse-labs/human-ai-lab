import type { Publication, FocusArea, TeamMember, NewsItem } from './types';

export const PUBLICATIONS: Publication[] = [
  {
    id: 'pub-1',
    category: 'INTELLIGENCE',
    title: 'Inferring mood-while-eating with smartphone sensing and community-based model personalization',
    authors: 'Wageesha Bangamuarachchi, Anju Chamantha, Lakmal Meegahapola, Haeeun Kim, Salvador Ruiz-Correa, Indika Perera, Daniel Gatica-Perez',
    publishedIn: 'ACM Transactions on Computing for Healthcare',
    year: 2025,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
    abstract: 'This study investigates mood during eating using passive smartphone sensing and self-reported data from two large datasets collected in Mexico and eight countries. The results show that generic mood inference models perform poorly in eating-specific contexts, while traditional population-level and user-level personalization methods are limited by context shifts and scarce negative mood labels. To address these challenges, the authors propose a community-based personalization approach that groups similar users, achieving the best mood-while-eating prediction performance with F1 scores of 62.5% (Mexico) and 85.7% (multinational dataset).',
    keyFindings: [
      'Generic mood inference models perform worse when applied to eating-specific contexts.',
      'Traditional population-level and user-level personalization methods struggle due to limited negative mood data.',
      'Community-based personalization improves mood-while-eating prediction accuracy.'
    ],
    citation: 'Bangamuarachchi, W., Chamantha, A., Meegahapola, L., Kim, H., Ruiz-Correa, S., Perera, I., & Gatica-Perez, D. (2025). Inferring Mood-While-Eating with Smartphone Sensing and Community-Based Model Personalization. ACM Transactions on Computing for Healthcare, 6(3), Article 35, 1–35.'
  },
  {
    id: 'pub-2',
    category: 'INTELLIGENCE',
    title: 'Large Language Model-Based Student Intent Classification for Intelligent Tutoring Systems',
    authors: 'Malshan Keerthichandra, Tharoosha Vihidun, Shanuka Lakshan, Indika Perera',
    publishedIn: '2024 9th International Conference on Information Technology Research (ICITR)',
    year: 2024,
    abstract: 'This paper presents an intent classification module for the Learner-Aware AI (LAAI) intelligent tutoring system to identify diverse student behaviors during interactions. The authors introduce the LAAIIntentD dataset and fine-tune a lightweight large language model using LoRA techniques for efficient intent recognition. The proposed LAAI-intent-classifier outperforms GPT-based approaches in overall Precision, Recall, and F1-score, demonstrating its effectiveness for personalized educational AI systems.',
    keyFindings: [
      'A custom LAAIIntentD dataset was developed for student intent classification in intelligent tutoring systems.',
      'LoRA-based fine-tuning produced a lightweight intent classifier with improved Precision, Recall, and F1-score compared to GPT-based methods.',
      'The proposed model provides an efficient and scalable solution for personalized AI-driven educational interactions.'
    ],
    citation: 'M. Keerthichandra, T. Vihidun, S. Lakshan, and I. Perera, “Large Language Model-Based Student Intent Classification for Intelligent Tutoring Systems,” in 2024 9th International Conference on Information Technology Research (ICITR), IEEE, 2024.'
  },
  {
    id: 'pub-3',
    category: 'ETHICS',
    title: 'Capsule Network-Based Dynamic Routing to Detect Hate Speech on Twitter',
    authors: 'Suresha Perera, Indika Perera, Supunmali Ahangama, S. Rajasingham',
    publishedIn: '6th International Conference on Advanced Research in Computing (ICARC)',
    year: 2026,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
    abstract: 'This paper investigates the use of capsule networks for detecting hate speech on Twitter by classifying social media content into hate and non-hate categories. The study compares the proposed embedded capsule network model with convolutional neural networks and traditional machine learning approaches on benchmark datasets. The capsule network achieved 93% accuracy, demonstrating strong performance and potential for improving automated hate speech detection systems.',
    keyFindings: [
      'Capsule networks can effectively handle Twitter-based hate speech classification tasks.',
      'The proposed embedded capsule network model outperformed CNN and traditional machine learning approaches.',
      'The model achieved 93% accuracy on widely used hate speech benchmark datasets.'
    ],
    citation: 'S. Perera, I. Perera, S. Ahangama, and S. Rajasingham, “Capsule Network-Based Dynamic Routing to Detect Hate Speech on Twitter,” in 2026 6th International Conference on Advanced Research in Computing (ICARC), IEEE, 2026.'
  },
  {
    id: 'pub-4',
    category: 'DESIGN',
    title: 'A Framework for Adaptive User Interface Generation based on User Behavioural Patterns',
    authors: 'Nilanka Rathnayake, Dulani Meedeniya, Indika Perera, Anuradha Welivita',
    publishedIn: 'Moratuwa Engineering Research Conference (MERCon)',
    year: 2019,
    abstract: 'This paper proposes a generic adaptive user interface (AUI) platform that automatically generates personalized web interfaces by analyzing user behavior patterns using machine learning. The system enables automated user behavior capturing, data processing, analysis, and dynamic UI rendering to provide production-level adaptivity. The proposed platform improves user experience, achieving high usability scores and demonstrating the effectiveness of machine learning-driven UI customization.',
    keyFindings: [
      'A machine learning-based AUI platform was developed for automatic user interface customization.',
      'The AdaBoost classifier achieved 100% accuracy in predicting large UI components and user scenarios.',
      'The adaptive interface improved usability compared to non-adaptive interfaces, achieving higher SUS scores.'
    ],
    citation: 'N. Rathnayake, D. Meedeniya, I. Perera, and A. Welivita, “A Framework for Adaptive User Interface Generation based on User Behavioural Patterns,” in 2019 Moratuwa Engineering Research Conference (MERCon), IEEE, 2019.'
  },
  {
    id: 'pub-5',
    category: 'ROBOTICS',
    title: 'Real-time multimodal ADL recognition using convolution neural networks',
    authors: 'Danushka Madhuranga, Rivindu Madushan, Chathuranga Siriwardane, Kutila Gunasekera',
    publishedIn: 'The Visual Computer',
    year: 2021,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
    abstract: 'This paper presents an activity recognition system for Activities of Daily Living (ADLs) using combined depth video and audio modalities to improve privacy and recognition performance. The authors adapt CNN architectures for depth-based video analysis by extracting silhouettes and modifying networks to handle noisy and limited depth datasets. The proposed multimodal approach enables accurate ADL recognition and is extended into a real-time recognition system for ambient assisted living applications.',
    keyFindings: [
      'A multimodal ADL recognition system combining depth video and audio data was proposed.',
      'CNN-based methods were adapted for depth data using silhouette extraction and shallower architectures.',
      'The proposed approach enables privacy-preserving and real-time activity recognition for assisted living systems.'
    ],
    citation: 'D. Madhuranga, R. Madushan, C. Siriwardane, and K. Gunasekera, “Real-time multimodal ADL recognition using convolution neural networks,” The Visual Computer, vol. 37, no. 6, pp. 1263–1276, 2021.'
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
    leadResearcher: 'TBA'
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
    leadResearcher: 'TBA'
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
    leadResearcher: 'TBA'
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
    leadResearcher: 'TBA'
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Prof. Indika Perera',
    role: 'DIRECTOR, AIM',
    title: 'DIRECTOR, AIM',
    bio: 'Prof. Rohan Silva has over 25 years of research experience in distributed systems and intelligent software architectures. He spearheaded the creation of AIM to unite machine learning models with human behavioral sciences. He previously worked as an advisor to the Ministry of Technology on state-level infrastructure digitization and currently chairs the University\'s AI Task Force.',
    expertise: 'Expertise in Multi-Agent Systems and Cognitive Architecture.',
    imageUrl: 'https://res.cloudinary.com/bajgh4wo/image/upload/v1784541907/prof_indika_bqphbe.jpg'
  },
  {
    id: 'member-2',
    name: 'Dr. Anjali Kumara',
    role: 'LEAD RESEARCHER',
    title: 'LEAD RESEARCHER',
    bio: 'Dr. Anjali Kumara completed her PhD at Oxford University focusing on the socio-technical impacts of algorithmic automation in developing economies. She serves on international AI policy panels and actively collaborates with civic tech groups to draft human-centered AI legislation. Her research focuses on the intersection of data ethics, post-colonial geography, and public policy.',
    expertise: 'Specializing in AI Ethics and Policy in the Global South.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 'member-3',
    name: 'Dr. Tharindu Wick',
    role: 'PRINCIPAL INVESTIGATOR',
    title: 'PRINCIPAL INVESTIGATOR',
    bio: 'Dr. Tharindu Wick leads the Robotics and Human-Machine Interface labs at the University of Moratuwa. His research concentrates on developing low-cost, lightweight sensors and physical actuators that enable safer, more collaborative interactions between elders, field workers, and autonomous machinery. He is a passionate advocate for physical-first interface designs.',
    expertise: 'Pioneering work in Affective Computing and User Experience.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 'member-4',
    name: 'Prof. Emeritus Siri',
    role: 'SENIOR ADVISOR',
    title: 'SENIOR ADVISOR',
    bio: 'Prof. Siri is a pioneer of computer science in Sri Lanka, having introduced the country\'s first software engineering curricula in the 1980s. His current advisory focus is on archiving and preserving local linguistic histories and cultural databases using decentralized technologies, ensuring future generations have clean, representative datasets to train localized systems.',
    expertise: 'Foundational contributor to AI research in Sri Lanka.',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400'
  }
];

export const NEWS: NewsItem[] = [
  {
    id: 'news-1',
    date: 'MAY 15, 2024',
    title: 'AIM hosts International Workshop on Responsible AI',
    content: 'Bringing together scholars from across Southeast Asia to discuss regulatory frameworks.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
    details: 'The event hosted 120 policy makers, technologists, and researchers at the Moratuwa University Auditorium. Keynote discussions centered around creating flexible regional standards for AI deployment, auditing bias in agricultural automation tools, and coordinating public-sector data standards across SAARC nations.'
  },
  {
    id: 'news-2',
    date: 'APRIL 2, 2024',
    title: 'Dr. Anjali Kumara receives Presidential Award',
    content: 'Recognized for contributions to ethical data mining in public health sectors.',
    imageUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=600',
    details: 'The Presidential Commission on Science & Technology awarded Dr. Kumara for her groundbreaking "HITL Healthcare-Audit Protocol". The framework is currently deployed in regional rural clinics to monitor diagnostics equality, protecting patient data sovereignty while ensuring fair algorithmically-driven vaccine distribution.'
  }
];
