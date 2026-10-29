# The observable tells of AI-written text (prose and fiction), as of late October 2026

Evidence tags used below: **[Study]** peer-reviewed paper; **[Preprint]** arXiv or similar, not yet confirmed as peer-reviewed; **[Community]** editor, practitioner or forum observation (incl. Wikipedia's catalogue); **[Secondary]** journalism or a summary of a source I could not open myself. Ratios are "times the human rate" unless stated.

## 1. Words and phrases measured as over-used by LLMs (the "excess vocabulary" evidence)

### Takeaway
The vocabulary tell is the best-measured of all: corpus studies show an abrupt post-ChatGPT jump in a small set of *style* words (mostly verbs and adjectives such as delve, underscore, showcase, intricate, pivotal, commendable, meticulous), with ratios from about 10x to over 100x. It is strong at corpus level and weak for a single text, and the specific words drift with each model generation.

### Cited Findings
**Biomedical abstracts (Kobak et al.)** [Study]
- Kobak et al., "Delving into LLM-assisted writing in biomedical publications through excess vocabulary", Science Advances 11(27), eadt3813, 2 July 2025 (preprint June 2024 titled "Delving into ChatGPT usage in academic writing through excess vocabulary"). Analysed more than 15 million PubMed abstracts, 2010 to 2024 ([arXiv abs](https://arxiv.org/abs/2406.07016v5)).
- 2024 frequency ratios: "delves" r = 28.0, "underscores" r = 13.8, "showcasing" r = 10.7; frequency gaps for common words: "potential" δ = 0.052, "findings" δ = 0.041, "crucial" δ = 0.037. Intricate, pivotal, notably and comprehensive are also listed as 2024 excess words ([arXiv html](https://arxiv.org/html/2406.07016v5)).
- What changed is *style*, not content: the 2024 excess vocabulary "consisted almost entirely of style words"; of 379 excess style words, 66% were verbs and 14% adjectives. By contrast the 2021 (COVID) excess was almost entirely content nouns (79.2% nouns, e.g. respiratory, remdesivir). 454 excess words in 2024 vs 190 in 2021 ([arXiv html](https://arxiv.org/html/2406.07016v5)).
- Lower bound: at least 13.5% of 2024 abstracts were processed with LLMs, ranging from below 5% to over 40% across fields, countries and journals (e.g. China computation papers 0.41, Nature/Science/Cell 0.07) ([arXiv html](https://arxiv.org/html/2406.07016v5)). Word lists and code: [berenslab/llm-excess-vocab](https://github.com/berenslab/llm-excess-vocab).
- The paper does not report any word declining after it became known as a tell ([arXiv html](https://arxiv.org/html/2406.07016v5)).

**Peer reviews (Liang et al.)** [Study]
- Liang et al., "Monitoring AI-Modified Content at Scale", ICML 2024 (PMLR 235). In ICLR 2024 reviews, "commendable", "meticulous" and "intricate" became 9.8x, 34.7x and 11.2x more likely to appear in a sentence; similar trend in NeurIPS, not in Nature Portfolio journals. Estimated 6.5% to 16.9% of review text substantially LLM-modified (a corpus-level estimate, cannot flag individual reviews) ([arXiv pdf](https://arxiv.org/pdf/2403.07183v3); [The Register](https://www.theregister.com/2024/03/19/ai_researchers_reviewing_peers/)).

**Why these words (Juzek and Ward)** [Study]
- Juzek and Ward, "Why Does ChatGPT 'Delve' So Much? Exploring the Sources of Lexical Overrepresentation in Large Language Models", COLING 2025, pp. 6397 to 6411. Identified 21 focal words (incl. delve, intricate, underscore) whose rise in scientific abstracts is likely due to LLMs. Found no evidence the cause is architecture, algorithm choices or training data; comparative model testing is "consistent with RLHF playing a role", but a 201-participant rater study suggested people react to "delve" differently from the other focal words ([arXiv](https://arxiv.org/abs/2412.11385v1)).

**General prose (Reinhart et al.)** [Study]
- Reinhart et al., "Do LLMs write like humans? Variation in grammatical and rhetorical styles", PNAS 2025 (DOI 10.1073/pnas.2422455122 per a listing). GPT-4o uses "camaraderie" at 162x, "tapestry" 155x, "intricate" 119x, "palpable" 95x the human rate; GPT-4o Mini: camaraderie 171x, tapestry 147x, palpable 145x, intricate 129x; Llama 3 instruct: "unease" 63x (70B) and 101x (8B), "palpable" 47x and 48x. Example sentence: "The camaraderie was palpable." ([arXiv html v2](https://arxiv.org/html/2410.16107v2); [CMU news](https://www.cmu.edu/dietrich/news/news-stories/2025/large-language-models-writing-text)).

**Era-by-era word lists (Wikipedia)** [Community]
- Wikipedia's "Signs of AI writing" (October 2026 revision) lists "AI vocabulary": delve, crucial, pivotal, tapestry, testament, underscore, showcase, vibrant, valuable, and shows them shifting by model era: 2023 to mid-2024 (GPT-4) "Additionally", "boasts", "intricate", "delve", "tapestry"; mid-2024 to mid-2025 (GPT-4o) "align with", "fostering", "highlighting", "showcasing"; mid-2025 to mid-2026 (GPT-5) "emphasizing", "enhance", "highlighting", "showcasing"; mid-2026 onward (labelled GPT-6 on the page) "leverage", "multifaceted", "prioritize", "foster", with shorter sentences and more periods and commas. Grok overuses "causal", "empirical", "correlate" ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Its reliability rule: one or two such words may be coincidence; a post-2022 edit dense with them is "a strong tell"; do not assume synonyms are also overused ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Stock phrases it flags: "stands/serves as", "is a testament/reminder", "pivotal/crucial/key role/moment", "setting the stage for", "evolving landscape"; promotional "boasts a", "vibrant", "rich", "nestled", "in the heart of", "groundbreaking"; vague association "in connection with", "associated with" ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Copula avoidance: "is/are" replaced by "serves as", "stands as", "marks", "functions as", "boasts", "features", "offers", "refers to" (documented in GPT and Gemini output) ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Inverse: human Wikipedia writing more often uses plain "there is a"/"it has a", "wrote" not "authored", "died" not "passed away", superlatives like "was the first", qualifiers like "very", "perhaps", "tends to", and wordy "in order to", "the fact that" ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).

### Inferences
- The measured tells are style words that dress up a claim (verbs of emphasis: underscore, showcase, highlight, delve; evaluative adjectives: intricate, pivotal, commendable, meticulous), not topic words. That is why they read as "AI": they add significance without adding information.
- Three independent lines (Reinhart: base models are near-human; Juzek and Ward: RLHF consistent; Hamilton and Mimno, section 4: preference data) point to post-training, not pre-training data, as the source of the tics.
- Any word list dates fast: "delve" is a GPT-4 era marker, "leverage/multifaceted" a 2026 one (per Wikipedia). A catalogue should present words as era-specific examples, not a fixed blacklist.

### Gaps
- I did not find a peer-reviewed study tracking whether "delve" and similar words *declined* after becoming public tells; Kobak's paper does not report it.
- The Wikipedia era lists (GPT-5, "GPT-6") are editor observation; I did not find the underlying measurements.
- "Here's the thing", "Let's dive in", "In today's fast-paced world" and similar signposting phrases: I found no study quantifying them in this pass (only community lists).

## 2. Sentence and structure tells (contrasts, triplets, participle tails, nominalisations, rhythm, signposting, endings, punctuation, formatting)

### Takeaway
Two structure tells are well measured: present participle clauses (", highlighting...") at 2 to 5x human rates and nominalisations at 1.5 to 2x (Reinhart et al., PNAS), and "It's not X, it's Y" at up to 6.3x in some models (Antislop). Rule of three, title case, bold-header bullets, emoji bullets and summary endings are well catalogued by editors but not measured. Em dashes were a strong tell from 2022 but Wikipedia now files them as historical (September 2026), and the popular "low burstiness" claim is weakly supported.

### Cited Findings
**Grammar (Reinhart et al., PNAS 2025)** [Study]
- Instruction-tuned models use present participial clauses at 2 to 5x the human rate (GPT-4o 5.3x, d = 1.38) and nominalisations at 1.5 to 2x (GPT-4o 2.1x, d = 1.23). Also overused by GPT-4o: "that" clauses as subject 2.6x (d = 0.77), phrasal coordination 1.9x (d = 0.81). Agentless passive at "roughly half" the human rate. GPT-4o avoids clausal coordination, Llama 3 overuses it; GPT-4o overuses downtoners (barely, nearly), Llama avoids them ([arXiv html v2](https://arxiv.org/html/2410.16107v2)).
- Examples: participle "Bryan, leaning on his agility, dances around the ring, evading Show's heavy blows." Nominalisation: "These schemes can help to reduce deforestation, habitat destruction, and pollution, while also promoting sustainable consumption patterns." ([arXiv html v2](https://arxiv.org/html/2410.16107v2)).
- Base (non-instruction-tuned) Llama 3 is close to human rates; the authors attribute the dense, noun-heavy, informational style to instruction tuning. Corpora: HAP-E (8,290 texts) and CAP (9,615 texts) ([arXiv html v2](https://arxiv.org/html/2410.16107v2)).
- Detectability from these features alone: pairwise human-vs-one-LLM random forests 93% to 98%; seven-way classifier 66% vs 14% chance; accuracy dropped sharply on out-of-domain GPT-3.5 abstracts ([arXiv html v2](https://arxiv.org/html/2410.16107v2)).

**Participle tails as "superficial analysis"** [Community]
- Wikipedia: trailing present-participle phrases with "highlighting/underscoring/emphasizing", "ensuring", "reflecting/symbolizing", "fostering" that bolt an interpretation onto a fact; RAG chatbots attach them to named sources regardless of what the source says ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).

**"Not X, but Y" (negative parallelism)** [Preprint] + [Community] + [Secondary]
- Antislop (Paech et al., arXiv 2510.15061, Oct 2025): "It's not X, it's Y" constructions are 6.3x more prevalent than in human writing in some models; a regex ban suppressed them 100% ([arXiv](https://arxiv.org/html/2510.15061)).
- Wikipedia lists three forms: "Not just X, but also Y", "Not X, but Y" ("It's not..., it's..."), and "Y rather than X" (e.g. "Rather than introducing a new decompiler, REA acts as an interface..."), the last "particularly common in recent LLM output". It notes human "myths busted" listicles use it too ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Wikipedia: "corrective framings" such as "rather than" were "extremely uncommon, verging on unheard-of" before mid-2026, "roughly coinciding with the July release of GPT-5.6" ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- The Atlantic (via aiweekly summaries, not read directly): a Washington Post dataset found "not just X, but Y" variants in roughly 6% of July ChatGPT messages; Barron's counted the phrase in Fortune 500 filings rising from about 50 (2023) to over 200 (2025); OpenAI's Laurentia Romaniuk calls it "contrastive phrasing"; it is described as the tic hardest to shake after "delve" faded ([aiweekly 1](https://aiweekly.co/alerts/atlantic-ais-its-not-x-its-y-tic-proves-hardest-to-shake); [aiweekly 2](https://aiweekly.co/alerts/atlantic-tracks-ais-not-x-but-y-tic-into-fortune-500-filings)) [Secondary].
- Commentary: it is classical antithesis (e.g. "not in our stars, but in ourselves"); humans use it sparingly, models apply it to anything from recipes to reports; the RLHF-reward explanation is a hypothesis from blogs ([tropes.fyi](https://tropes.fyi/tropes/negative-parallelism); [bearblog](https://vasudev.bearblog.dev/the-not-x-but-y-machine/)) [Community].

**Rule of three** [Community]
- Wikipedia: triplets used "to make superficial analyses appear more comprehensive"; stronger where people would not bother with flourishes (e.g. edit summaries) ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)). Reinhart's phrasal coordination overuse (1.9x) is the closest measured correlate ([arXiv html v2](https://arxiv.org/html/2410.16107v2)).

**Paragraph and document structure** [Community]
- Formulaic closers: "Despite its... faces several challenges", "Despite these challenges", headings like "Challenges and Legacy", "Future Outlook"; only the rigid formula counts ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Section summaries ("In summary", "In conclusion", "Overall", a "Conclusion" section that restates the core idea): now filed as a *historical* indicator, common in older models ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- "Awards and recognition" sections "nearly ubiquitous" in AI-drafted articles; "X and Y" headings common ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Elegant variation / synonym cycling (from repetition penalties in older models): historical; caveat that non-native writers taught to avoid repetition do it too ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).

**Punctuation** [Community, citing a study]
- Em dashes: listed as historical for 2022 to September 2026. LLMs used them far more than nonprofessional writers, where humans would use commas, parentheses or colons, and AI em dashes are often spaced. OpenAI tried to suppress them in GPT-5.1; a July 2026 study (cited by the page, not verified by me) found only Claude still used them more than professional writers; from September 2026 some models were reportedly hard-coded to avoid them, which made commas and periods more common, "now its own sign" ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Curly quotes: ChatGPT and DeepSeek typically use curly quotes, Gemini and Claude typically do not; "Curly quotes alone do not prove LLM use" ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).

**Formatting** [Community]
- Title Case in headings; boldface on every instance of a key phrase (less reliable now as newer models are told to avoid it); inline-header bullets (bullet + **bold label** + colon; lost when copied as plain text); skipped or odd heading levels; emoji before headings or bullets ("more rare now"); small tables that should be prose; leftover Markdown (`**`, `---`, backticks) and artefacts like `contentReference[oaicite:1]`; `<mark>` highlights from Gemini's "Double-check response"; `utm_source=` links ("near-definitively proves ChatGPT's involvement" in sourcing, not that it wrote the prose) ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).

**Rhythm and "burstiness"** [mixed, weak]
- Vendor and blog claims say AI sentences cluster in a narrow length band (one undocumented figure: about 40% of AI sentences in the 21 to 35 word band vs 13% of human) ([codaone glossary](https://www.codaone.ai/glossary/burstiness/)) [Community].
- Contrary: a matched-pair test on 5,935 register- and length-matched documents gave sentence-length burstiness an AUROC of 0.521 (chance 0.5), with machine prose marginally *more* variable; not peer-reviewed ([opace](https://opace.agency/tools/ai/content-verification-integrity/research/ai-writing-myths-measured/)) [Community].
- A NeurIPS 2026 abstract, "Burstiness Was Measured Wrong, and Prompting Cannot Aim It", argues raw sentence-length variance is confounded with mean length ([NeurIPS 2026](https://neurips.cc/virtual/2026/164820)) [Preprint, abstract only]. CT² (2023) concluded newer LLM text is nearly statistically indistinguishable from human text on such measures ([arXiv](https://arxiv.org/pdf/2310.05030)) [Preprint].

### Inferences
- The measured structure tells share one function: they manufacture depth. The participle tail adds an interpretation, the "not X but Y" frame invents a misconception to correct, the triplet makes a thin claim look complete, the nominalisation turns actions into abstract nouns.
- Punctuation and formatting tells are the most era-bound and the easiest for vendors to patch (em dash, bold, emoji), and patching creates replacement tells (comma and period density). They should be presented as "was a tell" with dates.
- "Even sentence rhythm / low burstiness" should be presented as folk wisdom with weak or contrary evidence, not as an established sign.

### Gaps
- No peer-reviewed measurement found for the rule of three, title-case headings, emoji bullets, signposting openers ("Here's the thing", "Let's dive in", "Great question") or summary endings; all are community observation.
- The "July 2026 study" on em dashes is cited by Wikipedia; I could not identify or open it.
- Hedging: Reinhart reports downtoner overuse in GPT-4o; Wikipedia documents hedging disclaimers; I found no direct study of hedge density in general LLM prose in this pass.

## 3. Tone tells (positivity, sycophancy, significance claims, abstraction, morals)

### Takeaway
The tone tells are mostly catalogued by editors rather than measured: inflated significance ("plays a pivotal role", "a testament to"), promotional warmth ("vibrant", "nestled", "rich"), vague attributions ("experts argue"), canned challenge-and-future endings, chatty service phrases ("Certainly!", "I hope this helps"). The measured backing is indirect: the excess-vocabulary words are precisely evaluative and emphatic style words, and writers' edits of AI prose most often target vague, over-explained, clichéd text.

### Cited Findings
- Undue emphasis on significance, legacy and broader trends, often added to mundane subjects and sometimes after a hedging preamble; mid-2026 text pairs it with hedging disclaimers ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)) [Community].
- Promotional tone: older models (GPT-4) blatantly positive; newer ones subtler and avoid superlatives like "the best"; subtypes are cultural-heritage reminders, travel-guide tone, press-release tone ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)) [Community].
- Weasel attributions: "Industry reports", "Observers have cited", "Experts argue", "Some critics argue"; exaggerated source counts ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)) [Community].
- Canned emphasis on notability and coverage ("independent coverage", "regional media outlets", "active social media presence"), more common in 2025+ text and listed among the most common current signs ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)) [Community].
- Hedging disclaimers: 2023 to 24 "it's important to note"; 2024 to 25 "not widely documented", "not publicly available"; knowledge-cutoff lines ("as of my last knowledge update") are now historical ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)) [Community].
- Collaborative/servile chat leftovers: "Certainly!", "I hope this helps", "let me know", "Would you like help formatting..." ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)) [Community].
- Abstraction over specifics: in professional writers' edits of GPT-4o, Claude 3.5 Sonnet and Llama 3.1 70B paragraphs, "Lack of Specificity and Detail" is one of seven problem categories, fixed by adding concrete sensory detail; "Unnecessary/Redundant Exposition" made up 18% of edits ([arXiv](https://arxiv.org/html/2409.14509v5)) [Preprint; CHI 2025 per one listing].
- Liang et al.'s peer-review markers ("commendable", "meticulous", "intricate") are praise adjectives, a measured trace of evaluative positivity ([arXiv](https://arxiv.org/pdf/2403.07183v3)) [Study].

### Inferences
- "Relentless positivity" shows up concretely as evaluative adjectives and significance verbs (the measured words), plus formula endings that resolve on challenges-and-future or a reassuring note.
- Tone tells are judged on context: Wikipedia stresses that promotional human copy shares many of them, and that "bland" or "robotic" feel is itself an unreliable indicator (section 5).

### Gaps
- I found no study in this pass measuring sycophancy or "uplifting moral" endings in prose as a *detectable* stylistic tell (sycophancy research mostly concerns agreeing with users, not prose style).
- No quantitative source found for "plays a crucial role" as a phrase; the evidence is for the individual words (crucial, pivotal) and Wikipedia's phrase list.

## 4. Fiction tells (names, stock sensory clichés, exposition, purple prose, endings)

### Takeaway
Fiction has the strongest single-text tells: stock names (Elara at 85,513x human frequency in one model; Elias, Mara, Elara, lighthouses, clockmakers in 88.3% of 20,000 stories), stock bodily-emotion clichés ("voice barely above a whisper", "heart hammered", "flickered" in 98.5% of 67 models' top lists), and writer-identified problems of awkward phrasing, over-explanation and cliché. LLM stories pass 3 to 10x fewer expert creativity tests than professional stories.

### Cited Findings
**Creativity gap (Chakrabarty et al., "Art or Artifice?", CHI 2024)** [Study]
- Torrance Test of Creative Writing: 14 binary tests across Fluency, Flexibility, Originality and Elaboration; 10 creative writers judged 48 stories; "LLM-generated stories pass 3-10X less TTCW tests than stories written by professionals"; no LLM judge correlated positively with expert judgments ([arXiv](https://arxiv.org/abs/2309.14556)).

**What writers edit out (Chakrabarty, Laban and Wu, "Can AI writing be salvaged?")** [Preprint, v5 March 2025; listed as CHI 2025 submission]
- LAMP corpus: 1,057 LLM paragraphs (GPT-4o 393, Claude 3.5 Sonnet 368, Llama 3.1 70B 296), 8,035 edits by professional writers ([arXiv html](https://arxiv.org/html/2409.14509v5)).
- Seven categories: Cliché; Unnecessary/Redundant Exposition; Purple Prose; Poor Sentence Structure; Lack of Specificity and Detail; Awkward Word Choice and Phrasing; Tense Inconsistency. Shares: Awkward Word Choice 28%, Poor Sentence Structure 20%, Redundant Exposition 18%, Cliché 17% ([arXiv html](https://arxiv.org/html/2409.14509v5)).
- Examples: cliché "glaring back at me like an unsolvable riddle" rewritten "The numbers stared back"; purple "an unsettling sense of mystery that gnawed at me"; awkward "seemed to amplify" -> "amplified" ([arXiv html](https://arxiv.org/html/2409.14509v5)).
- Phrases disproportionately frequent in LLM output: "unspoken", "weight of", "sense of", "mix of", "air was thick", "hung in the air", "eyes darting", "a sense of unease", "in the pit of (her/my) stomach"; patterns "a pang of nostalgia and", "a web of belonging and", "a constant reminder of his", "the weight of unresolved history", "a tapestry of modernity" ([arXiv html](https://arxiv.org/html/2409.14509v5)).
- No significant quality difference between the three models; GPT-4o somewhat more purple prose, Llama more exposition; fiction scored lowest for all (avg 4.5). Models were poor at spotting their own tics (best general precision 0.46 vs expert agreement 0.57) ([arXiv html](https://arxiv.org/html/2409.14509v5)).

**Slop n-grams and names (Antislop, Paech et al.)** [Preprint, Oct 2025; reportedly ICLR 2026, unverified]
- vs wordfreq and a Reddit creative writing + Project Gutenberg baseline: "elara" 85,513x, "unsettlingly" 3,833x, "shimmered" 2,882x, "stammered" 2,043x (gemma-3-12b); trigrams "heart hammered ribs" 1,192x, "voice trembling slightly" 731x, "said voice devoid" 693x, "felt profound sense" 550x. Across 67 models, "flickered" is in the top over-represented list for 98.5%, "voice barely whisper" for 68.7%, "said voice low" for 61.2%. Names "Elara" and "Kael" called out. Headline: some patterns over 1,000x human frequency ([arXiv](https://arxiv.org/html/2510.15061)).

**Convergent story content (Hamilton and Mimno)** [Preprint, May 2026]
- "Elias in the Lighthouse, Again? Diagnosing Low Diversity in LLM Stories": 20,000 stories from four current models and five prompts; 11 words appear in 88.3% of stories with little difference between models, incl. names Elias, Mara, Elara, the lighthouse setting, clockmaker and librarian professions. These are rare in published literature and pre-training data but present in preference data likely used by all current models ([arXiv](https://arxiv.org/abs/2605.26492)).

**Stock names** [Preprint + Community]
- "The Ghost Couple" preprint reports model-specific name pairs (e.g. Claude's Elena Vasquez and Marcus Chen; GPT's Elara Voss with no fixed partner) ([arXiv html](https://arxiv.org/html/2606.02184)) [Preprint, seen only via search summary].
- "Dr. Sarah Chen" from Claude reported qualitatively (Wagner 2025, as cited in a preprint); an essay notes no "Elara Voss" existed before 2023 yet 62 books credited to that name were on Amazon, and proposes WoW's Lilian Voss and SWTOR's Elara Dorne as corpus echoes (hypothesis) ([essay copy](https://tagteam.harvard.edu/hub_feeds/2029/feed_items/15265164/content); [intfiction forum](https://intfiction.org/t/beneath-the-exhibition-and-elara-voss/80429)) [Community].
- Reinhart: GPT-4o's "camaraderie", "palpable", Llama's "unease" at 47x to 171x come largely from narrative continuation tasks ([arXiv html v2](https://arxiv.org/html/2410.16107v2)) [Study].

### Inferences
- The fiction tells cluster into: (a) names and settings from a small shared pool, (b) emotions rendered through a fixed set of body clichés (whisper, hammering heart, pit of stomach, breath, flicker), (c) abstract emotion nouns ("a sense of unease", "the weight of", "unspoken"), which is the measurable face of "telling not showing" and over-explained subtext.
- Because all major models converge on the same pool (88.3% across models; "flickered" in 98.5% of 67 models), fiction tells are less model-specific than nonfiction vocabulary.

### Gaps
- "A breath she didn't know she was holding", "something shifted", "tidy resolution", "uplifting moral ending": I found no study quantifying these in this pass; they appear only in community lists (and the breath line predates LLMs as a fan-fiction cliché, so it is weak evidence alone).
- Per-test TTCW failure breakdown (e.g. which of the 14 tests, such as endings or subtext, LLM stories failed most) was not in the abstract I could read; the full CHI paper has it.
- The full list of Hamilton and Mimno's 11 words and the four model names were not in the abstract.

## 5. Community catalogues and how reliable they say each sign is

### Takeaway
Wikipedia's "Signs of AI writing" (WikiProject AI Cleanup) is the most detailed living catalogue; it is explicitly descriptive, dates its signs by model era, files em dashes, section summaries and knowledge-cutoff lines as historical, and lists "ineffective indicators" (perfect grammar, formal or "robotic" prose, isolated transitions). Detector tools and untrained human judgment are both described as unreliable.

### Cited Findings
- Framing: "descriptive, not prescriptive"; signs are indicators, not proof; many appear in editorials, blogs and fan fiction; fixing surface signs only makes detection harder; only the most objective signs justify speedy deletion (G15) ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Most common signs of new AI text as of October 2026: Markdown, AI edit summaries, hedging disclaimers about source availability, vague connection/association, canned emphasis on attribution and media coverage ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Ineffective indicators: perfect grammar; mixed casual and formal registers (can reflect youth, neurodivergence, multiple editors); "bland" or "robotic" prose; "fancy", "academic" or formal prose; transition words like "Additionally", "Notably" in isolation; unsourced content; bizarre or correct wikitext ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Historical indicators: em dashes (2022 to September 2026), section summaries, knowledge-cutoff statements (2022 to 2023), "as an AI language model" refusals, abrupt cut-offs, elegant variation ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Signs of human writing: text predating 30 November 2022; ability to explain one's edits; plain copulas, plain verbs, superlatives, qualifiers, wordy constructions ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Model idiolects differ: GPT-5 is not like GPT-4 or Gemini; Gemini and Claude more concise than ChatGPT and Grok; a sudden shift to flawless grammar vs an editor's earlier talk-page writing is a sign ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- Detection: AI detectors have non-trivial error rates and are fooled by paraphrasing; the page cites a 2025 study with humans no better than chance, another with 57% recognition of AI and 64% of human texts, and a 2025 preprint with expert annotators at 90% accuracy and 3.3% false positives; it notes humans are drifting toward LLM style, not the reverse ([Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).

### Inferences
- The catalogue's own reliability ladder: near-proof artefacts (chat leftovers, placeholder text, `oaicite`, `utm_source=chatgpt`, fake DOIs) > dense clusters of era-specific vocabulary and formulaic structures > single words, punctuation or "feel" (unreliable alone).
- The expert-annotator preprint the page cites is probably Russell, Karpinska and Iyyer (2025) on frequent ChatGPT users as detectors (my recollection, not verified in this pass); it supports the idea that trained readers spot clusters, not single tells.

### Gaps
- Teachers' and editors' guides beyond Wikipedia (e.g. university writing centres) and the Atlantic piece itself were not opened in this pass; the Atlantic findings above come via secondary summaries.
- I could not identify the specific 2025 human-detection studies and the July 2026 em-dash study that Wikipedia cites.
