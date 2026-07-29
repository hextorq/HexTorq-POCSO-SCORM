/*
  POCSO Awareness Module — content data
  Audience: Adolescents (13-17), Tamil Nadu
  Issuing authority: Tamil Nadu Police (demo)
  Total screens designed for ~30 minutes including interactions.
*/

const MODULE_META = {
  title: "Suraksha Kavasam",
  subtitle: "POCSO Awareness — Know Your Rights. Stay Safe. Speak Up.",
  issuingAuthority: "Tamil Nadu Police",
  estimatedMinutes: 30,
  passMark: 80
};

const SCREENS = [
  // ---------------- WELCOME ----------------
  {
    id: "welcome",
    type: "welcome",
    title: "Welcome to Suraksha Kavasam",
    body: [
      "This short course helps you understand the POCSO Act, your right to safety, and what to do if you or someone you know ever feels unsafe.",
      "It takes about 30 minutes. You can pause anytime — your progress is saved automatically on this device.",
      "Everything here is designed to make you feel stronger and more informed, not scared."
    ]
  },

  // ---------------- CHAPTER 1: What is POCSO ----------------
  {
    id: "ch1-intro",
    type: "info",
    chapter: 1,
    chapterTitle: "Understanding POCSO",
    icon: "shield",
    title: "What is the POCSO Act?",
    body: [
      "POCSO stands for the Protection of Children from Sexual Offences Act. It is an Indian law made in 2012 to protect every child and adolescent under 18 years of age from sexual abuse and exploitation.",
      "It exists because every child has the right to grow up safe, respected, and in control of their own body — no exceptions, no matter who the other person is."
    ]
  },
  {
    id: "ch1-reveal",
    type: "reveal",
    chapter: 1,
    title: "Did you know?",
    instruction: "Tap each card to reveal an important fact about POCSO.",
    cards: [
      {
        front: "Who does POCSO protect?",
        back: "Every person under the age of 18, regardless of gender."
      },
      {
        front: "Does the law apply even if the person is known to the child?",
        back: "Yes. Most cases involve someone the child already knows and trusts — a relative, neighbour, family friend, or someone from school. The law applies equally in every case."
      },
      {
        front: "Is it the child's fault if something happens?",
        back: "Never. Responsibility always lies with the adult or older person who behaves wrongly — never with the child."
      },
      {
        front: "Can a child report anonymously?",
        back: "Yes. A child can report through a trusted adult, Childline (1098), or the police without having to face the person alone."
      }
    ]
  },
  {
    id: "ch1-quiz",
    type: "quiz",
    chapter: 1,
    title: "Quick Check: Chapter 1",
    questions: [
      {
        q: "POCSO protects children up to what age?",
        options: ["12 years", "15 years", "18 years", "21 years"],
        correct: 2,
        explain: "POCSO protects every child and adolescent under 18 years of age."
      },
      {
        q: "If something wrong happens, whose fault is it?",
        options: ["The child's fault", "Never the child's fault", "It depends", "No one's fault"],
        correct: 1,
        explain: "Responsibility always belongs to the adult or older person who behaves wrongly — never the child."
      },
      {
        q: "Can you report a problem even if it involves someone you know well?",
        options: ["No, only strangers can be reported", "Yes, the law applies no matter who it is", "Only if a parent agrees", "Only after turning 18"],
        correct: 1,
        explain: "The law protects you no matter who the other person is — known or unknown."
      }
    ]
  },

  // ---------------- CHAPTER 2: Body Safety ----------------
  {
    id: "ch2-intro",
    type: "info",
    chapter: 2,
    chapterTitle: "Your Body, Your Rules",
    icon: "body",
    title: "Understanding Safe, Unsafe, and Confusing Situations",
    body: [
      "Your body belongs to you. No one — including relatives, family friends, seniors, or people in authority — has the right to touch you or make you feel uncomfortable in any way.",
      "Some situations are clearly safe. Some are clearly unsafe. And sometimes, a situation can feel confusing — that confused, uneasy feeling is also a signal worth paying attention to."
    ]
  },
  {
    id: "ch2-sort",
    type: "sort",
    chapter: 2,
    title: "Sort the Situations",
    instruction: "Tap a situation, then tap the box where it belongs: Safe, Unsafe, or Confusing.",
    bins: [
      { id: "safe", label: "Safe" },
      { id: "unsafe", label: "Unsafe" },
      { id: "confusing", label: "Confusing" }
    ],
    items: [
      { text: "A doctor examining you with a parent present, after explaining why", bin: "safe" },
      { text: "Someone asking you to keep a touch a 'secret' from your parents", bin: "unsafe" },
      { text: "A relative offering gifts and wanting to be alone with you often", bin: "confusing" },
      { text: "A friend giving you a high-five", bin: "safe" },
      { text: "Someone touching you in a way that makes you want to move away", bin: "unsafe" },
      { text: "An adult who insists on physical closeness even after you say you're uncomfortable", bin: "unsafe" },
      { text: "A teacher praising your work in front of the class", bin: "safe" },
      { text: "Someone online asking you to send private photos", bin: "unsafe" }
    ]
  },
  {
    id: "ch2-quiz",
    type: "quiz",
    chapter: 2,
    title: "Quick Check: Chapter 2",
    questions: [
      {
        q: "Who has the right to touch you in a way that makes you uncomfortable?",
        options: ["Close relatives", "Elders in the family", "No one", "Only teachers"],
        correct: 2,
        explain: "No one has that right — regardless of age, relationship, or authority."
      },
      {
        q: "If a touch or situation makes you feel confused or uneasy, what should you do?",
        options: ["Ignore the feeling", "Pay attention to it — it's a valid signal", "Wait for it to happen again", "Assume it's normal"],
        correct: 1,
        explain: "That uneasy feeling is real information. It's always okay to act on it."
      }
    ]
  },

  // ---------------- CHAPTER 3: Recognizing Unsafe Situations ----------------
  {
    id: "ch3-intro",
    type: "info",
    chapter: 3,
    chapterTitle: "Recognizing Warning Signs",
    icon: "alert",
    severity: "warning",
    title: "Spotting Red Flags — In Person and Online",
    body: [
      "People who intend harm often build trust slowly before crossing a line. This pattern is called grooming. Knowing the signs helps you recognize a problem early.",
      "The same warning signs apply online — through chat apps, games, or social media."
    ]
  },
  {
    id: "ch3-reveal",
    type: "reveal",
    chapter: 3,
    severity: "warning",
    title: "Common Red Flags",
    instruction: "Tap each card to learn what it means.",
    cards: [
      {
        front: "Special treatment or excessive gifts",
        back: "Someone giving you unusual attention, money, or gifts to create a sense of obligation."
      },
      {
        front: "Asking to keep things secret",
        back: "Any request to hide something from your parents or trusted adults is a warning sign — good relationships don't need secrecy."
      },
      {
        front: "Wanting to be alone with you repeatedly",
        back: "Deliberately creating one-on-one situations, again and again, without a clear reason."
      },
      {
        front: "Online strangers asking for photos or personal details",
        back: "Never share private photos or personal information with anyone online, even if they seem friendly or claim to be your age."
      },
      {
        front: "Making you feel guilty for saying no",
        back: "A person who respects you will accept 'no' without guilt-tripping, pressuring, or punishing you."
      }
    ]
  },
  {
    id: "ch3-match",
    type: "match",
    chapter: 3,
    title: "Match the Warning Sign",
    instruction: "Drag each warning sign on the left onto what it really means on the right.",
    pairs: [
      { left: "Special gifts, unusual attention", right: "Creates a sense of obligation" },
      { left: "Asking you to keep a secret", right: "Good relationships don't need secrecy" },
      { left: "Wanting to be alone with you often", right: "Repeated one-on-one situations, no clear reason" },
      { left: "Guilt-tripping you for saying no", right: "Someone who respects you accepts 'no'" }
    ]
  },
  {
    id: "ch3-quiz",
    type: "quiz",
    chapter: 3,
    title: "Quick Check: Chapter 3",
    questions: [
      {
        q: "Someone online you've never met asks for your photo and address. What is this?",
        options: ["Normal friendliness", "A red flag — never share this information", "Fine if they seem nice", "Only unsafe if they're an adult"],
        correct: 1,
        explain: "Never share personal photos, address, or details with people you don't know in real life."
      },
      {
        q: "A person asks you to keep a special gift a 'secret' from your parents. This is:",
        options: ["A normal surprise", "A warning sign", "Only a problem if it's expensive", "Nothing to worry about"],
        correct: 1,
        explain: "Requests for secrecy from adults or older people are a classic grooming warning sign."
      }
    ]
  },

  // ---------------- CHAPTER 4: What To Do — branching scenario ----------------
  {
    id: "ch4-intro",
    type: "info",
    chapter: 4,
    chapterTitle: "What To Do",
    icon: "action",
    title: "The 3 Steps: Say No · Get Away · Tell",
    body: [
      "If a situation ever feels unsafe or confusing, you can act in three simple steps: say no clearly, get away from the situation, and tell a trusted adult as soon as possible.",
      "Let's walk through a short story to practice this."
    ]
  },
  {
    id: "ch4-scenario",
    type: "scenario",
    chapter: 4,
    title: "Story: Priya's Bus Ride",
    steps: [
      {
        mood: "tense",
        narration: "Priya, 14, takes the same bus home every day. Lately, an adult passenger she doesn't know keeps sitting beside her, even when other seats are free, and touches her arm 'accidentally' each time.",
        question: "What should Priya do first?",
        choices: [
          { text: "Ignore it and hope it stops", correct: false, feedback: "It's better to act early rather than hope an unsafe pattern stops on its own." },
          { text: "Move to another seat or stand near the driver/conductor, and say clearly 'Please don't sit here' if needed", correct: true, feedback: "Correct — moving away and stating a clear boundary is a safe, immediate first step." },
          { text: "Say nothing to avoid a scene", correct: false, feedback: "You are allowed to protect yourself, even if it feels awkward. Your safety matters more than avoiding an awkward moment." }
        ]
      },
      {
        mood: "tense",
        narration: "Priya moves to sit near the conductor. The next day, the same thing feels like it might happen again.",
        question: "What should Priya do next?",
        choices: [
          { text: "Tell a trusted adult — a parent, teacher, or elder sibling — what happened", correct: true, feedback: "Correct. Telling a trusted adult brings support and helps prevent it from happening again — to her or anyone else." },
          { text: "Keep it to herself since nothing 'serious' happened yet", correct: false, feedback: "Even uncomfortable, repeated behaviour is worth reporting — you don't need to wait for something worse to happen." },
          { text: "Confront the passenger alone", correct: false, feedback: "Getting away and telling a trusted adult is safer than confronting the person alone." }
        ]
      },
      {
        mood: "resolved",
        narration: "Priya tells her mother, who takes it seriously and contacts the school and, since it happened on public transport, considers informing the police.",
        question: "How does Priya likely feel after telling someone?",
        choices: [
          { text: "Ashamed for speaking up", correct: false, feedback: "There is nothing to be ashamed of — speaking up is a sign of strength." },
          { text: "Relieved and supported, because the problem is no longer hers to carry alone", correct: true, feedback: "Exactly. Telling a trusted adult means you're no longer facing the situation by yourself." }
        ]
      }
    ]
  },
  {
    id: "ch4-trusted",
    type: "reveal",
    chapter: 4,
    title: "Build Your Trusted Adult List",
    instruction: "Tap each card — think of one real person in your life who fits this description.",
    cards: [
      { front: "Someone in my family I feel safe talking to", back: "This could be a parent, elder sibling, aunt, uncle, or grandparent." },
      { front: "A teacher or school staff member I trust", back: "A class teacher, school counsellor, or the school's Child Protection focal point." },
      { front: "Someone outside my home I trust", back: "A neighbour, family friend, or community elder." },
      { front: "If no one feels close enough right now", back: "Childline (1098) and the police are always available — you don't have to know someone personally to get help." }
    ]
  },

  // ---------------- CHAPTER 5: Reporting & Help ----------------
  {
    id: "ch5-intro",
    type: "info",
    chapter: 5,
    chapterTitle: "Reporting & Getting Help",
    icon: "phone",
    title: "You Are Never Alone",
    body: [
      "Reporting is confidential, it is free, and it is your right. You will not get in trouble for speaking up — the law and the police are there to protect you.",
      "Here are the ways help is always available."
    ]
  },
  {
    id: "ch5-helplines",
    type: "reveal",
    chapter: 5,
    title: "Help Is One Call Away",
    instruction: "Tap each card to learn how it can help you.",
    cards: [
      { front: "Childline — 1098", back: "A free, 24x7, confidential national helpline for children and adolescents in distress." },
      { front: "Police Emergency — 100 / 112", back: "For any situation where you or someone else needs immediate safety help." },
      { front: "Tamil Nadu Police POCSO e-Box", back: "An online reporting facility where a child can report abuse directly and confidentially, without needing to visit a station in person first." },
      { front: "School Child Protection Focal Point", back: "Most schools have a designated trusted staff member trained to handle these concerns sensitively." },
      { front: "What happens after you report?", back: "Trained officers handle your case with privacy and care. You will be supported, not blamed, at every step." }
    ]
  },
  {
    id: "ch5-match",
    type: "match",
    chapter: 5,
    title: "Match the Helpline",
    instruction: "Drag each resource on the left onto what it does on the right.",
    pairs: [
      { left: "Childline — 1098", right: "Free, 24x7 confidential helpline for children" },
      { left: "Police — 100 / 112", right: "Immediate emergency safety help" },
      { left: "TN Police POCSO e-Box", right: "Confidential online reporting, no station visit needed" },
      { left: "School Child Protection Focal Point", right: "A trusted, trained staff member at school" }
    ]
  },
  {
    id: "ch5-quiz",
    type: "quiz",
    chapter: 5,
    title: "Quick Check: Chapter 5",
    questions: [
      {
        q: "What is the Childline helpline number?",
        options: ["100", "1098", "112", "1930"],
        correct: 1,
        explain: "1098 is the free, 24x7 Childline helpline for children and adolescents."
      },
      {
        q: "Will you get in trouble for reporting a genuine concern?",
        options: ["Yes, always", "No — reporting is your right and is handled with care", "Only if it's serious", "Only if a parent is present"],
        correct: 1,
        explain: "Reporting is confidential and protective. You will be supported, not blamed."
      }
    ]
  },

  // ---------------- FINAL ASSESSMENT ----------------
  {
    id: "final-intro",
    type: "info",
    icon: "cert",
    title: "Final Assessment",
    body: [
      `You've completed all 5 chapters. Now let's bring it all together with a final assessment of ${12} questions.`,
      `You need ${MODULE_META.passMark}% to pass and receive your certificate. You can retake it if needed — there's no penalty for trying again.`
    ]
  },
  {
    id: "final-quiz",
    type: "final",
    title: "Final Assessment",
    passMark: MODULE_META.passMark,
    questions: [
      { q: "POCSO protects children up to what age?", options: ["15 years", "18 years", "21 years", "16 years"], correct: 1 },
      { q: "Whose fault is it if abuse happens?", options: ["The child's", "Never the child's", "Depends on the situation", "Both equally"], correct: 1 },
      { q: "Who has the right to touch you in a way that makes you uncomfortable?", options: ["Close relatives only", "Teachers only", "No one", "Any elder"], correct: 2 },
      { q: "A request to 'keep a touch secret' from your parents is:", options: ["Normal", "A warning sign", "Only a problem if repeated", "Nothing to worry about"], correct: 1 },
      { q: "Someone online you've never met asks for your address. You should:", options: ["Share it if they seem nice", "Never share it", "Share only your area", "Ask a friend first"], correct: 1 },
      { q: "What are the 3 steps to remember if something feels unsafe?", options: ["Ignore, wait, forget", "Say no, get away, tell a trusted adult", "Cry, hide, apologize", "Confront, argue, leave"], correct: 1 },
      { q: "Who counts as a 'trusted adult'?", options: ["Only a parent", "Only a teacher", "Any adult you feel safe confiding in — family, teacher, or community elder", "Only a police officer"], correct: 2 },
      { q: "What is the Childline number?", options: ["1098", "100", "112", "108"], correct: 0 },
      { q: "What is the Tamil Nadu Police POCSO e-Box for?", options: ["Filing noise complaints", "Confidential online reporting of abuse", "Reporting lost items", "School admissions"], correct: 1 },
      { q: "If a confused or uneasy feeling comes up in a situation, you should:", options: ["Ignore it", "Pay attention to it — it's valid", "Wait a year to decide", "Assume you're overreacting"], correct: 1 },
      { q: "Will you get in trouble for reporting a genuine concern to the police?", options: ["Yes", "No, reporting is protected and confidential", "Only if it's false", "Only if your parents disagree"], correct: 1 },
      { q: "Does the POCSO Act apply even if the person involved is a known relative?", options: ["No, only strangers", "Yes, it applies to anyone", "Only distant relatives", "Only if reported within a week"], correct: 1 }
    ]
  },

  // ---------------- CERTIFICATE ----------------
  {
    id: "certificate",
    type: "certificate",
    title: "Certificate of Completion"
  }
];
