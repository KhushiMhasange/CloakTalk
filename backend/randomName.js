const User = require('./Models/user');

const adjectives = [
  "Silent", "Whispering", "Mystic", "Crimson", "Golden", "Emerald", "Blazing", "Frozen", "Dancing", "Jovial",
  "Clever", "Swift", "Happy", "Zesty", "Bouncy", "Witty", "Shiny", "Dreamy", "Lucky", "Sassy", "Fuzzy",
  "Snappy", "Jumpy", "Gleaming", "Glowing", "Loony", "Peppy", "Puffy", "Snug", "Vivid", "Wiggly", "Mellow",
  "Breezy", "Funky", "Giddy", "Zany", "Cheeky", "Dizzy", "Bubbly", "Fizzy", "Chilly", "Thundering", "Bashful",
  "Mighty", "Gloomy", "Sunny", "Rusty", "Foggy", "Cosmic", "Electric", "Velvety", "Icy", "Bright", "Crunchy",
  "Drowsy", "Feisty", "Gleeful", "Sleepy", "Noisy", "Tiny", "Cozy", "Quirky", "Grumpy", "Nimble", "Rosy",
  "Spicy", "Zesty", "Cranky", "Flickering", "Hasty", "Wavy", "Spooky", "Thirsty", "Witty", "Shaggy", "Grubby",
  "Silly", "Dainty", "Perky", "Vibrant", "Gentle", "Majestic", "Chirpy", "Nifty", "Fluffy", "Twinkly",
  "Radiant", "Bold", "Cuddly", "Sprightly", "Snazzy", "Twisty", "Yummy", "Snoozy", "Meek", "Tidy"
];

const nouns = [
  "Badger", "Owl", "Willow", "Phoenix", "Comet", "River", "Stone", "Shadow", "Echo", "Spark", "Voyager", "Pixel",
  "Panda", "Koala", "Sloth", "Tiger", "Lion", "Kitten", "Cub", "Whale", "Otter", "Fawn", "Bunny", "Fox", "Wolf",
  "Dolphin", "Moose", "Hedgehog", "Turtle", "Frog", "Lizard", "Hamster", "Mouse", "Duck", "Chick", "Bear",
  "Pup", "Cub", "Monkey", "Deer", "Eagle", "Finch", "Jay", "Kite", "Lynx", "Peacock", "Quail", "Swan",
  "Vulture", "Yak", "Zebra", "Acorn", "Bubble", "Clover", "Daisy", "Feather", "Gem", "Honey", "Icicle",
  "Jewel", "Kite", "Lantern", "Moss", "Nest", "Ocean", "Pebble", "Quartz", "Raindrop", "Snowflake",
  "Twig", "Umbrella", "Vine", "Whistle", "Yarn", "Zipper", "Berry", "Cloud", "Flame", "Glacier", "Hill",
  "Island", "Jungle", "Leaf", "Meadow", "Nimbus", "Puddle", "Ripple", "Sunbeam", "Tornado", "Valley"
];

const Pfp =[
    'img/pfp/1.svg','img/pfp/2.svg','img/pfp/3.svg','img/pfp/4.svg','img/pfp/5.svg','img/pfp/6.svg','img/pfp/7.svg','img/pfp/8.svg','img/pfp/9.svg','img/pfp/10.svg',
    'img/pfp/11.svg','img/pfp/12.svg','img/pfp/13.svg','img/pfp/14.svg','img/pfp/15.svg','img/pfp/16.svg','img/pfp/17.svg','img/pfp/18.svg','img/pfp/19.svg','img/pfp/20.svg',
    'img/pfp/21.svg','img/pfp/22.svg','img/pfp/23.svg','img/pfp/24.svg','img/pfp/25.svg','img/pfp/26.svg','img/pfp/27.svg','img/pfp/28.svg','img/pfp/29.svg','img/pfp/30.svg',
    'img/pfp/31.svg','img/pfp/32.svg'
]

async function getRandomUsername() {
  let username;
  let isUnique = false;
  while(!isUnique){
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 10000); 
    username = `${adj}${noun}${num}`;

    const usernameExists = await User.findOne({anonymousUsername:username});
    if(!usernameExists) isUnique = true;
  }
  return username; 
}

function getRandomPfp(){
    const pfp = Pfp[Math.floor(Math.random()*Pfp.length)];
    return pfp; 
}

module.exports =  {
  getRandomUsername,
  getRandomPfp
};

