/*
  POCSO — Adult Awareness Module
  Content transcribed verbatim from the source script (pocso.txt).
  Nothing is paraphrased or omitted — text is only reorganised into
  screen/block/interaction structures for rendering.
*/

const MODULE_META = {
  title: `POCSO Awareness (Age: 18+)`,
  issuingAuthority: `Tamil Nadu Police`,
  productionNote: `All the highlights are the suggestions, the developer can use any creative representation based on the content`,
  disclaimer: `This module explains the law in simple words. It is not legal advice.`
};

const CHAPTERS = [

/* =================================================================
   CHAPTER 1 — What POCSO Is, and Who the Law Calls a Child
   ================================================================= */
{
  num: 1,
  title: `What POCSO Is, and Who the Law Calls a Child`,
  duration: `~12 min · 8 screens`,
  blurb: `The legal definition of a child, and why consent below 18 doesn't exist in law.`,
  screens: [
    {
      id: "1.1",
      heading: `SCREEN 1.1 — Opening`,
      blocks: [
        { t: "p", lines: [
          `You do not need to be a police officer, a lawyer, or a teacher for this law to apply to you.`,
          `POCSO applies to every adult in India — including you.`,
          `In the next 45 minutes you will learn what this law says, what it treats as a crime, and what it asks you to do.`
        ]},
        { t: "note", lines: [
          `Every screen carries audio narration, and text that can be enlarged. Nothing is taught only in writing.`
        ]}
      ]
    },
    {
      id: "1.2",
      heading: `SCREEN 1.2 — The name`,
      blocks: [
        { t: "lawTitle", english: `POCSO — The Protection of Children from Sexual Offences Act, 2012`, tamil: `குழந்தைகளை பாலியல் குற்றங்களிலிருந்து பாதுகாக்கும் சட்டம், 2012` },
        { t: "p", lines: [
          `A central law, passed by Parliament in 2012. It applies in every state, including Tamil Nadu.`
        ]},
        { t: "visual", video: `video/ch01-screen-1-2-the-name.mp4`, lines: [
          `Clean title card. Tamil line and English line in the same font size and the same weight — Tamil is not a subtitle sitting under English. Place them side by side or stacked with equal prominence. Use the Tamil Nadu Police colour palette. No illustration needed.`
        ]}
      ]
    },
    {
      id: "1.3",
      heading: `SCREEN 1.3 — The most important line in the Act`,
      severity: "notice",
      blocks: [
        { t: "p", lines: [
          `A child is any person below the age of 18. POCSO Act, Section 2(d)`,
          `That is the whole definition. There is no exception in it.`
        ]},
        { t: "interaction", kind: "beliefFlip", label: `Tap each belief to test it against the law:`, fixedHeader: "18", data: {
          items: [
            { front: `Below 18 — unless the child looks older.`, back: `False. Looks are not a test. The court decides age from records — school certificate first, then birth certificate.` },
            { front: `Below 18 — unless the child is earning.`, back: `False. A working child is still a child.` },
            { front: `Below 18 — unless the child is married.`, back: `False. Marriage does not make a child an adult under this Act.` },
            { front: `Below 18 — unless the child says yes.`, back: `False. A child cannot give consent.` }
          ]
        }},
      ]
    },
    {
      id: "1.4",
      heading: `SCREEN 1.4 — Consent`,
      severity: "warning",
      blocks: [
        { t: "p", lines: [
          `A child cannot give consent.`,
          `This is where most adults get it wrong. It is also where an ordinary person most often becomes an accused person.`
        ]},
        { t: "dialogue", location: `TEA SHOP`, turns: [
          { who: "Murugan", text: `That case in our street. Boy twenty-two, girl seventeen. She herself told the police nobody forced her. Still they took him.` },
          { who: "Selvi", text: `They will take him.` },
          { who: "Murugan", text: `But she said yes, Selvi.` },
          { who: "Selvi", text: `Below eighteen, the law does not accept a child's yes. It has no meaning.` },
          { who: "Murugan", text: `Even if she agreed?` },
          { who: "Selvi", text: `Even if she agreed. That is why agreement is not a defence.` },
          { who: "Murugan", text: `(pause) And if she looks older?` },
          { who: "Selvi", text: `They go by her records. Not her face.` },
          { who: "Murugan", text: `(slowly) So — wait till eighteen and then it's fine.` },
          { who: "Selvi", text: `No. Don't say it like that.` },
          { who: "Murugan", text: `Why?` },
          { who: "Selvi", text: `Because nothing becomes allowed at eighteen. Before eighteen, the law doesn't ask if she agreed. After eighteen, it asks — and if she said no, that's rape.` },
          { who: "Murugan", text: `So it's a crime either way.` },
          { who: "Selvi", text: `Either way. Only the question changes.` }
        ]},
        { t: "p", lines: [
          `Two different laws. Two different questions.`,
          `Below 18 — POCSO. A child's consent does not exist in law.`,
          `18 and above — BNS. Sex without consent is rape — BNS Sections 63 and 64.`
        ]},
        { t: "interaction", kind: "tapReveal", label: `Tap each to reveal:`, data: {
          items: [
            { front: `But she agreed.`, back: `Below 18, "yes" has no meaning in law.` },
            { front: `But she looks older.`, back: `Looks are irrelevant. Age comes from records.` },
            { front: `But she is married.`, back: `Marriage cannot create consent where the law says none can exist.` },
            { front: `But we are in a relationship.`, back: `A relationship is not a defence. The offence is complete.` },
            { front: `But he is a boy — he wanted it.`, back: `Same rule. A boy below 18 cannot consent either.` },
            { front: `But both of them are below 18.`, back: `Still an offence. But when the person who did it is himself below 18, the case goes to the Juvenile Justice Board under the Juvenile Justice Act, not to a regular criminal court. Section 34(1).` }
          ]
        }}
      ]
    },
    {
      id: "1.5",
      heading: `SCREEN 1.5 — Boys are children too`,
      severity: "notice",
      blocks: [
        { t: "p", lines: [
          `POCSO works in both directions.`,
          `Any child can be a victim. Girls and boys are protected the same way.`,
          `Any adult, regardless of gender or relationship to the child, can commit an offence under POCSO. The law does not assume the offender is male.`
        ]},
        { t: "interaction", kind: "sortDrag", label: `Sort each case card:`, data: {
          bins: [ { id: "applies", label: `POCSO applies` }, { id: "not-applies", label: `POCSO does not apply` } ],
          items: [
            { text: `A 15-year-old boy is sexually assaulted by a male relative`, bin: "applies", feedback: `Correct. Boys are protected equally.` },
            { text: `A 16-year-old boy is sexually assaulted by a woman`, bin: "applies", feedback: `Correct. The law does not assume the offender is a man.` },
            { text: `A 17-year-old girl is sexually assaulted by her tuition teacher`, bin: "applies", feedback: `Correct — and because he is her teacher, the punishment is higher. Chapter 3.` },
            { text: `A 13-year-old girl is shown pornographic material by a neighbour`, bin: "applies", feedback: `Correct. Showing pornographic material to a child is an offence under Section 11. No touching is needed.` },
            { text: `A 19-year-old college student is sexually assaulted`, bin: "not-applies", feedback: `Correct. She is above 18, so POCSO does not apply. She is protected under the BNS — Section 63 (rape), Section 74 (assault or criminal force with intent to outrage modesty), Section 75 (sexual harassment). She is not unprotected. She is protected by a different law.` }
          ]
        }},
        { t: "visual", video: `video/ch01-screen-1-5-boys-are-children-too.mp4`, lines: [
          `Five simple illustrated cards, each showing an age and a short line of text. Draw the boy and the girl at the same size, same posture, same lighting.`,
          `What to avoid: do not draw the girl child hunched, crying, in shadow, or with her face hidden while the boy is drawn upright. This is the standard illustration cliché in Indian child protection material and it works against the message of this screen.`,
          `Suggested treatment: flat vector illustration, warm colours, children shown in ordinary settings — school corridor, home, playground — not in distress.`
        ]}
      ]
    },
    {
      id: "1.6",
      heading: `SCREEN 1.6 — Where the danger actually is`,
      severity: "warning",
      blocks: [
        { t: "p", lines: [
          `We teach children to be careful of strangers.`,
          `The evidence points the other way.`
        ]},
        { t: "interaction", kind: "numberPick", label: `Tap your estimate.`, data: {
          question: `Out of 10 of the most serious POCSO cases, how many do you think involve someone the child already knew?`,
          min: 0, max: 10,
          revealHeading: `Answer revealed:`,
          revealLines: [
            `More than 9 out of 10 (NCRB, Crime in India 2024).`,
            `Nationally, 67,809 POCSO cases were registered in 2024. In the most serious category — Sections 4 and 6 — the offender was someone the child already knew in 96.6% of them.`,
            `In 96.6% of cases under Sections 4 and 6 of POCSO the offender was known to the child — a relative, a neighbour, a family friend, someone from school or tuition, someone with a reason to be near the child.`
          ]
        }},
        { t: "visual", video: `video/ch01-screen-1-6-where-the-danger-is.mp4`, lines: [
          `A horizontal bar of 10 human figures. As the answer is revealed, 9 of the 10 change colour to indicate "known to the child" and 1 stays grey for "stranger." Simple, immediate, no text needed to explain it.`,
          `Below the bar, place a still illustration: a family function — chairs in rows, a meal being served, children running between adults. Warm, festive, completely normal. One adult stands slightly apart from the group, watching. Do not make him look sinister. He should look like anybody.`,
          `Why: the discomfort should come from the ordinariness, not from the drawing. If the developer draws a villain, the learner will conclude that offenders look like villains — which is the exact belief this screen exists to break.`
        ]}
      ]
    },
    {
      id: "1.7",
      heading: `SCREEN 1.7 — What the Act actually does`,
      severity: "safe",
      blocks: [
        { t: "dialogue", location: `TEA SHOP / any relevant place`, turns: [
          { who: "Murugan", text: `All this POCSO, POCSO. It's for the police, no? What do I have to do with it?` },
          { who: "Selvi", text: `That's what I thought also. Then they called a meeting at the school. Four things, they said. Only four.` },
          { who: "Murugan", text: `Four things.` },
          { who: "Selvi", text: `One — it lists out exactly what counts as a crime against a child. And it's a longer list than you think. Some of them don't even involve touching.` },
          { who: "Murugan", text: `Without touching?` },
          { who: "Selvi", text: `Sending a sexually explicit message to a fifteen-year-old. Showing them sexually explicit content on your phone. That itself can be an offence under POCSO.` },
          { who: "Murugan", text: `(pause) Okay. Second?` },
          { who: "Selvi", text: `Second — if you know or you think something is happening to a child, you have to report it. If you keep quiet, that is also an offence.` },
          { who: "Murugan", text: `Even if I'm not the one doing it?` },
          { who: "Selvi", text: `Even then.` },
          { who: "Murugan", text: `Aiyo.` },
          { who: "Selvi", text: `Third — the law changed how the child is treated. Who takes her statement, where, who sits with her. She doesn't have to stand in a police station and repeat it in front of everyone.` },
          { who: "Murugan", text: `That is good. That was always the fear.` },
          { who: "Selvi", text: `Fourth — separate courts, only for these cases. So it doesn't sit in a file for ten years.` },
          { who: "Murugan", text: `And you're telling me all this because?` },
          { who: "Selvi", text: `Because you have three children coming into this shop every evening for biscuits, Murugan anna. It's your business too.` }
        ]},
        { t: "interaction", kind: "tapOpen", label: `The four parts of POCSO. Tap to open each.`, data: {
          items: [
            { front: `1 · It defines the offences and the punishments. Sections 3 to 15.`, back: `Wider than most people assume — several offences involve no touching.` },
            { front: `2 · It makes reporting a legal duty.`, back: `Section 19: any person who knows, or thinks, that an offence has been committed must report it. You do not have to be certain. Section 21: failure to report is punishable.` },
            { front: `3 · It changes how the child is treated.`, back: `Who records the statement, where, in whose presence. How a medical examination is done. Whether the child must face the accused in court.` },
            { front: `4 · It creates Special Courts.`, back: `So these cases are heard by designated courts, within fixed timelines.` }
          ]
        }}
      ]
    },
    {
      id: "1.8",
      heading: `SCREEN 1.8 — Why this module is addressed to you`,
      severity: "warning",
      blocks: [
        { t: "p", lines: [
          `There are two ways an adult can end up on the wrong side of this law.`
        ]},
        { t: "compareTable", columns: [`Doing something to a child`, `Knowing, and staying quiet`], rows: [
          [`Where in the law`, `Sections 3 to 15`, `Section 19 · Section 21`],
          [`Can it happen by accident?`, `No`, `Yes`],
          [`Is it an offence?`, `Yes`, `Yes`]
        ]},
        { t: "p", lines: [
          `The punishments are not the same. But both are offences.`,
          `So this module is not only about protecting a child from someone else.`,
          `It is about knowing exactly where the line is — so that you never cross it, and never stand next to it in silence.`
        ]},
        { t: "interaction", kind: "commitmentTap", data: {
          buttonText: `I understand this law applies to me.`
        }},
        { t: "visual", video: `video/ch01-screen-1-8-applies-to-you.mp4`, lines: [
          `Two panels side by side, the same size. Left panel: a single figure with a hand extended towards a child, drawn in silhouette. Right panel: a figure standing with their back turned, hands in pockets, while the same scene happens behind them, also in silhouette.`,
          `The two panels must be identical in size, colour weight and prominence. Neither one should be bigger, brighter, or placed above the other.`,
          `Why this matters: both are offences under this Act, and the second one is the one people do not know about. If the developer draws the first one large and dramatic and the second one small and grey, the learner reads the silence panel as a minor thing — which is the belief the screen is trying to remove.`,
          `Add one short line of dialogue inside each panel, in a speech bubble. Left: "Nobody will know." Right: "It's not my business."`
        ]}
      ]
    }
  ],
  quiz: {
    heading: `CHAPTER 1 QUIZ`,
    questions: [
      {
        type: "single",
        q: `Scenario. A 17-year-old tells you she is in a relationship with a 30-year-old man and that she is happy in it. Under POCSO —`,
        options: [
          { label: `Not an offence, because she agreed`, correct: false },
          { label: `Not an offence, because she will turn 18 next week`, correct: false },
          { label: `An offence, because a person below 18 cannot legally consent`, correct: true },
          { label: `An offence only if she complains later`, correct: false }
        ],
        feedbackCorrect: `Age is the only test. Her agreement and how close she is to turning 18 make no difference.`,
        feedbackIncorrect: `Under Section 2(d), anyone below 18 is a child, and a child cannot give valid consent.`
      },
      {
        type: "multi",
        q: `Multiple select. Who is protected by POCSO? (Select all that apply.)`,
        options: [
          { label: `A 14-year-old girl`, correct: true },
          { label: `A 14-year-old boy`, correct: true },
          { label: `A 17-year-old girl who is married`, correct: true },
          { label: `A 19-year-old woman`, correct: false }
        ],
        feedback: `All three children are protected, whatever their gender or marital status. The 19-year-old is above 18 — she is protected under the BNS instead, not POCSO.`
      },
      {
        type: "single",
        q: `True or false. If you suspect a child is being sexually abused, whether to report it is your personal choice.`,
        options: [
          { label: `True`, correct: false },
          { label: `False`, correct: true }
        ],
        feedback: `Section 19 makes reporting a legal duty for every person. Section 21 makes failure to report punishable.`
      }
    ]
  }
},

/* =================================================================
   CHAPTER 2 — What Counts as an Offence
   ================================================================= */
{
  num: 2,
  title: `What Counts as an Offence`,
  duration: `~9 min · 7 screens`,
  blurb: `The four kinds of offence under POCSO — most of them don't require touching.`,
  screens: [
    {
      id: "2.1",
      heading: `SCREEN 2.1 — Opening`,
      blocks: [
        { t: "p", lines: [
          `Ask most adults what child sexual abuse means, and they will describe one thing: rape.`,
          `POCSO covers four kinds of offence. Only one of them involves penetration. Two of them do not involve touching at all.`,
          `This chapter covers all four.`
        ]},
        { t: "visual", video: `video/ch02-screen-2-1-four-kinds-opening.mp4`, lines: [
          `Four empty outlined boxes across the top of the screen, filling in one by one as the chapter progresses. Keep the strip visible on every screen in Chapter 2, so the learner can always see how many remain. On Screen 2.7 all four are already filled — the strip stays on screen, unchanged, because that screen is about all four.`
        ]}
      ]
    },
    {
      id: "2.2",
      heading: `SCREEN 2.2 — The four kinds`,
      severity: "notice",
      blocks: [
        { t: "table", headerRow: [`What it is`, `Section`], rows: [
          [`1 · Penetrative sexual assault`, `3`],
          [`2 · Sexual assault — touching, without penetration`, `7`],
          [`3 · Sexual harassment — no touching needed`, `11`],
          [`4 · Using a child to make sexual material`, `13`]
        ]}
      ]
    },
    {
      id: "2.3",
      heading: `SCREEN 2.3 — Penetrative sexual assault (Section 3)`,
      severity: "danger",
      blocks: [
        { t: "p", lines: [
          `Section 3 covers penetration of a child's body, in any form. It also covers making the child do it to the offender, and manipulating any part of the child's body to cause penetration.`
        ]},
        { t: "quote", heading: `The Act's own words:`, lines: [
          `Penetration into the vagina, mouth, urethra or anus of a child; or making the child do so with the offender or any other person.`
        ]},
        { t: "p", lines: [
          `Punishment — Section 4. At least 10 years, and it can go up to imprisonment for life, with a fine. If the child is below 16, at least 20 years, and it can go up to imprisonment for the rest of the offender's life, with a fine.`
        ]}
      ]
    },
    {
      id: "2.4",
      heading: `SCREEN 2.4 — Sexual assault (Section 7)`,
      severity: "danger",
      blocks: [
        { t: "p", lines: [
          `Section 7 covers touching a child with sexual intent, without penetration — and making a child touch the offender or another person.`,
          `It also covers "any other act with sexual intent which involves physical contact."`,
          `The test is the intent behind the touch — not the body part, and not whether there were clothes in between.`,
          `Punishment — Section 8. Three to five years, with a fine.`
        ]},
        { t: "interaction", kind: "judgmentCards", label: `Choose offence or not an offence:`, data: {
          items: [
            { situation: `A doctor examines a child's stomach during a consultation, with the parent present`, answer: `Not an offence`, feedback: `Correct. There is no sexual intent — and Section 41 states that Sections 3 to 13 do not apply to medical examination or treatment carried out with the consent of the parent or guardian.` },
            { situation: `An uncle touches a 12-year-old's chest over her school uniform`, answer: `Offence`, feedback: `Correct. Clothing makes no difference. Section 7 covers touching over clothes where the intent is sexual.` },
            { situation: `A tuition teacher repeatedly makes a student sit on his lap and holds her there`, answer: `Offence`, feedback: `Correct — and because he is her teacher, the punishment rises.` }
          ]
        }},
        { t: "visual", video: `video/ch02-screen-2-4-sexual-assault-section-7.mp4`, lines: [
          `Three cards, one at a time. Each carries a line illustration of the setting only — a clinic room with a curtain and weighing scale; a school corridor; a tuition room with a low table and notebooks. Do not illustrate the act. No hands, no contact, no bodies. Card flips to green or amber with the feedback.`
        ]}
      ]
    },
    {
      id: "2.5",
      heading: `SCREEN 2.5 — Sexual harassment (Section 11)`,
      severity: "warning",
      blocks: [
        { t: "dialogue", location: `TEA SHOP`, turns: [
          { who: "Murugan", text: `This one I can't accept. The man in the next street. They took him and he never touched the girl.` },
          { who: "Selvi", text: `What did he do?` },
          { who: "Murugan", text: `Nothing! Some messages, they're saying. On the phone.` },
          { who: "Selvi", text: `What kind of messages?` },
          { who: "Murugan", text: `(shrugging) Dirty messages, whatever. She's fifteen. But he never went near her. Never met her once.` },
          { who: "Selvi", text: `Still a crime.` },
          { who: "Murugan", text: `For messages?` },
          { who: "Selvi", text: `For messages. There's a whole section for things where nobody touches anybody. Sending sexual things to a child. Showing them something on a phone. Following them, watching them, messaging again and again when nobody asked.` },
          { who: "Murugan", text: `But if he didn't touch her, what harm —` },
          { who: "Selvi", text: `Murugan anna. If a grown man was sending those messages to your granddaughter, and somebody told you "but he never touched her" — would that help?` },
          { who: "Murugan", text: `(long pause) No.` },
          { who: "Selvi", text: `Then the answer was already there. It just wasn't known to be written down.` }
        ]},
        { t: "p", lines: [
          `This is the section least known, and most often broken.`,
          `Section 11 requires no touching at all. With sexual intent, each of these is an offence:`
        ]},
        { t: "list", items: [
          `1 · Saying a word, making a sound or gesture, or showing an object or part of the body, intending a child to hear or see it`,
          `2 · Showing a child pornographic material, in any form or media`,
          `3 · Repeatedly following, watching or contacting a child — directly, or by phone or online`,
          `4 · Threatening to use a real or morphed sexual picture of a child`,
          `5 · Luring a child for pornographic purposes`
        ]},
        { t: "p", lines: [ `Punishment — Section 12. Up to three years, with a fine.` ]},
        { t: "visual", video: `video/ch02-screen-2-5-sexual-harassment-section-11.mp4`, lines: [
          `Below: a five-panel illustrated strip, one per item, scrolling vertically. · An adult leaning towards a child on a bus, mid-sentence, speech bubble with symbols not words · An adult holding a phone turned towards a child — screen blank white, nothing on it · A child walking home, the same adult figure visible across three frames — outside school, on the street, near the house · A phone showing a message bubble with a photo icon and a warning triangle · An adult holding out a phone and money towards a child`,
          `Highlight panels 2 and 3 with a coloured border, tagged "Most commonly committed." These are the two offences ordinary adults commit most casually.`
        ]}
      ]
    },
    {
      id: "2.6",
      heading: `SCREEN 2.6 — Photos and videos of children`,
      severity: "danger",
      blocks: [
        { t: "dialogue", location: `TEA SHOP`, turns: [
          { who: "Murugan", text: `(holding the phone out, agitated) Selvi. Did you see what came in the building group?` },
          { who: "Selvi", text: `(not taking it) I don't want to see it.` },
          { who: "Murugan", text: `One video. A child. Some fellow has done — Selvi, I can't even say it. Thirty people in that group.` },
          { who: "Selvi", text: `Where did it come from?` },
          { who: "Murugan", text: `How do I know? Somebody sent it. It's going everywhere.` },
          { who: "Selvi", text: `It didn't come from nowhere, anna. Somebody made it.` },
          { who: "Murugan", text: `(stopping) What?` },
          { who: "Selvi", text: `Somebody was in the room. Somebody held the phone. That's not a video that appeared. That is a man who did something to a child and recorded it while he did it.` },
          { who: "Murugan", text: `(quieter) ...Yes.` },
          { who: "Selvi", text: `And now thirty people in your building are carrying it.` },
          { who: "Murugan", text: `I sent it to my brother. And to the watchman. See what people have become, I told them.` },
          { who: "Selvi", text: `(after a pause) Anna. That's an offence.` },
          { who: "Murugan", text: `What offence? I didn't make it! I was showing them how disgusting it is.` },
          { who: "Selvi", text: `Sending it on is its own offence. The law doesn't ask why you sent it. Three years, it can go up to. And there's a separate case under the IT Act Section 67B on top of that.` },
          { who: "Murugan", text: `For forwarding?` },
          { who: "Selvi", text: `For forwarding.` },
          { who: "Murugan", text: `Then what was I supposed to do?` },
          { who: "Selvi", text: `Report it. Then delete it. If the police ask you to keep it, do that instead — they will tell you what to do with it.` },
          { who: "Murugan", text: `(after a moment) My brother will have sent it on by now. Definitely.` },
          { who: "Selvi", text: `Yes. And that person will send it to somebody. Every one of them thinks he's the one exposing it.` },
          { who: "Selvi", text: `(pause)` },
          { who: "Murugan", text: `Somebody should catch that fellow.` },
          { who: "Selvi", text: `Somebody should. And when they do, this is what they'll find on his phone — everybody who helped it travel. He made it once. It's been made again every day since, by people like us.` },
          { who: "Murugan", text: `(nothing)` },
          { who: "Selvi", text: `For him it was one day. For the child it doesn't stop, because we didn't stop.` }
        ]},
        { t: "p", lines: [
          `Somebody made it. That is where this starts.`,
          `Making it carries at least five years. Keeping it in order to pass it on carries up to three years, or a fine, or both. Sending it on carries up to three years, for any reason at all — and is separately an offence under Section 67B of the IT Act.`,
          `Only two reasons to still have it are permitted: reporting it, or producing it as evidence when directed.`
        ]},
        { t: "p", lines: [
          `Report it. Then delete it. If the police ask you to keep it, do that instead — they will tell you what to do with it.`,
          `That is the permitted action.`
        ]},
        { t: "list", heading: `You have it on your phone right now. Do this in order.`, items: [
          `1 · Stop → do not forward it, not to one more person, not to warn anybody`,
          `2 · Report it → cybercrime.gov.in · or 1098 · or your local police station`,
          `3 · Delete it → from the chat, gallery and downloads, unless the police ask you to keep it`
        ]},
        { t: "p", lines: [
          `Then, if you can: leave the group, or tell the group not to forward it. You are not required to. The three steps above are.`
        ]},
        { t: "visual", video: `video/ch02-screen-2-6-photos-videos-scenario.mp4`, lines: [
          `During the conversation. The phone faces away from the viewer throughout. Selvi never takes it, never looks at it. The screen is never shown, not blurred, not pixelated, not at any angle. Hold on the two of them and the tea glasses.`,
          `On Selvi's line "somebody was in the room" — cut to nothing. No flashback, no silhouette, no shadowed doorway, no implied figure. This is the single most important instruction on the screen. The sentence is doing the work. Any image at all reduces it, and any image at all risks becoming the thing the learner remembers instead of the sentence.`,
          `After the conversation — the spread. One phone icon. Then two. Four. Eight. Sixteen, moving outward past the edges of the frame. No content on any of them, only spread. It runs three seconds and stops dead.`,
          `Forward — struck through in red, tagged "up to 3 years, plus a separate IT Act offence"`,
          `Report, then delete — in green, tagged "the permitted action"`,
          `Appears only after the learner taps "Report, then delete." Not before.`
        ]},
        { t: "pathway", video: `video/ch02-screen-2-6-report-delete-pathway.mp4`, steps: [`Stop`, `Report`, `Delete`] }
      ]
    },
    {
      id: "2.7",
      heading: `SCREEN 2.7 — When the punishment goes up`,
      severity: "danger",
      blocks: [
        { t: "p", lines: [ `The same act carries a much higher punishment in certain cases.` ]},
        { t: "list", heading: `Because of who did it`, items: [
          `a police officer or public servant`, `staff of a school, hospital, jail or children's home`, `a relative, or someone living in the same house`, `anyone in a position of trust or authority over the child`
        ]},
        { t: "list", heading: `Because of the child`, items: [ `below 12`, `has a disability` ]},
        { t: "list", heading: `Because of what happened`, items: [
          `caused grievous hurt, pregnancy, HIV or death`, `done by more than one person`, `done repeatedly`
        ]},
        { t: "p", lines: [
          `Aggravated penetrative sexual assault — Sections 5 and 6. At least 20 years, and it can go up to imprisonment for the rest of the offender's life, or death.`,
          `Aggravated sexual assault — Sections 9 and 10. Five to seven years.`
        ]},
        { t: "visual", video: `video/ch02-screen-2-7-punishment-goes-up.mp4`, heading: `[VISUAL — staircase]`, lines: [
          `Two steps side by side, both visible at once. Lower: "The offence" — bar marked 10 years minimum. Upper, visibly taller: "The same offence, made worse" — bar marked 20 years minimum, up to life, or death.`,
          `Between them, three icon groups feeding upward — who did it · who it was done to · how it was done. Tapping each expands the list.`,
          `Same colour for both bars, deeper shade on the taller. Not red vs green — it is the same offence.`
        ]}
      ]
    }
  ],
  quiz: {
    heading: `CHAPTER 2 QUIZ`,
    note: `(Quiz scenarios keep second person — that is a hypothetical role in standard assessment format, not an address to the learner.)`,
    questions: [
      {
        type: "multi",
        q: `Multiple select. Which of these are offences under POCSO? (Select all that apply.)`,
        options: [
          { label: `Showing a pornographic video to a 15-year-old`, correct: true },
          { label: `Repeatedly sending sexual messages to a 14-year-old on Instagram`, correct: true },
          { label: `Touching a child's chest over her clothing`, correct: true },
          { label: `Keeping a video of child sexual abuse on a phone in order to forward it`, correct: true },
          { label: `A paediatrician examining a child with the parent present`, correct: false }
        ],
        feedback: `The first four are offences — §11, §11, §7 and §15. The first three involve no penetration; two involve no touching at all. The medical examination has no sexual intent, and Section 41 expressly excludes examination or treatment carried out with parental consent.`
      },
      {
        type: "single",
        q: `Scenario. A man receives a video of child sexual abuse on WhatsApp. He is disgusted and forwards it to three friends saying see what people are doing. Under POCSO —`,
        options: [
          { label: `No offence, because his intention was to condemn it`, correct: false },
          { label: `No offence, because he did not create the video`, correct: false },
          { label: `An offence under Section 15(2), because he sent it on`, correct: true },
          { label: `An offence only if one of the friends complains`, correct: false }
        ],
        feedback: `Section 15(2) covers storing such material in order to transmit, propagate, display or distribute it. Report it, then delete it. If the police ask you to keep it, do that instead — they will tell you what to do with it.`
      },
      {
        type: "single",
        q: `Scenario. A hostel warden sexually assaults a 13-year-old resident. Compared to the same act by a stranger, the punishment is —`,
        options: [
          { label: `The same`, correct: false },
          { label: `Lower, because he is an employee of the institution`, correct: false },
          { label: `Higher, because he is in a position of trust and is staff of the institution`, correct: true },
          { label: `Decided by the institution`, correct: false }
        ]
      }
    ]
  }
},

/* =================================================================
   CHAPTER 3 — The Line an Adult Must Not Cross
   ================================================================= */
{
  num: 3,
  title: `The Line an Adult Must Not Cross`,
  duration: `~4 min · 2 screens`,
  blurb: `Everyday behaviours that are already offences, and beliefs that don't hold up in law.`,
  screens: [
    {
      id: "3.1",
      heading: `SCREEN 3.1 — Things that are already offences`,
      severity: "warning",
      blocks: [
        { t: "p", lines: [
          `Every other chapter in this module is about protecting a child from someone else.`,
          `This chapter is about the line an adult must not cross.`,
          `Each of the following is already an offence. None of them is what people picture when they hear the word "abuse."`
        ]},
        { t: "list", heading: `Things you say, send or show`, items: [
          `Sending a sexual joke, picture or message to someone below 18`,
          `Showing a child pornographic material — including "just to see the reaction"`,
          `Commenting on a child's body in a sexual way, in person or online`,
          `Repeatedly messaging or following a teenager who did not ask for the contact`
        ]},
        { t: "list", heading: `Things on a phone or a camera`, items: [
          `Photographing a child undressed`,
          `Keeping such material to share or sell it`,
          `Forwarding it to anyone, for any reason`,
          `Threatening to share a real or morphed sexual picture of a child`
        ]}
      ]
    },
    {
      id: "3.2",
      heading: `SCREEN 3.2 — Three beliefs that are wrong`,
      severity: "notice",
      blocks: [
        { t: "dialogue", location: `BUS STOP`, turns: [
          { who: "Amudha", text: `(looking up from her phone) Sekar. You see this case?` },
          { who: "Sekar", text: `Which one?` },
          { who: "Amudha", text: `The man — he said it happened only one time. Only once, and they gave him ten years.` },
          { who: "Sekar", text: `Once is enough. It's a crime the first time.` },
          { who: "Amudha", text: `Then what's the point of how many times?` },
          { who: "Sekar", text: `It makes the punishment bigger. Not smaller.` },
          { who: "Amudha", text: `(scrolling) And this word they keep using — no penetration.` },
          { who: "Sekar", text: `Also not a defence. There are separate sections for touching without that. And separate sections for things with no touching at all.` },
          { who: "Amudha", text: `(shaking her head) Then this one I don't understand. The girl said nothing for six years. Six years! Then suddenly she goes to the police.` },
          { who: "Sekar", text: `She was nine.` },
          { who: "Amudha", text: `(quiet)` },
          { who: "Sekar", text: `Children don't speak immediately. Sometimes there are no words. Sometimes they were told what would happen. Sometimes they told one person, nothing happened, so they stopped trying.` },
          { who: "Amudha", text: `And the law accepts that?` },
          { who: "Sekar", text: `Waiting doesn't make the case weaker. Six years. Twenty years. Nobody is too late.` },
          { who: "Amudha", text: `(after a moment) And that tuition master they arrested. Twenty years minimum, they're saying. For a teacher.` },
          { who: "Sekar", text: `Because he's a teacher.` },
          { who: "Amudha", text: `That's backwards.` },
          { who: "Sekar", text: `Is it? A stranger has to work hard to get near a child. That girl's mother put her in an auto and sent her to him six days a week. Told her — listen to Sir. He didn't have to work at all. It was handed to him.` },
          { who: "Amudha", text: `(slowly) Because everyone trusted him.` },
          { who: "Sekar", text: `She had no way to protect herself from someone she was told was safe. The law looked at that and said — worse. Not better.` },
          { who: "Amudha", text: `(no answer)` }
        ]},
        { t: "p", lines: [
          `Three beliefs, and what the law says.`
        ]},
        { t: "beliefList", items: [
          { belief: `"It only happened once."`, response: `Every offence is complete the first time. Repetition raises the punishment. Its absence removes nothing.` },
          { belief: `"There was no penetration."`, response: `Separate offences exist for touching without penetration, and for acts with no touching at all.` },
          { belief: `"The child said nothing at the time."`, response: `Delay is normal and does not weaken a case. Courts accept that children stay silent for years. Nobody is too late to come forward.` }
        ]},
        { t: "p", lines: [
          `Committing the act is not the only way to be liable.`,
          `Encouraging it, planning it, or deliberately not acting when it was a duty to act — the law can punish that as the offence itself. Attempting it carries up to half the sentence. Sections 16, 17 and 18.`,
          `For the more serious offences — sexual assault and penetrative sexual assault, Sections 3, 5, 7 and 9 — the Special Court begins by presuming the accused did it, once the prosecution has laid the basic facts. Disproving it is his job. Sections 29 and 30.`
        ]},
        { t: "visual", video: `video/ch03-screen-3-2-three-beliefs-wrong.mp4`, lines: [
          `Two beats to hold: on "She was nine," hold the frame — and have Amudha lower the phone. On her final silence, do not draw her nodding. She looks down the road for the bus.`,
          `Below the conversation: reuse the staircase graphic from Chapter 2 — same drawing, same colours — highlighting only the "who did it" group. Do not redesign it.`,
          `Beside it, three figures at identical size: a hand extended ("Did it") · a figure gesturing forward ("Encouraged it") · a figure with a key beside an open door, looking away ("Chose not to stop it"). One bracket beneath all three: "The law can treat all three the same." All three at the same size and colour weight — if the first is drawn larger, the graphic argues against the text.`
        ]}
      ]
    }
  ],
  quiz: {
    heading: `CHAPTER 3 QUIZ`,
    questions: [
      {
        type: "single",
        q: `Scenario. A 35-year-old man exchanges sexual messages with a 16-year-old girl online. They never meet. Under POCSO —`,
        options: [
          { label: `No offence, because there was no physical contact`, correct: false },
          { label: `No offence, because she took part willingly`, correct: false },
          { label: `An offence under Section 11 — sexual harassment needs no physical contact`, correct: true },
          { label: `An offence only if he meets her later`, correct: false }
        ],
        feedback: `Section 11 covers repeatedly contacting a child online with sexual intent, and covers sexual words and material sent to a child.`
      },
      {
        type: "single",
        q: `True or false. Once charges are framed in a POCSO case of sexual assault, the prosecution must prove the accused did it, as in any other criminal trial.`,
        options: [
          { label: `True`, correct: false },
          { label: `False`, correct: true }
        ],
        feedback: `For the offences under Sections 3, 5, 7 and 9, Section 29 has the Special Court presume the accused committed the offence unless he proves otherwise, and Section 30 presumes he had the guilty mind. The burden sits with him.`
      },
      {
        type: "single",
        q: `Scenario. A school principal learns that a teacher has sexually assaulted a student. He decides not to report it, so the school's reputation is protected. Under POCSO he faces —`,
        options: [
          { label: `No liability, since he did not commit the assault`, correct: false },
          { label: `Liability for failure to report under Section 21 — and possible liability as an abettor under Section 16, if his silence allowed further offences`, correct: true },
          { label: `Liability only if the parents complain about him`, correct: false },
          { label: `Only departmental action, not criminal liability`, correct: false }
        ],
        feedback: `Section 21 makes failure to report punishable, with a higher penalty for a person in charge of an institution. Section 16 covers deliberately not acting when it was your duty to act.`
      }
    ]
  }
},

/* =================================================================
   CHAPTER 4 — Seeing It Before the Child Speaks
   ================================================================= */
{
  num: 4,
  title: `Seeing It Before the Child Speaks`,
  duration: `~5 min · 3 screens`,
  blurb: `Recognising grooming patterns and signs in a child, before anything is said.`,
  screens: [
    {
      id: "4.1",
      heading: `SCREEN 4.1 — What grooming looks like`,
      severity: "warning",
      blocks: [
        { t: "p", lines: [
          `Most children being abused never tell anyone.`,
          `They stay silent because they were threatened. Because they were told nobody would believe them. Because the person doing it is someone the family loves. Because they have no words for it. Because they tried once, and nothing happened.`,
          `So the noticing has to be done by adults.`,
          `Abuse rarely starts with a sexual assault. It starts with someone slowly building access to a child, and silence around it. That is grooming.`,
          `Six patterns:`
        ]},
        { t: "list", items: [
          `1 · Targeting — fixing on one particular child. Often one who is alone a lot, or has trouble at home, or badly wants attention.`,
          `2 · Special treatment — gifts, money, phone recharge, favours no other child gets.`,
          `3 · Creating time alone — extra classes, dropping her home, sending her on errands, a closed door. Always with a good reason attached.`,
          `4 · Testing the boundary — small touches that could look innocent. Tickling, play-fighting, a hand that stays a moment too long. He is watching how the child reacts, and how the adults around react.`,
          `5 · Secrecy — "this is just between us." Private messages. A phone the parents don't know about. The clearest single sign.`,
          `6 · Escalation and silencing — contact increases. The child is made to feel she is part of it, or ashamed, or afraid of what happens if she speaks.`
        ]},
        { t: "visual", video: `video/ch04-screen-4-1-grooming-warning-signs.mp4`, heading: `[VISUAL — staircase, not a list]`, lines: [
          `Six steps rising left to right. Each carries a number, the pattern name, and one icon: a single figure picked out of a group · a wrapped gift · a closed door · a hand reaching out, drawn faintly · a finger to the lips · an arrow curving upward.`
        ]}
      ]
    },
    {
      id: "4.2",
      heading: `SCREEN 4.2 — Divya's case, and what to look for in a child`,
      severity: "warning",
      blocks: [
        { t: "p", lines: [
          `Read this, then mark what stands out.`,
          `Divya is 13, in Class 8. Her father works in Dubai. Her mother works two shifts. A neighbour she calls Chithappa has been helping the family for two years. He drops her to school. He stays with her when her mother is on night duty.`,
          `Over four months: he starts bringing her small gifts. He recharges her phone. He tells her she is more grown-up than other girls her age. He asks her not to mention the gifts — the other children in the building will feel bad, he says. He starts arriving before her mother leaves, and staying after she goes.`,
          `Her mother notices Divya has gone quiet, and decides it must be exam pressure. Her teacher notices Divya has stopped sitting with her usual friends.`
        ]},
        { t: "interaction", kind: "multiSelectCase", label: `Which of the six patterns are present?`, data: {
          options: [
            { label: `Targeting`, correct: true },
            { label: `Special treatment`, correct: true },
            { label: `Creating time alone`, correct: true },
            { label: `Secrecy`, correct: true },
            { label: `Testing the boundary`, correct: false, note: `not described here` },
            { label: `Escalation and silencing`, correct: false, note: `not described yet` }
          ],
          feedbackLines: [
            `Four of the six. And nothing has been done to Divya yet.`,
            `That is the point. By the time anything happens, this man will have spent months making sure he can be alone with her and that she won't talk about it — all of it in the open.`,
            `Two adults have already seen something change. Neither of them had to be sure, and neither of them had to ask Divya a single question. Either one could have reported a suspicion that day.`
          ]
        }},
        { t: "p", heading: `Signs in a child.`, lines: [] },
        { t: "list", heading: `In behaviour`, items: [
          `suddenly withdrawn, or suddenly clingy`, `afraid of one person or one place`, `won't be alone with someone she was fine with before`, `marks falling`, `stops activities she liked`, `running away`, `angry, or hurting herself`, `not sleeping`, `bedwetting`
        ]},
        { t: "list", heading: `In what she knows`, items: [
          `words, drawings or games involving sexual acts a child that age should not know about.`
        ]},
        { t: "list", heading: `In the body`, items: [
          `difficulty walking or sitting`, `pain, bleeding or discharge`, `falling ill often with no clear reason`, `not wanting to change clothes in front of anyone`
        ]},
        { t: "list", heading: `On the phone`, items: [
          `hiding the screen`, `a phone, SIM or account the family didn't know existed`, `upset after being online`
        ]},
        { t: "p", lines: [ `You do not need to spot many. One change that is new, and does not go away, is enough.` ]},
        { t: "visual", video: `video/ch04-screen-4-2-divya-case-signs.mp4`, lines: [
          `Top — Divya's story as four panels, scrolled through with text beneath each: 1 · The setup. A small flat. Divya at a table with schoolbooks. Her mother at the door in work clothes, leaving. A wall calendar with shifts marked. 2 · The gifts. Same table. A hand and forearm only — no face — placing a wrapped item and a phone beside her books. Divya looks pleased. 3 · The secret. Divya alone, holding the phone, glancing towards the door. 4 · What the adults saw. Split frame. Left: her mother across a meal, mildly concerned. Right: a school corridor, Divya alone on a step while girls talk nearby, her teacher passing with a register.`,
          `Rules: never show the man's face — hands, a shoulder, nothing more. Divya must never look frightened or sad in panels 1–3; she looks like a child being treated well. Same colour palette across all four.`,
          `Bottom — four grouped panels with heading icons only: Behaviour · What she knows · Body · Phone. Do not illustrate individual signs. No crying child, no bruises. A parent may be recognising their own child here; illustrated distress turns a checklist into an accusation.`,
          `Highlight "What she knows" with a border tagged "Most often ignored."`
        ]}
      ]
    },
    {
      id: "4.3",
      heading: `SCREEN 4.3 — Noticing is not investigating`,
      severity: "safe",
      blocks: [
        { t: "p", lines: [
          `Suspicion is enough to report.`,
          `Do not question the child. Probing questions damage the child's account.`,
          `Do not confront the person suspected. It warns him, endangers the child, destroys evidence.`,
          `Do not arrange a medical examination. There is a legal procedure for that.`,
          `Do not discuss it in a WhatsApp group, a staff room, or with neighbours. Revealing a child's identity — in a newspaper, or on WhatsApp, Facebook or YouTube — is itself an offence under Section 23.`,
          `Report it. That is the whole job. Establishing what happened is the system's work.`
        ]},
        { t: "dialogue", location: `TEA SHOP`, note: `(add any characters / scenario without changing the core content)`, turns: [
          { who: "Selvi", text: `Murugan anna. Can I ask you something, and you won't repeat it?` },
          { who: "Murugan", text: `Ask.` },
          { who: "Selvi", text: `My sister's daughter. Eleven. Last two months she won't stay in the room when her father's younger brother comes. She goes and stands in the kitchen. Every time.` },
          { who: "Murugan", text: `(carefully) You told your sister?` },
          { who: "Selvi", text: `How to say it? That family is everything to us. He's been coming to that house fifteen years. If I say one word and I'm wrong —` },
          { who: "Murugan", text: `You'll lose the whole family.` },
          { who: "Selvi", text: `And they'll say Selvi is the one who broke it.` },
          { who: "Murugan", text: `So what are you doing?` },
          { who: "Selvi", text: `Watching. Waiting to be sure.` },
          { who: "Murugan", text: `(putting the cloth down) How long have you been waiting to be sure?` },
          { who: "Selvi", text: `(pause) Two months.` },
          { who: "Murugan", text: `And in those two months, how many times has he been in that house?` },
          { who: "Selvi", text: `(no answer)` },
          { who: "Murugan", text: `You told me the law doesn't ask anyone to be sure. Suspicion is enough, you said. They set it low on purpose, so ordinary people don't have to decide this alone.` },
          { who: "Selvi", text: `(quietly) I said that.` },
          { who: "Murugan", text: `Then it isn't an accusation. It's handing a question to people whose job it is to answer it. If the answer is nothing, it's nothing, and you'll be glad.` },
          { who: "Selvi", text: `And if it isn't nothing?` },
          { who: "Murugan", text: `Then you waited two months. Don't wait four.` }
        ]},
        { t: "p", lines: [
          `More than 9 out of 10 offenders are already known to the child. So most suspicions will be about someone known — a relative, a family friend, someone whose family is tied to yours.`,
          `This is where most adults stop.`,
          `The reasons are always the same. It will destroy the family. He would never. She'll be blamed for the rest of her life. Let me watch a little longer and be sure.`,
          `Waiting to be sure is how children stay in these situations for years.`
        ]}
      ]
    }
  ],
  quiz: {
    heading: `CHAPTER 4 QUIZ`,
    questions: [
      {
        type: "multi",
        q: `Multiple select. In Divya's case, which should have raised concern? (Select all that apply.)`,
        options: [
          { label: `An adult asking a child to keep gifts secret`, correct: true },
          { label: `An adult repeatedly arranging to be alone with her`, correct: true },
          { label: `A sudden change in how she behaved at school`, correct: true },
          { label: `Her father working abroad`, correct: false }
        ],
        feedback: `The first three are grooming patterns.`
      },
      {
        type: "single",
        q: `Scenario. You suspect a child in your building is being abused by a relative. The first step should be to —`,
        options: [
          { label: `Ask the child directly, to be sure before acting`, correct: false },
          { label: `Speak to the relative and watch how he reacts`, correct: false },
          { label: `Report the suspicion to the police or SJPU — or call 1098`, correct: true },
          { label: `Wait until something clearer appears`, correct: false }
        ],
        feedback: `Section 19 says the report goes to the Special Juvenile Police Unit or the local police; 1098 routes to the same place.`
      },
      {
        type: "single",
        q: `True or false. Reporting should wait until abuse is reasonably certain.`,
        options: [
          { label: `True`, correct: false },
          { label: `False`, correct: true }
        ],
        feedback: `Suspicion is enough. The law does not ask for certainty and does not ask for proof. Waiting until it is certain is what leaves children where they are.`
      }
    ]
  }
},

/* =================================================================
   CHAPTER 5 — When a Child Tells You, and What to Do Next
   ================================================================= */
{
  num: 5,
  title: `When a Child Tells You, and What to Do Next`,
  duration: `~9 min · 7 screens`,
  blurb: `What to say, what not to say, and how to report — and what happens after.`,
  screens: [
    {
      id: "5.1",
      heading: `SCREEN 5.1 — The first ten seconds`,
      severity: "safe",
      blocks: [
        { t: "p", lines: [
          `When a child tells an adult, understand what has just happened. It rarely comes out plainly.`,
          `Indirectly — a boy says "I don't want to go to tuition any more." He is not refusing tuition. He is refusing a person, and hoping someone asks.`,
          `As a question about "a friend" — "What if someone's uncle did something bad to them?" The friend is very often the child asking.`
        ]},
        { t: "p", lines: [ `The first ten seconds matter most.` ]},
        { t: "sayNotSay", sayHeading: `Say this`, say: [ `"I believe you."`, `"This is not your fault."`, `"I'm glad you told me."`, `"Take your time."` ], sayNote: `Then stay calm and let the child speak without interrupting.`,
          notHeading: `Not this`, not: [ `"Are you sure?"`, `"Why didn't you tell me before?"`, `"Why did you go with him?"`, `"Let's keep this between us."` ] },
        { t: "p", heading: `Do not promise secrecy.`, lines: [
          `A child will often ask first: "Promise you won't tell anyone." That promise cannot be kept — reporting is a legal duty, and secrecy leaves the child where they are.`
        ]},
        { t: "quote", heading: `Say this instead:`, lines: [
          `"I can't promise to keep it a secret, because if somebody is hurting you, my job is to make it stop. But I promise I'll tell you who I'm telling. And I'll stay with you through it."`
        ]},
        { t: "p", lines: [
          `Two questions are enough: "Can you tell me what happened?" and "Is there anything else you want to tell me?" Then stop. Do not keep pressing — "and then what happened", "tell me more", "what else did he do" — that is investigation, and it is not yours to do.`
        ]},
        { t: "visual", video: `video/ch05-screen-5-1-child-tells-you.mp4`, lines: [
          `Still of two people on a step seen from behind, adult and child, neither looking at the other. Five horizontal cards, children never making eye contact, boys in at least two. Bottom strip: "The difference is not how much you care. It is what comes out of your mouth in the first ten seconds."`
        ]}
      ]
    },
    {
      id: "5.2",
      heading: `SCREEN 5.2a — The next hour`,
      severity: "warning",
      blocks: [
        { t: "interaction", kind: "linearBranching", data: {
          continuity: `Same child as 5.1 — same name, same illustration, same clothing. This must read as one continuous event, not a new scenario.`,
          beats: [
            {
              situation: `The child has stopped talking. She is looking at the floor.`,
              choices: [
                { label: `"Did he touch you here?"`, correct: false, feedback: `She nods. But the word was yours, not hers. In court, the defence will say exactly that — that you put it in her mouth. Replay.` },
                { label: `"Thank you for telling me. I believe you." — and say nothing more`, correct: true, feedback: `You are not the investigator. Your job is to hear it, and to write it down.` },
                { label: `"Can you tell me the whole thing from the beginning?"`, correct: false, feedback: `She has told it once already. Every retelling costs her, and any small difference between the tellings will be used against her later. Replay.` }
              ]
            },
            {
              situation: `The headmistress is passing the corridor. She stops. "What's going on?"`,
              choices: [
                { label: `Call her over so the child can tell her too`, correct: false, feedback: `That is two adults. By evening it will be five. Each one will ask her to start again. Replay.` },
                { label: `"I'll come and speak to you in ten minutes." Stay with the child.`, correct: true, feedback: `The headmistress needs to know. The child does not need to say it again.` }
              ]
            },
            {
              situation: `Another teacher says quietly: "Take a photo of the marks. We'll need proof."`,
              choices: [
                { label: `Photograph the marks`, correct: false, feedback: `You have made an image of a child's body, and exposed her again to do it. Medical examination is a doctor's work, on the direction of the police or the CWC. Not yours. Replay.` },
                { label: `Do not photograph. Do not lift her clothing.`, correct: true, feedback: `Correct.` }
              ]
            },
            {
              situation: `You see him in the corridor. He is walking towards the staff room.`,
              choices: [
                { label: `Ask him directly what happened`, correct: false, feedback: `Now he knows. Anything that could have been evidence will be gone by tonight — and so, possibly, will he. The child is less safe than she was ten minutes ago. Replay.` },
                { label: `Say nothing. Keep walking.`, correct: true, feedback: `Correct.` }
              ]
            }
          ],
          completionPanel: {
            heading: `Before you leave today, write it down.`,
            writeHeading: `Write`,
            dontHeading: `Do not`,
            rows: [
              [`Her exact words, in her language`, `Translate her words`],
              [`Date and time`, `Tidy them into sentences`],
              [`Where it happened`, `Summarise in your own words`],
              [`Who else was there`, `Wait until tomorrow`]
            ],
            note: `A summary in your own words is not a record. "Inappropriate touching" is your phrase, not hers.`
          }
        }}
      ]
    },
    {
      id: "5.2b",
      heading: `SCREEN 5.2b`,
      severity: "warning",
      focusMode: true,
      blocks: [
        { t: "interaction", kind: "emergencyChoice", data: {
          question: `Tonight — does the child go back to where that person is?`,
          choices: [
            { label: `YES`, urgent: true, feedback: `Call 1098 now. Do not send the child home with the person suspected. This is not a decision you make alone, and it is not a decision for tomorrow morning.` },
            { label: `NO`, urgent: false, feedback: `You still report. Section 19 has no "wait and see" clause. But you are not racing the clock tonight.` },
            { label: `I DON'T KNOW`, urgent: true, feedback: `Then treat it as yes. Call 1098 now.` }
          ]
        }}
      ]
    },
    {
      id: "5.2-report",
      heading: `STATIC PANEL — Where to report`,
      severity: "safe",
      blocks: [
        { t: "table", headerRow: [``, ``], rows: [
          [`1098`, `Child Helpline — free, day and night`],
          [`1091`, `Women Helpline — Tamil Nadu`],
          [`Local police / SJPU`, `Where the law says the report goes`],
          [`POCSO e-Box`, `Online, for anyone who cannot report in person`]
        ]},
        { t: "p", lines: [
          `Telling a panchayat, a school correspondent, or the family is not reporting.`
        ]}
      ]
    },
    {
      id: "5.2c",
      heading: `SCREEN 5.2c — Myth or law`,
      severity: "notice",
      blocks: [
        { t: "interaction", kind: "sequentialFlip", data: {
          items: [
            { front: `"If I'm not certain, I shouldn't report."`, back: `Suspicion is enough. Section 19 says suspects or knows.` },
            { front: `"If I report and I turn out to be wrong, I can be sued."`, back: `Not if you reported in good faith — Section 19(7), no liability, civil or criminal. Only a complaint made knowingly to humiliate or defame is an offence — Section 22(1).` },
            { front: `"A child who makes a false complaint can be punished."`, back: `Never — Section 22(2). And a child is never punished for failing to report — Section 21(3).` },
            { front: `"I told the school correspondent. I have reported."`, back: `You have not. Reporting means the police, the SJPU, the CWC, or 1098.` },
            { front: `"Staying quiet is a moral failing, not an offence."`, back: `It is an offence — up to six months, a fine, or both. Up to one year if you are in charge of an institution. Section 21.` },
            { front: `"The two families settled it, so the case is closed."`, back: `POCSO cases cannot be compromised or withdrawn. Not by payment, not by an apology, not by a marriage arranged afterwards.` }
          ]
        }}
      ]
    },
    {
      id: "5.2d",
      heading: `STATIC PANEL — Does this apply to you?`,
      severity: "safe",
      blocks: [
        { t: "p", lines: [
          `Staff of a hotel, lodge, hospital, club, studio or photographic facility, and staff of media organisations, carry a specific duty to report under Section 20.`
        ]}
      ]
    },
    {
      id: "5.3",
      heading: `SCREEN 5.3 — What happens after you report`,
      severity: "safe",
      blocks: [
        { t: "dialogue", location: `TEA SHOP`, turns: [
          { who: "Murugan", text: `Selvi. Your sister's girl. Kayal. You said you'd tell me what happened.` },
          { who: "Selvi", text: `She's nine. She stopped going upstairs. That's all it was, anna — she wouldn't go upstairs where her father's cousin stays. Two months I watched it and said nothing.` },
          { who: "Murugan", text: `So what made you finally —` },
          { who: "Selvi", text: `She wet the bed. Nine years old. And when my sister scolded her, she said sorry so many times. Like she was apologising for something else.` },
          { who: "Murugan", text: `And you called that number.` },
          { who: "Selvi", text: `1098. From the back of the shop. My hands were shaking. I thought — I am about to burn down my sister's house.` },
          { who: "Murugan", text: `What did they ask you? Proof? Papers?` },
          { who: "Selvi", text: `Nothing like that. A woman answered. She asked what I had noticed, how old Kayal is, and whether she would be in that house tonight. I said yes. She said that was the important part.` },
          { who: "Murugan", text: `And then police at the door. Jeep. Whole street watching.` },
          { who: "Selvi", text: `No. One lady officer. Plain clothes, not uniform. She sat in the front room. My sister sat with Kayal. And she asked Kayal to tell it once.` },
          { who: "Murugan", text: `Once?` },
          { who: "Selvi", text: `Once. Not at a station. Not with him standing there. She wrote down exactly what the child said, in Tamil, in the child's own words.` },
          { who: "Murugan", text: `(pause) And your sister?` },
          { who: "Selvi", text: `Two days she didn't look at me. On the third day she came and stood where you're standing. She asked me one thing — how long did you know.` },
          { who: "Murugan", text: `What did you say?` },
          { who: "Selvi", text: `Two months. And that I should have said it in the first week.` },
          { who: "Murugan", text: `She forgave you?` },
          { who: "Selvi", text: `She said the same thing I'd been telling myself. That she also knew something was wrong. Neither of us said it out loud.` },
          { who: "Murugan", text: `And now? Court, lawyers, the child standing in front of a judge?` },
          { who: "Selvi", text: `There's a woman who stays with Kayal through all of it. A support person, they call her. The hearing is closed — no public, no reporters. Kayal doesn't have to look at him. And her name can't be printed anywhere.` },
          { who: "Murugan", text: `And you?` },
          { who: "Selvi", text: `I'm a witness. One day they'll call me and I'll say what I saw. (pause) Anna, I was afraid for two months while I did nothing. This is easier than that was.` }
        ]},
        { t: "p", lines: [
          `Most people stay quiet because they don't know what they are starting. This is what happens.`
        ]},
        { t: "table", headerRow: [`Stop`, `What happens`], rows: [
          [`1 · The call`, `To 1098, the police, or the SJPU. You give what you noticed. You don't need proof.`],
          [`2 · The child's safety`, `If the child needs a safe place, the Child Welfare Committee decides. Not you.`],
          [`3 · The statement`, `Taken once, by a woman officer, in plain clothes, at the child's home or a place the child chooses, with someone the child trusts present. A child is never held at a station overnight.`],
          [`4 · Medical, only if needed`, `A woman doctor, for a girl child, with a trusted adult present. No FIR is needed first.`],
          [`5 · The court`, `A Special Court, heard in private. The child does not face the accused. Evidence within thirty days, trial within a year.`],
          [`6 · Through all of it`, `A support person stays with the child. Free legal aid. Compensation can be ordered at any stage, without waiting for the verdict.`]
        ]},
        { t: "p", lines: [
          `You may be called as a witness, and asked to say what you saw.`,
          `Nothing that identifies the child can ever be published — not the name, not the school, not the photograph.`,
          `Sections 19, 24, 26, 27, 33, 35, 36, 40.`
        ]},
        { t: "visual", video: `video/ch05-screen-5-4-after-reporting-pathway.mp4`, lines: [
          `A single horizontal path with six plain stops: the call · the police or SJPU · the child's statement, at home · the Child Welfare Committee, if care is needed · the Special Court · the trial. No faces, no uniforms, no courtroom drama. The point is that the path exists and is short, not that it is impressive.`
        ]}
      ]
    }
  ],
  quiz: {
    heading: `CHAPTER 5 QUIZ`,
    questions: [
      {
        type: "single",
        q: `Scenario. A 10-year-old says "Promise you won't tell Amma" before telling you something. The right response is —`,
        options: [
          { label: `Promise, so she feels safe enough to speak`, correct: false },
          { label: `Refuse, and say her mother will be told immediately`, correct: false },
          { label: `Say the secret cannot be kept, but that she will be told who is being told, and will not be left alone through it`, correct: true },
          { label: `Change the subject and raise it another day`, correct: false }
        ],
        feedback: `Secrecy cannot be promised — reporting is compulsory, and secrecy leaves her unprotected. But an honest promise that can be kept protects her trust. A broken one confirms her fear that adults cannot be relied on.`
      },
      {
        type: "single",
        q: `Scenario. A child starts telling you something and stops. The best response is —`,
        options: [
          { label: `"Did he touch you somewhere private?"`, correct: false },
          { label: `"Was it your uncle?"`, correct: false },
          { label: `"Take your time. Is there anything else you want to tell me?"`, correct: true },
          { label: `"Let's call your parents so you can tell them properly"`, correct: false }
        ],
        feedback: `a and b are leading — they supply information the child did not give, and can be used to undermine her evidence later. d makes the child repeat it to more adults, which is distressing and creates inconsistencies.`
      },
      {
        type: "single",
        q: `True or false. A child who tells someone about abuse and later says she made it up has probably made it up.`,
        options: [
          { label: `True`, correct: false },
          { label: `False`, correct: true }
        ],
        feedback: `Taking it back is common. It usually follows pressure from the family, fear of consequences, or distress at how the first adult reacted. It is not proof the disclosure was untrue, and the duty to report does not change.`
      }
    ]
  }
}
];

const FINAL_CARD = {
  heading: `ONE CARD TO KEEP`,
  intro: `Five things. If you remember nothing else, remember these.`,
  lines: [
    `Anyone below 18 is a child. Below 18, "yes" has no meaning in law.`,
    `A crime does not need touching. Messages, pictures, videos, and following a child are all offences.`,
    `Never forward a photo or video of child abuse. Report it, then delete it, unless the police ask you to keep it.`,
    `Suspicion is enough. You do not have to be sure — and staying quiet is itself an offence.`,
    `If a child tells you — believe, don't question, don't promise secrecy, write it down, report the same day.`
  ],
  contacts: `your local police or SJPU · POCSO e-Box`,
  disclaimer: `This module explains the law in simple words. It is not legal advice.`,
  visual: `One card, downloadable and printable, sized for a phone screenshot. Five lines and the numbers. Nothing else on it.`
};
