# Say again: how coast stations and rescue centres really work

Checked 2026-11-01. Sources are primary where I could open them (IMO SMCP, ITU-R
recommendations, US federal rules, UK and Finnish government pages, MAIB reports, an EU tender).
Where a fact comes only from a search excerpt, a press story or a forum, it says so.

Main primary texts used throughout:
- IMO SMCP, resolution A.918(22), full English text (copy of the IMO document):
  https://lnx.scmncamogli.org/oldsite/frasi_inglesi.pdf (IMO page:
  https://www.imo.org/en/OurWork/Safety/Pages/StandardMarineCommunicationPhrases.aspx)
- ITU-R M.1171 (radiotelephony procedures, 1995 text; revised 2023 as M.1171-1):
  https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.1171-0-199510-S!!PDF-E.pdf
- ITU-R M.541-9 (DSC operating procedures, with the voice formats that follow a DSC call):
  https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.541-9-200405-S!!PDF-E.pdf

## 1. Radio checks

**Channel.** Not on 16 if it can be avoided. The US Coast Guard tells boaters to use channel 09
for radio checks, not 16, and says it does not monitor 09. HM Coastguard says it will try to
accommodate radio checks, but asks for them with another vessel on a pre-arranged working channel,
or with a shore station such as a marina, because checks clog 16. Its policy differs between
centres. A UK sailing writer lists the usual partners: another yacht on a working channel, the
local coastwatch station (channel 65), a marina (channel 80), or the coastguard on its working
channel (67 for Solent).

**Test transmissions.** US rules: give the call sign and the word "test", keep a test signal under
ten seconds, and on 156.800 MHz (channel 16) leave at least five minutes between tests. In the
GMDSS the proper check is a DSC test call on channel 70 to a coast station: the station
acknowledges it automatically and that is the end of it (ITU-R M.541-9, annex, section 5).

**The call.** On VHF, when contact is easy, ITU allows the short form: the called station once,
THIS IS, your own name twice (M.1171, section 10). A real example from a UK article:
- "Shoreham NCI, this is yacht Voyager. Radio check. Over."
- "Voyager, you are loud and clear. Over."
- "This is Voyager, thank you. Out."

**Signal reports.** SMCP 6.1 gives the maritime scale:
- Question: "How do you read (me)?"
- Answer: "I read you bad / one", "poor / two", "fair / three", "good / four", "excellent / five".
- Or by signal strength: one (barely perceptible), two (weak), three (fairly good), four (good),
  five (very good).
In everyday use "loud and clear" is what people say. A single number ("I read you five") is
maritime. "Five by five" (strength by readability) is army and aviation slang, not SMCP.

**Two coast stations.** Neighbouring coast stations and rescue centres are linked by telephone and
data lines, and today often run their masts remotely from one room: Lithuania's GMDSS is one
control centre in Klaipėda and four remote sites (2009); Turku Radio broadcasts from the Western
Finland VTS centre; Canada's VHF direction finders are all remotely controlled from traffic
centres. A VHF radio check between two coast stations on 16 would be unusual.

Sources:
- USCG MSIB 20-20 (2020), use channel 09: https://www.dco.uscg.mil/Portals/9/DCO%20Documents/5p/MSIB/2020/MSIB-20-20.pdf (read through a search summary)
- MCA statement on radio checks, Yachting Monthly 2005: https://www.yachtingmonthly.com/archive/should-you-ask-the-coastguard-for-a-radio-check-25757
- Andy Du Port, Yachting Monthly 2021-12-03: https://www.yachtingmonthly.com/sailing-skills/how-and-when-to-make-a-vhf-radio-check-and-when-not-to-81834
- 47 CFR 80.101 (test transmissions): https://www.law.cornell.edu/cfr/text/47/80.101
- ITU-R M.541-9 and M.1171: links at the top
- SMCP 6.1: link at the top
- Lithuanian GMDSS, 1 control centre and 4 remote sites: https://thedigitalship.com/news/lithuanian-gmdss-completes-modernisation
- Turku Radio: https://fintraffic.fi/en/vts/maritime-safety-radio

## 2. A coast station's SÉCURITÉ broadcast

**Format.** After a DSC safety call on channel 70 (which names the channel the message will be on),
the voice message is (ITU-R M.541-9):
- "SÉCURITÉ", three times
- "ALL STATIONS" (or the station called), three times
- "THIS IS" and the station's name
- the text.
SÉCURITÉ is said as in French. The SMCP example addresses an area: "SÉCURITÉ SÉCURITÉ SÉCURITÉ.
ALL SHIPS ALL SHIPS ALL SHIPS IN AREA PETER REEF. THIS IS ... DANGEROUS WRECK LOCATED IN POSITION
TWO NAUTICAL MILES SOUTH OF PETER REEF."

