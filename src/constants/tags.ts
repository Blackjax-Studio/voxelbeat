export const TAG_CATEGORIES = {
  "Genre": [
    "RPG", "FPS", "Horror", "Action", "Adventure", "Platformer", "Simulation", "Strategy", "Racing", "Puzzle", "Fighting", "Roguelike", "Metroidvania", "Visual Novel", "Survival", "Bullet Hell", "Tower Defense", "Stealth", "Music/Rhythm", "Party", "Sandbox", "Open World", "Soulslike"
  ],
  "Style": [
    "Retro", "Chiptune", "8-bit", "16-bit", "Orchestral", "Electronic", "Ambient", "Cinematic", "Lo-fi", "Synthwave", "Industrial", "Experimental", "Minimalist", "Jazz", "Heavy Metal", "Gothic", "Folk", "Classical", "Vaporwave", "Phonk", "Glitch", "Acid", "Trance"
  ],
  "Theme": [
    "Cyberpunk", "Fantasy", "Sci-Fi", "Medieval", "Noir", "Space", "Nature", "Urban", "Western", "Steampunk", "Post-Apocalyptic", "High-Fantasy", "Dark-Fantasy", "Lovecraftian", "Oceanic", "Arctic", "Desert", "Oriental", "Greek Mythology", "Egyptian", "Viking", "Dystopian", "Utopian"
  ],
  "Vibe": [
    "Boss Fight", "Dungeon", "Menu", "Combat", "Exploration", "Chill", "Suspense", "Victory", "Defeat", "Title Theme", "Final Boss", "Town", "Overworld", "Credits", "Level Select", "Shop", "Dialogue", "Cutscene", "Puzzle Solved", "Game Over", "Intense", "Eerie", "Heroic", "Melancholy", "Mysterious"
  ]
} as const;

export type TagCategory = keyof typeof TAG_CATEGORIES;
export type Tag = typeof TAG_CATEGORIES[TagCategory][number];
