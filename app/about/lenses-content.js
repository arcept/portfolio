// Section 02's copy, read by the page and by the layout lab (/about/lenses-lab).

// The intro: the story of how design stopped being only visual. `turn` is the hinge of it.
export const INTRO = {
  headline: 'When the answer is not obvious.',
  before:
    'Design began for me as something visual. I cared about balance, typography, colour, and the strange satisfaction of moving something by a few pixels until it finally felt right.',
  turn: 'I was arranging pixels. I had never asked who they were for.',
  after:
    'Design was also how something worked, whom it worked for, what it asked of them, what it made easier, and what it quietly made difficult. That discovery changed the direction of my life.',
};

// Six lenses, argued as three principles of two.

export const PAIRS = [
  {
    id: 'framing',
    art: 'keys',
    title: 'Start with a question.',
    note: 'A brief names a request. People give it context.',
    lenses: [
      {
        id: 'consider',
        name: 'Consider',
        statement: 'I question what the brief assumes.',
        summary: 'Design is not neutral. Every decision makes something easier to see and something else easier to ignore.',
        reasoning:
          'Words matter. First impressions matter. A beautiful interface can create trust, but appearance cannot rescue a product that misunderstands its user. Before solving the brief, I ask what the brief has already decided for us, who benefits from that framing, and what has been left outside it.',
      },
      {
        id: 'empathize',
        name: 'Empathize',
        statement: 'I listen to people without asking them to design the answer.',
        summary: 'Users reveal needs, frustrations, habits, and context. They should not have to prescribe the product.',
        reasoning:
          'The user comes first, but empathy is not a feature poll. My responsibility is to understand someone’s reality closely, then step back far enough to avoid confusing my first idea with their best outcome.',
      },
    ],
  },
  {
    id: 'evidence',
    art: 'orb',
    title: 'Evidence needs interpretation.',
    note: 'Finding the problem takes more than counting what happened.',
    lenses: [
      {
        id: 'define',
        name: 'Define',
        statement: 'I begin with the problem, not the feature.',
        summary: 'Before adding something, I ask whether we are solving the right problem at the right level.',
        reasoning:
          'Is the failure inside the interface, the process, the organization, or the system connecting them? Sometimes the most valuable design work is not producing an answer. It is making the situation clear enough for the right answer to emerge.',
        evidence: { href: '/case-study-oms', label: 'The OMS case study' },
      },
      {
        id: 'research',
        name: 'Research',
        statement: 'I look at the data, and at what it cannot see.',
        summary: 'Data can show what happened. It does not always explain what the experience meant.',
        reasoning:
          'William Bruce Cameron wrote that not everything that counts can be counted. Data can reveal where people stop, return, convert, or fail. It may not fully explain hesitation, trust, embarrassment, emotional effort, or the moment someone decides a product is not meant for them. I use data, research, conversations, observation, context, and experience together. None deserves to become the whole truth by itself.',
      },
    ],
  },
  {
    id: 'release',
    art: 'glass',
    title: 'Make it clear. Let it meet reality.',
    note: 'Craft and release need room in the same decision.',
    lenses: [
      {
        id: 'design',
        name: 'Design',
        statement: 'I use systems to create clarity.',
        summary: 'Simplicity does not mean pretending the underlying complexity has disappeared.',
        reasoning:
          'I introduce complexity only when it is necessary and accept that some complexity cannot be removed. Sometimes friction protects people. Sometimes “less” becomes empty. A complicated system may need an honest interface rather than the illusion that it is simple.',
        evidence: { href: '/case-study-placement', label: 'The Placement Hub case study' },
      },
      {
        id: 'validate',
        name: 'Validate',
        statement: 'I care about quality, and about releasing.',
        summary: 'Done is better than perfect when done means ready to learn.',
        reasoning:
          'I care about details because they influence comprehension, confidence, and behaviour. I also know that perfection can become another way of avoiding release. A released product can meet reality, be misunderstood, and improve. An unreleased perfect product can only remain an idea.',
      },
    ],
  },
];