**Two steps.** Coast stations announce on 16 and read the warning on a working channel. The RYA
says the coastguard's announcement on 16 names the channel to select; Turku Radio's own notice
says "Periodical broadcasts are announced on channel 16." A training example (not an official
script) of the announcement: "SÉCURITÉ SÉCURITÉ SÉCURITÉ, ALL STATIONS ALL STATIONS ALL STATIONS,
THIS IS SOLENT COASTGUARD SOLENT COASTGUARD SOLENT COASTGUARD. FOR IMPORTANT NAVIGATIONAL WARNING
LISTEN ON VHF CHANNEL SIX SEVEN. OUT." On 67 the full text follows, again opening with SÉCURITÉ
and ALL STATIONS, and ends with OUT.

**Exception.** ITU allows a brief safety-of-navigation message (under one minute) to stay on 16
when every ship in range must hear it (M.1171, section 22(5)). So a one-line local fog warning on
16 is defensible; a full forecast is not.

**Times.** Broadcasts run at fixed minutes, in UTC. Turku Radio: navigational warnings at 0233,
0633, 1033, 1433, 1833, 2233 UTC; weather at 0633 and 1833; ice at 1033 and 1833. HM Coastguard:
inshore forecast and any gale warning every three hours, gale warnings also as soon as received,
on channels 62, 63 or 64. Lithuania's Navy MRCC broadcasts local navigational warnings on VHF in
Lithuanian and English (IHO report, search excerpt).

Sources:
- ITU-R M.541-9 annex, section 3: link at the top
- 47 CFR 80.1133 (SÉCURITÉ, pronounced as in French, three times): https://www.law.cornell.edu/cfr/text/47/80.1133
- SMCP appendix, standard safety message: link at the top
- RYA, Maritime Safety Information: https://www.rya.org.uk/water-safety/passage-planning-and-navigation/maritime-safety-information/ (search summary)
- Training script: https://open-exam-prep.com/study-guides/eu-rya-src-vhf/emergency-communications-distress/securite-safety-messages
- Turku Radio times and "announced on channel 16": https://fintraffic.fi/en/vts/maritime-safety-radio and the Traficom radio log booklet https://traficom.fi/sites/default/files/media/file/radiop%C3%A4iv%C3%A4kirja_radiodagbok.pdf
- UK MSI leaflet (withdrawn March 2025, replaced by Advice Note 1033): https://www.gov.uk/government/publications/maritime-safety-information-leaflet/maritime-safety-information-leaflet
- IHO BSHC28, Lithuania: https://iho.int/uploads/user/Inter-Regional%20Coordination/RHC/BSHC/BSHC28/BSHC28_B.3.6_%20National%20report%20Lithuania_presentation.pdf (search excerpt)

## 3. A PAN-PAN from a fishing boat with a dead engine in fog

**What the boat sends.** "PAN PAN" three times, "ALL STATIONS" three times, "THIS IS", the boat's
identity, then the message. SMCP says urgency traffic always begins with the position. The SMCP
example ends: "I HAVE PROBLEMS WITH ENGINES. I REQUIRE TUG ASSISTANCE. OUT." PAN is said like the
French word "panne".

**The answer.** I found no fixed ITU wording for a voice acknowledgement of a PAN-PAN. Real
coastguard answers are plain: the boat's name, "this is", the station, then the first question.
A BBC visit to Thames Coastguard quoted: "Venturer, Venturer, this is Thames Coastguard. What is
your position?"

**The questions.** From SMCP and coastguard guidance, roughly in this order:
- Position (SMCP: lat and long, or bearing and distance FROM a charted mark).
- Nature: SMCP "What problems do you have?" / "I have problems with engine(s)"; "I am drifting
  at ... knots to ...".
- Persons on board: SMCP "Report number of persons on board."
- Assistance: SMCP "What kind of assistance is required?", "Can you proceed without assistance?"
- Then: anyone hurt, lifejackets on, children on board, description of the boat (type, size,
  colour), what radios and phones are on board, safety equipment. These come from a HM Coastguard
  information-gathering checklist quoted in an MAIB report, a US article built on watchstander
  interviews, and lifeboat logs.
- Keep in touch: "Stand by on VHF channel ..." / "Standing by on VHF channel ...". One skipper
  reports Solent Coastguard asked for his position and progress every 30 minutes.

