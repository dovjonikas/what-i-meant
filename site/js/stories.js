// stories.js: the list the menu is built from. One entry per story, in release order.
//
// Fields:
//   id      folder name under site/stories/ once the story exists
//   number  label shown on the card
//   status  'soon' shows a locked card; 'out' makes the card a link to stories/<id>/
//   cover   placeholder art drawn in code (see covers.js): 'pixel', 'photo' or 'ink'
//   title   shown on the card when status is 'out'
//   image   optional cover image path; replaces the drawn placeholder
//
// To add a story: add its folder under site/stories/, then set its entry here to 'out'.

export const STORIES = [
  { id: 'story-01', number: '01', status: 'soon', cover: 'pixel' },
  { id: 'story-02', number: '02', status: 'soon', cover: 'photo' },
  { id: 'story-03', number: '03', status: 'soon', cover: 'ink' },
];
