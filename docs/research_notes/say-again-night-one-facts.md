# Say again: facts behind the rewritten nights

Checked 2026-11-01, for the version where night one opens with a broken mayday and a flare,
night two has a yacht drifting in fog, and the buoyed channel is on the chart. Each item says
what the story does with it.

## Buoys

- **Colours (IALA region A):** port-hand marks red, starboard-hand green, going in from
  seaward; the light on a mark is the colour of the mark. **Numbers:** odd on the starboard
  side, even on the port side, counted along the direction of buoyage, which in an approach
  runs from seaward toward the harbour.
  Sources: South Australia marine safety handbook, chapter 7,
  https://marinesafety.sa.gov.au/__data/assets/pdf_file/0013/1108012/7-Buoys,-marks,-beacons,-signals-and-signs.pdf ;
  Transport WA, the international system of buoys,
  https://www.transport.wa.gov.au/mediaFiles/marine/MAC_P_InternationalSystemBuoys.pdf
- **Light rhythms:** Fl G, Q G, L Fl G, Fl(2) G and the red equivalents; a chart writes
  "Fl G 4s" for one green flash every four seconds. Composite Fl(2+1) is kept for
  preferred-channel marks. Same sources.
- In the story: green 1, 3, 5 on the west side of the channel, red 2, 4, 6 on the east,
  numbered from the north (seaward). At night each blinks its colour, so a child can say
  "green blink". `js/chart/geo.js` BUOYS.

## Flares

- A red parachute rocket burns about 40 seconds at about 300 m and has been seen, in good
  conditions, from tens of miles; a red handheld burns about a minute and carries a few miles.
  Source: RYA, distress flares, https://www.rya.org.uk/water-safety/safety-equipment/distress-flares/
- In the story: Seagull fires one when the radio dies; the RED FLARE note gives the times.

## The mayday and its acknowledgement

- The acknowledgement of a distress call: MAYDAY, the distressed station's name (three
  times), THIS IS, the acknowledging station (three times), RECEIVED MAYDAY. Ships hold back
  a moment so a coast station can answer first.
  Source: 47 CFR 80.1117, https://www.law.cornell.edu/cfr/text/47/80.1117 (the same
  sequence as ITU-R M.1171).
- "Say again" is the SMCP phrase for a repeat; "repeat" is never used on radio.
- In the story: "Seagull, Seagull, Seagull, this is Dune Radio, Dune Radio, Dune Radio.
  Received mayday. Say again your position. Over."

## Pan-pan or mayday for a yacht drifting in fog

- Mayday: grave and imminent danger to a vessel or a person. Pan-pan: concern for the safety
  of a vessel or person without grave and imminent danger; a breakdown is the RYA's own
  example. Neither page rules on a boat drifting toward rocks; it is a judgement.
  Sources: HM Coastguard, https://hmcoastguard.uk/in-an-emergency ; RYA,
  https://www.rya.org.uk/water-safety/communication/mayday-and-pan-pan-calls/
- In the story: Tern calls pan-pan with the stones a mile down wind; the note says the call
  becomes a mayday if she reaches them, and the boat goes at once.

## Fog

- Fog is cloud at the ground with visibility under 1000 m. Shallow fog is under 2 m deep;
  radiation fog can be tens of centimetres on still nights, or a few hundred feet. From
  above it lies like a carpet with the hilltops clear.
  Sources: Met Office, https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/fog ;
  Bureau of Meteorology, https://www.bom.gov.au/aviation/data/education/fog.pdf ;
  SKYbrary, https://skybrary.aero/index.php/Shallow_Fog
- In the story: the lagoon fog is a low radiation fog; from an upstairs window across the
  water the rescue boat's searchlight and the yacht's masthead light stand out of it.

## HI HI, 73, 88

- HI (often HI HI) is laughter in Morse; 73 is best regards, 88 love and kisses.
  Sources: https://www.qsl.net/w3df/cwabbrev.html ; https://www.electronics-notes.com/articles/ham_radio/abbreviations_codes/abbreviations.php

## The red light on the mast

- Under ICAO practice a mast below 45 m carries low-intensity red lights at night; below
  150 m, red at the top and middle. Low-intensity type B is a steady red. Flashing red is
  used on taller structures in some countries. Sources are makers' summaries of ICAO Annex
  14 (https://obsta.com), not the annex itself.
- In the story: "the red light on top" of the station mast. The picture may blink it; a
  steady light would be the stricter reading.