**Broadcast on the boat's behalf.** If the boat's radio is weak, the coast station sends the
PAN-PAN itself. Wick, 25 January 2022: an 8.5 m fishing boat with machinery failure and failing
batteries phoned, then used a handheld VHF. Shetland Coastguard broadcast the PAN-PAN; no vessel
answered; the lifeboat was paged at 00:36 and launched at 00:45.

**Tasking the rescue boat.** The rescue boat is alerted by phone or pager, not by a call on 16:
- UK: the coastguard asks the station's launch authority, who decides; the coastguard pages the
  crew; the boat goes only if coastguard, launch authority and coxswain all agree.
- Germany: MRCC Bremen alerts the nearest DGzRS station; rescue cruisers have permanent crews,
  smaller boats volunteer crews (press, read through search summaries).
- Sweden: JRCC talks to rescue units on maritime VHF, on a SAR channel (67 or 74 by region).
- Finland: channel 14 is the rescue authorities' working channel.

**Finding her in fog.** The Wick lifeboat found the dim fishing boat with radar, its VHF direction
finder, binoculars and a night vision intensifier, then talked to the skipper directly.

**In tow.** The coxswain decides on a tow, usually to the nearest safe haven (Wick towed to
Helmsdale). An RNLI all-weather boat carries a 200 m towline on a 15 m bridle, and its manual says
to keep checking the towed boat for flooding. Reports run like: in tow, persons on board well,
heading for a harbour, an ETA.

**Closing.** The station that sent the urgency message must cancel it "as soon as it knows that
action is no longer necessary" (US rule, mirrors ITU). A skipper wrote that he "cancelled the Pan
Pan with Solent Coastguard". Logs note the time of cancellation. The lifeboat reports back on
station and ready for service (Wick: back at 06:00, ready by 07:00).

Sources:
- SMCP A1/2 (urgency traffic) and appendix (standard urgency message): link at the top
- ITU-R M.541-9 annex, section 2: link at the top
- 47 CFR 80.1131 (PAN PAN as "panne", cancellation): https://www.law.cornell.edu/cfr/text/47/80.1131
- BBC News, Thames Coastguard, 2002-06-06: https://news.bbc.co.uk/2/hi/uk_news/2023020.stm (read through a mirror)
- HM Coastguard, in an emergency (position, nature, assistance, persons on board): https://hmcoastguard.uk/in-an-emergency (search summary)
- MAIB, Solstice annexes (Coastguard information gathering list): https://assets.publishing.service.gov.uk/media/5c064986e5274a6a64347969/2018_-_20_-_Solstice_Annexes_.pdf
- SpinSheet, Calling the Coast Guard (children on board, medical attention): https://www.spinsheet.com/safety/calling-coast-guard-primer
- First PAN-PAN, first-hand (forum): https://forums.ybw.com/threads/first-pan-pan-experience.461813/
- Wick lifeboat, 2022: https://www.johnogroat-journal.co.uk/news/wick-lifeboat-responds-to-fishing-vessels-pan-pan-message-t-264028/
- RNLI, what it takes to launch a lifeboat: https://rnli.org/what-we-do/lifeboats-and-stations/what-it-takes-to-launch-a-lifeboat (search summary) and https://www.porthcawl-lifeboat.co.uk/station-roles
- Sweden, SAR channel 67 or 74: https://www.sjofartsverket.se/en/search-and-rescue/contact-channels/contact-channels/ (search summary; site refused a direct fetch)
- Germany, DGzRS: https://www.yacht.de/special/seenot/seenotretter-seit-160-jahren-bei-jedem-wetter-im-einsatz/ (search summary)
- Finland channel 14: Traficom booklet, link in section 2
- MAIB Freedom II (2026): garbled calls, 15 minutes to get position and nature, Mayday Relay, tow details: https://assets.publishing.service.gov.uk/media/69ca6e08b111d64c49bb3d23/2026-8-FreedomII-ReportAndAnnex.pdf

## 4. Direction finding

**Who has it.**
- USA: Rescue 21 gives "a line of bearing from the radio tower to the source of any VHF radio
  call that it receives". Two or more towers' lines crossing give a position.
- Canada: VHF DF stations for emergency use, all remotely controlled from a traffic centre.
- UK: shore VHF DF switched off at the end of 2010, kept only for the Dover Strait. A 2022 tender
  replaced the DF at North Foreland, Fairlight and Langdon Battery. Lifeboats and aircraft carry DF.
- Germany: the old North Sea DF network (medium wave; Norddeich, Elbe-Weser, St Peter-Ording)
  closed on 31 December 1994. I found no current shore VHF DF at MRCC Bremen.
- Sweden: "all pilot stations and most sea rescue units" have VHF DF (Sjöfartsverket SAR plan
  2023, seen as a search excerpt only).
