// Funny name generator: Vehicle + Animal
const vehicles = [
  'Tesla', 'Mustang', 'Corvette', 'Ferrari', 'Lambo', 'Porsche', 'Beetle', 
  'Jeep', 'Harley', 'Vespa', 'Civic', 'Camry', 'Prius', 'Bronco', 'Wrangler',
  'Cybertruck', 'Hummer', 'Mini', 'Fiat', 'Segway', 'Scooter', 'Bicycle',
  'Yacht', 'Kayak', 'Canoe', 'Skateboard', 'Rollerblade', 'Hoverboard'
];

const animals = [
  'Lion', 'Tiger', 'Bear', 'Wolf', 'Eagle', 'Hawk', 'Owl', 'Fox', 'Panda',
  'Koala', 'Sloth', 'Otter', 'Penguin', 'Dolphin', 'Shark', 'Whale', 'Octopus',
  'Butterfly', 'Bee', 'Dragonfly', 'Gecko', 'Chameleon', 'Parrot', 'Flamingo',
  'Unicorn', 'Dragon', 'Phoenix', 'Narwhal', 'Axolotl', 'Quokka', 'Capybara'
];

export function generateFunnyName(): string {
  const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${vehicle} ${animal}`;
}

export function buildCommentTree(comments: any[]): any[] {
  const commentMap = new Map();
  const roots: any[] = [];

  // First pass: create map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build tree structure
  comments.forEach(comment => {
    const node = commentMap.get(comment.id);
    if (comment.parent_comment_id) {
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        parent.replies.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