- Lithuania: in 2015 the Navy tendered for three sets of radio DF equipment for its sea
  observation posts at Palanga, Klaipėda and Nida, with a computer and software at the Navy
  control centre in Klaipėda (the notice; I did not find the award).
- Finland, Estonia: not found.

**How it shows.**
- The ITU way, by numbers: the station sends QTE, then "three digits indicating true bearing in
  degrees from the RDF station", the class and the time. Classes: A within 2 degrees, B within 5,
  C within 10. A group of stations gives a position (QTF) with a class: A within 5 nm, B 20,
  C 50. The bearing is plotted from the DF antenna's position, not the transmitter's.
- Today, as lines on a screen: VTS DF results are "displayed on radar screens"; for SAR, bearings
  from several masts "are combined for triangulation. Within seconds, a location result is
  calculated and displayed", typically to a few hundred metres (manufacturer's claim).
- One line gives a direction only. Lines crossing at a slant over land can be off by 4 to 5
  degrees; a single station can give a 180 degree ambiguity.

**Asking the caller to transmit.** The ITU service request is QTG: "Will you send two dashes of
ten seconds each (or carrier) followed by your call sign". So "transmit for ten seconds" has a
real root. Modern systems need much less: Rescue 21 was built to hear a one-second transmission
from a 1 W radio 2 m above the water at 20 nm (secondary sources), and a Coast Guard source said
a bearing comes even if the caller "only keys the microphone for half a second". The phrase
"give me a long count" I could not confirm in any source.

**A bare carrier.** Yes. DF measures the carrier, not the voice; QTG says "(or carrier)". A press
of the button with no words gives a bearing.

**Over land.** Bearings that cross on land show the caller is not at sea. Seattle: the lines from
Rescue 21 towers met on land near Everett Marina; a child-voiced call in 2023 placed near
Burlington, Vermont.

**Which channels.** ITU guidance: a VHF RDF station "should be able to take bearings on VHF
156.8 MHz and VHF digital selective calling frequency 156.525 MHz", that is channels 16 and 70.
Modern sets can watch up to 32 channels at once.

Sources:
- NGA Pub 117, chapter 1 (ITU RDF procedure, QTE, QTG, classes, land effect, Canada, UK list):
  https://msi.nga.mil/api/publications/download?key=16694477/SFH00000/117chapter1.pdf
- Rohde und Schwarz, Direction finding for vessel traffic service (brochure, 2022):
  https://cdn.rohde-schwarz.com.cn/pws/dl_downloads/pdm/cl_brochures_and_datasheets/brochure/3683_8409_62/Direction-finding-for-vessel-traffic-service_bro_en_3683-8409-62_v0100.pdf
- Rescue 21 fact sheet: https://dcms.uscg.mil/Portals/10/CG-9/Acquisition%20PDFs/Factsheets/R21.pdf (search summary)
- Yachting, two lines of bearing three or four miles from the reported position: https://www.yachtingmagazine.com/coast-guard-search-and-rescue-electronics/
- Rescue 21 one-second design: https://continuouswave.com/whaler/reference/Rescue21Stations.html (secondary)
- Half a second: Cruising World 2009-03-04, https://www.cruisingworld.com/?p=42046 (as cited in say-again-radio-facts.md)
- UK switch-off: https://www.yachtingmonthly.com/news/mca-axe-vhf-direction-finder-6154 ; tender: https://www.find-tender.service.gov.uk/Notice/016864-2022 (search summary)
- Germany: Bundestag Drucksache 13/473 (1995): https://dserver.bundestag.de/btd/13/004/1300473.pdf
- Sweden: https://www-n.sjofartsverket.se/globalassets/sjo--och-flygraddning/samverkan/samarbetsplaner-sjoraddningstjansten/sar-plan-2023.pdf (search excerpt)
- Lithuania: TED notice 265510-2015: https://ted.europa.eu/en/notice/265510-2015/pdf
- Seattle case: https://www.news.uscg.mil/Press-Releases/Article/3551036/coast-guard-seeks-public-assistance-with-hoax-call/ (search summary)

## 5. Misuse of channel 16

**First rule.** Every call is treated as real until shown otherwise. The FCC: Coast Guard staff
"treat any distress call received on channel 16 as an emergency and immediately investigate it."

**Children, real cases.**
- Shetland, July 2009, 15:00: a female voice said "We need immediate assistance"; slowing the
  recording down revealed a child saying "mayday, mayday" just before. Heard on one aerial only.
  Helicopter, lifeboat, coastguard team and two pilot boats searched; cost "tens of thousands of
  pounds". The watch manager asked parents to watch children around radios.
- Great Lakes 2017: 160 false calls by July, most from the Chicago area, "made by children who
  have access to their parents' radios". One sent a boat and a helicopter.
- Maine and Vermont 2023: a child-voiced call came in through a remote tower; DF put the caller
  near Burlington, Vermont.
- Shetland, July 2012: youths "being silly" on 16 during two rescues; staff called them several
  times, then told the police.

**Open carriers and stuck buttons.**
- Tenby, 15 June 2025, just before 01:00: Milford Haven Coastguard picked up an open mic on 16 in
  Saundersfoot Bay; a lifeboat launched to find it; the transmission stopped; back by 01:35.
- Great Yarmouth, 2004: a ship's handset jammed on, broadcasting BBC Radio 4's Today programme
  on 16; the Wells lifeboat followed the signal 10 miles out to the coaster Victress.
- Shetland, 2024 (one source only): a ship relayed Radio 4 on 16 for most of a day; noticed
  after a shift change; the coastguard broadcast a warning to check transmit buttons.

**Morse SOS on 16 really happened.** In 2000 the FCC warned that some marine radios had a button
that switched to 16 and, held for a few seconds, sent SOS in Morse automatically; the Coast
Guard had received false Morse SOS calls this way.

**What they say.** I found no fixed script. In practice: call the unknown station, ask for
position and whether it needs help, broadcast a request to all stations to check their transmit
buttons, then call the police. While any one station holds 16, nobody else can be heard on it.

**How they find the source.** Shore DF, lifeboat DF (homing along the signal), slowed and
amplified recordings, voice analysis, police.

Sources:
- FCC Public Notice DA 00-384, 2000-02-25: https://transition.fcc.gov/eb/Public_Notices/ch16.html
- Shetland 2009: https://www.yachtingmonthly.com/news/childs-game-sparks-air-sea-rescue-10362
- Great Lakes 2017: https://abc7chicago.com/post/fake-distress-calls-tripled-on-great-lakes-coast-guard-says/2206729/
- Maine and Vermont 2023: https://newscentermaine.com/article/news/crime/coast-guard-looks-to-public-for-help-in-identifying-voice-in-hoax-calls-maine-vermont/97-f2f2e823-53d9-4c78-b08c-a939c720a6a0 (search summary)
- Shetland 2012: https://shetnews.co.uk/2012/07/18/youths-disrupt-coastguard-emergencies
- Tenby 2025: https://rnli.org/news-and-media/2025/june/15/tenby-lifeboat-in-search-for-source-of-open-transmission-on-channel-16 (search summary)
- Great Yarmouth 2004: https://www.yachtingmonthly.com/news/mayday-this-is-john-humphrys-over-26524
- Shetland 2024: https://www.gbnews.com/news/bbc-radio-4-coastguard-forced-to-email-for-help (search summary, single source)

## 6. Working channels

**Who may use what (ITU Appendix 18, as tabled by Traficom and Wikipedia).**
- 6: intership, also ship to aircraft in search and rescue.
- 8, 72, 77: intership only. 72 is the usual leisure ship-to-ship channel. A coast station does
  not normally work on these.
- 9, 12, 13, 14, 71, 74: port operations, VTS, pilots.
- 67, 73: small craft safety, coastguard, SAR in some countries. 10 and 73 are used for
  authority-led SAR and oil response in Finland.
- 62, 63, 64: duplex public correspondence; UK coastguard safety information.
- 70: DSC only, voice forbidden.
- Nordic extras: L1 and L2 for pleasure craft, F1 to F3 for fishing boats (155 MHz).
- Finland: 13 pilotage, 14 rescue authorities, 9, 67 and 71 VTS. Sweden: SAR on 67 or 74.
  UK: private SAR channel 0. US: 22A.
- Klaipėda (2019 guide): VTS on 9, call sign "Radio 5"; border guard "Impuls 3" on 73.

**Who chooses.** Between a coast station and a ship, "the coast station shall finally decide the
frequency or channel to be used." Channels are named "preferably" by their number (M.1171,
sections 22 and 23).

**The words.** SMCP 6.2 and 6.3:
- "Advise (you) change to VHF channel ...", answer "Changing to VHF channel ..."
- "Advise (you) try VHF channel ..."
- "Stand by on VHF channel ...", answer "Standing by on VHF channel ..."
In practice: "Go to channel six seven", "Switch to channel ...". UK guidance has "Please go to
Channel [nominated working channel]". The US Coast Guard says "switch and answer channel two two
alpha". The number is said digit by digit: "channel seven two".

Sources:
- Traficom booklet (channel table and Finnish and Nordic notes): link in section 2
- Wikipedia, Marine VHF radio: https://en.wikipedia.org/wiki/Marine_VHF_radio
- ITU-R M.1171 sections 22 and 23; SMCP 6.2, 6.3: links at the top
- gov.uk DSC procedures for small boat users: https://www.gov.uk/government/publications/gmdss-sea-areas-and-procedures-for-small-boat-users/gmdss-vhf-dsc-procedures-for-small-boat-users
- US 22A: https://wow.uscgaux.info/Uploads_wowII/013-04-03/A_Suffix.pdf (search summary)
- Lithuania 2019: https://www.sailinglatvia.lv/wp-content/uploads/2019/01/Useful-Information-Lithuania-2019.pdf

## 7. Numbers and bearings

SMCP section 10: "Numbers are to be spoken in separate digits: One-five-zero for 150", and
"Two decimal five" for 2.5. The only exception is rudder angles in wheel orders ("Fifteen").

SMCP 2.2 pronunciation: ZEERO, WUN, TOO, TREE, FOWER, FIFE, SIX, SEVEN, AIT, NINER, TOUSAND. So
ships use nearly the same sounds as aviation and the army. (The NADAZERO, UNAONE set is the
International Code of Signals figure code for language problems, not what is spoken on VHF.)

Bearings: 360 degree notation, true north unless stated, three figures. Positions from a mark are
FROM the mark: "Your position bearing 137 degrees from Big Head lighthouse distance 2.4 nautical
miles." Distances in nautical miles or cables, unit always stated. Times in 24 hour UTC. The ITU
DF report uses "three digits", so 43 degrees is "zero four three".

So: "two four three degrees", never "two hundred forty-three".

Sources: SMCP general sections 2.2, 10 to 16 (link at the top); NGA Pub 117 (section 4).

## 8. Night shift life

**Shifts.** HM Coastguard officers work 12 hour shifts; one at Milford Haven does "two days and
two nights in the Ops Room per week". The desk has "multiple screens". A commander: the room
"instantly becomes a professional and serious place the minute the phone rings."

**Routines.** Weather on VHF every three or four hours (Shetland, Milford Haven), NAVTEX
messages, chart corrections, tide and weather questions from the public. Coast radio broadcasts
at fixed minutes in UTC (see section 2). A BBC visit in 2002 showed positions still plotted on
paper charts.

**The log.** Every distress, urgency or safety call sent or received, with time in UTC, the
frequency, the stations, a short summary, the position of any vessel needing help, and the time
and method of cancelling any accidental alert (US rule; a GMDSS training module adds the outcome
and equipment tests). Modern centres also record every channel; Rescue 21 lets watchstanders
"instantaneously replay" calls and clean up the sound.

**A quiet night.** The speaker is silent behind the squelch for long stretches. A carrier opens
it; a short burst of noise when it drops. Most fishing chatter is on other channels the station
does not watch. Then something garbled: in the Freedom II case the coastguard heard "garbled
radio calls" and needed 15 minutes to get the position and the problem.

Sources:
- HM Coastguard, MOO to SMOO: https://hmcoastguard.uk/news/hm-coastguard-ops-room-moo-smoo
- HM Coastguard, international control room week: https://hmcoastguard.uk/news/international-control-room-week-what-does-it-take-work-hm-coastguards-operations-room
- HM Coastguard careers: https://hmcoastguard.uk/careers/maritime-operations
- BBC 2002 Thames Coastguard: link in section 3
- 47 CFR 80.409 (logs): https://www.ecfr.gov/current/title-47/chapter-I/subchapter-D/part-80/subpart-I/section-80.409
- GMDSS course, module 13 (radio log): https://ialacolreg.com/en/gmdss/gmdss-modulo-13-diario-documentacion (search summary)
- MAIB Freedom II: link in section 3

## 9. A child with an old radio

**Radios that can transmit on channel 16.**
- A marine handheld (dad's or grandpa's): 5 or 6 W, a 16 key, no tone button. Some older ones
  had an SOS key that sent Morse SOS on 16 by itself (FCC 2000). Newer DSC handhelds have a red
  DISTRESS key that sends a digital alert on 70, with GPS position.
- A cheap amateur handheld such as the Baofeng UV-5R: transmits 136 to 174 MHz out of the box,
  so 156.800 too. Illegal on marine channels (not type approved), still common.
- An older amateur 2 m handheld: usually limited to 144 to 146 MHz unless modified.
- Toy and PMR446 walkie-talkies cannot reach marine VHF.

**Buttons that make a tone.**
- 1750 Hz tone burst: on UV-5R type radios it is PTT plus a front key, and which key depends on
  model and firmware (sources disagree: A/B, BAND, or CALL). Older European ham handhelds often
  have a separate 1750 or TONE key. The mic can stay live during the burst unless a menu setting
  mutes it.
- The UV-5R CALL side key turns on FM broadcast radio; held down it starts an alarm. Menu 32
  sets the alarm: SITE (speaker only), TONE ("transmits a cycling tone over the air"), CODE
  (sends "119" and the ID).
- A time-out timer (menu 9, 15 to 600 seconds) cuts a held button.
- Holding the button without speaking sends the room: breathing, a clock, a television.

**Range from a house to a mast across a bay.** Radio horizon in km = 4.12 x (√h1 + √h2), heights
in metres; the GMDSS course gives 2.25 x (√h1 + √h2) in nautical miles, and 20 to 30 nm normal
for ships. Worked examples (my arithmetic):
- Handheld at 1.5 m, mast top 60 m above the sea: about 37 km (20 nm).
- Same from a window 10 m up: about 45 km (24 nm).
These are the ceilings. VHF does not pass through hills or large buildings; walls, roofs and the
dune in between cut far more. Indoors on a ground floor, with a broken antenna, expect a few km.
At a high window that looks at the mast across water, 10 to 20 km is realistic. Rescue 21 masts
were built to hear 1 W at 20 nm. A retailer's guide puts handheld to coast station at 15 to 20 nm
along the UK coast. Going higher helps mostly because it clears the things in the way.

Sources:
- FCC 2000 notice: link in section 5
- Baofeng UV-5R, RadioReference wiki (136 to 174 MHz antenna, 1750 Hz burst and the live mic): https://wiki.radioreference.com/index.php/Baofeng_UV-5R
- miklor, UV-5R menus and keys: https://miklor.com/UV5R/UV5R-MenuDef.php and https://www.miklor.com/UV5R/UV5R-Keypad.php
- FCC action on Baofeng importer, ARRL: https://www.arrl.org/news/fcc-cites-baofeng-importer-for-illegally-marketing-unauthorized-rf-devices
- eGMDSS, VHF range: https://www.egmdss.com/gmdss-courses/mod/page/view.php?id=49
- Radio horizon 4.12 formula: https://repeater-builder.com/antenna/radio-horizon.html (search summary)
- Handheld guide: https://www.marinesuperstore.com/handheld-vhf-guide (retailer)

## 10. What operators would find false or cheesy

- "Over and out." Over asks for a reply, out ends it; never both.
- Chatting on 16. Contact on 16, then a working channel at once (M.1171, section 22).
- Radio checks on 16.
- MAYDAY for an engine failure. That is PAN-PAN, unless the boat is drifting onto rocks.
- The radio operator launching the lifeboat himself. The coastguard requests; the rescue station
  decides and pages its crew.
- A lone man under the mast. Today masts are remote and run from one room, often far away.
- DF that gives a dot from one station. One station gives a line; a fix needs two or more, and
  three make a small triangle.
- "Copy that", "10-4", "roger wilco". Maritime and military say "received", "roger", "wilco",
  not both.
- Local time in the log. Logs and broadcasts are in UTC.
- "Seelonce" for anything but distress traffic.
- The coast station ordering boats into harbour. A coast radio station warns and advises; it is
  not a VTS or a harbour master.
- Long sentences. Real calls are short and in a fixed order: who, position, what, help needed.
- Hearing two stations at once on FM. The stronger one takes over; and nobody hears anything
  while they themselves hold the button.

Sources: as above; over and out also in say-again-radio-facts.md (ACP 125) and
https://open-exam-prep.com/study-guides/eu-rya-src-vhf/phonetics-terminology-vocabulary/standard-procedural-words

## What to change in the story

Night one
- Cape's radio check: move it off 16. Either Cape says "Dune, Cape. Radio check on six seven?"
  and both turn the knob, or it is a check after work on Cape's mast. Real neighbouring stations
  would mostly use their phone line.
- Keep "Loud and clear". Keep Cape's joke on "five by five", but the note can add that ships do
  use one number: "I read you five" (SMCP).
- First answer to the clicks: a real operator first assumes someone who cannot speak is in
  trouble. Open the yes/no round with "Are you in danger?" or "Do you need help?".
- Show a DF line on night one already: clicks on 16 give a bearing. It points at the shore and
  the operator puts it down to a reflection. Night four then pays it off.
- "Go to channel seven-two": 72 is a ship-to-ship channel, not a coast station's. A real operator
  would tell an unknown caller to stop and fetch a grown-up. Keep 72, but give the operator one
  line that shows he knows he is bending the rules (for example, it was Grandpa's boat channel
  and nobody uses it at night).
- The Morse note says "a CALL button that beeps". On cheap handhelds CALL turns on FM radio and,
  held, an alarm. Call it "a tone button" (the 1750 key) on Grandpa's old ham radio, opened up to
  reach the marine band. Optional: the mic stays live, so under the beeps the operator hears a
  room, a clock he knows.

Night two
- Fog sécurité: two steps. On 16: "Sécurité, sécurité, sécurité. All stations, all stations, all
  stations. This is Dune Radio, Dune Radio, Dune Radio. Fog warning. Listen on channel six seven.
  Out." Then tune to 67 and read the warning with "issued zero zero one zero UTC". (One short
  line on 16 is allowed too, under one minute.)
- Seagull's PAN-PAN: position first, as a bearing and distance from a mark ("about two miles
  south of Cape light"). Replace "GPS gone" with a true reason: engine dead, batteries going, the
  plotter dark, calling on a handheld (the Wick case). Use "three persons on board" and
  "require tow".
- Dune's answer: "Seagull, this is Dune Radio. Received pan-pan." Then the questions: position,
  anyone hurt, lifejackets on, can you anchor, your boat's colour. Then "Go to channel six seven"
  to keep 16 clear.
- DF request: "Hold your transmit button for ten seconds, then say your name" (the ITU QTG
  request is ten-second dashes or a carrier). Counting to ten is fine. Do not imply DF needs a
  long call; a modern finder needs about a second.
- Cape's bearing: "Seagull bears two four three degrees from Cape, time zero zero four nine UTC.
  Over." (02:49 local is 00:49 UTC in a Baltic winter.) Pass it by phone or on a working channel,
  not on 16.
- Rescue One: alert it by phone or pager ("launch request"), then talk on the radio once it is
  under way, on a SAR working channel. Read the position aloud: "bearing two one zero degrees
  from Dune mast, distance three decimal one nautical miles." Drop "position on your screen".
- In fog the rescue boat finds Seagull by radar and its own DF. Add "sound your horn" next to
  "lights on deck".
- In tow: "Dune Radio, Rescue One. Seagull in tow. Three persons on board, all well. Making for
  the harbour, ETA zero two three zero UTC. Over." Dune: "Received. Report when alongside. Out."
  Then close it: Dune cancels the pan-pan if it broadcast one, and writes the time in the log.

Night three
- Seagull's thank-you on 16 is a social call on the distress channel, from a "set at home" that
  needs a special licence. Make it from the boat in harbour, on 16 then moved to a working channel,
  or by phone.
- The carrier bearing on 72: a station finder is built for 16 and 70. Either have the operator
  switch the finder to 72 (a modern set can watch many channels), or have the kid go to 16 for ten
  seconds and come back.

Night four
- Gale sécurité: two steps like the fog. Drop "Stay in harbour"; a coast station warns, it does
  not order. Use forecast wording: "Gale warning. Westerly gale force eight, increasing severe
  gale nine later. Issued two three zero zero UTC."
- The SOS: a real operator logs the time, takes the bearing and calls the rescue centre or police
  by phone at once. Cape taking over Dune's channels and masts while he leaves is realistic.
  Give Dune one line asking Cape to send the police or an ambulance to the fix.
- Bearings in three figures with "degrees": "zero four three degrees", "one six eight degrees".
- The pilot station with a finder is real: Sweden says all its pilot stations have VHF DF.
- When the three lines cross over town, let the operator say what it means: "That is not at sea.
  That is a house." Coast guards use exactly this to tell a land caller from a boat.
- Going higher and warming the battery are right. Make the range plain: with a taped antenna on
  the ground floor he reaches only Dune; at the top window facing the bay, Cape and the pilots
  hear him too.

Everywhere
- The figures note: ships say WUN, TOO, TREE, FOWER, FIFE, SIX, SEVEN, AIT, NINER, ZEERO too
  (SMCP 2.2), so the note can say "ships, aircraft and the army". Claim 7 in
  say-again-radio-facts.md calls NADAZERO the IMO figure code; that is the signal-book code for
  language problems, not spoken VHF.
- Put two clocks on the wall, local and UTC, and write the log in UTC. Give Dune a scheduled
  broadcast at a fixed minute (Turku Radio uses 33 past).
- Names like "Dune Radio" and "Cape Radio" fit (Turku Radio, Stockholm Radio). A staffed
  station under its own mast is old-fashioned today; either place the story some years back or
  make Dune the last staffed one. Cape taking over Dune's masts fits the modern networked set-up.
- Cape and Dune talk a lot on the radio. Real neighbours use a phone line. If the game needs it on
  the radio, give them a station-to-station channel and keep it off 16.
