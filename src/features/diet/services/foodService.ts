import { supabase } from '../../../lib/supabase';
import { dbRowToFoodItem, foodItemToDbRow } from '../../../lib/mappers';
import { useUserStore } from '../../../store/userStore';
import type { FoodItem } from '../../../types';

// ── Seed data — all values per serving (100 g / 100 ml for weight-based foods,
//   or per piece/slice/unit for count-based foods) ────────────────────────────
// Nutritional data based on USDA FoodData Central averages.

const ts = new Date().toISOString();
const f = (id: string, name: string, category: FoodItem['category'], servingSize: number, servingUnit: string,
  calories: number, protein: number, carbs: number, fat: number,
  fiber?: number, sugar?: number, sodium?: number, notes?: string,
  gramsPerUnit?: number): FoodItem => ({
  id, name, category, servingSize, servingUnit,
  calories, protein, carbs, fat,
  ...(fiber        !== undefined ? { fiber        } : {}),
  ...(sugar        !== undefined ? { sugar        } : {}),
  ...(sodium       !== undefined ? { sodium       } : {}),
  ...(notes        !== undefined ? { notes        } : {}),
  ...(gramsPerUnit !== undefined ? { gramsPerUnit } : {}),
  isCustom: false, createdAt: ts,
});

export const SEED_FOOD_ITEMS: FoodItem[] = [

  // ─────────────────────────────────────────────────────────────────────────────
  // PROTEIN — Poultry
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-pro-001', 'Chicken Breast (cooked)',          'protein', 100,'g', 165, 31,   0,    3.6, 0),
  f('fd-pro-002', 'Chicken Thigh (cooked)',            'protein', 100,'g', 209, 26,   0,   11,   0),
  f('fd-pro-003', 'Chicken Drumstick (cooked)',        'protein', 100,'g', 172, 24,   0,    8,   0),
  f('fd-pro-004', 'Chicken Wings (cooked)',            'protein', 100,'g', 290, 27,   0,   19,   0),
  f('fd-pro-005', 'Turkey Breast (cooked)',            'protein', 100,'g', 135, 30,   0,    1,   0),
  f('fd-pro-006', 'Turkey (ground, cooked)',           'protein', 100,'g', 218, 27,   0,   12,   0),
  f('fd-pro-007', 'Duck Breast (cooked)',              'protein', 100,'g', 201, 28,   0,    9,   0),

  // PROTEIN — Beef & Pork
  f('fd-pro-010', 'Beef Sirloin (cooked)',             'protein', 100,'g', 207, 27,   0,   10,   0),
  f('fd-pro-011', 'Beef Ribeye (cooked)',              'protein', 100,'g', 291, 24,   0,   21,   0),
  f('fd-pro-012', 'Ground Beef 80/20 (cooked)',        'protein', 100,'g', 254, 26,   0,   16,   0),
  f('fd-pro-013', 'Ground Beef Lean (cooked)',         'protein', 100,'g', 215, 26,   0,   12,   0),
  f('fd-pro-014', 'Beef Tenderloin (cooked)',          'protein', 100,'g', 215, 28,   0,   11,   0),
  f('fd-pro-015', 'Beef Brisket (cooked)',             'protein', 100,'g', 254, 26,   0,   16,   0),
  f('fd-pro-016', 'Pork Tenderloin (cooked)',          'protein', 100,'g', 143, 26,   0,    3.5, 0),
  f('fd-pro-017', 'Pork Chop (cooked)',                'protein', 100,'g', 172, 25,   0,    7.5, 0),
  f('fd-pro-018', 'Bacon (cooked)',                    'protein', 100,'g', 541, 37,   1.4, 42,   0,  undefined, 1717),
  f('fd-pro-019', 'Ham (deli-sliced)',                 'protein', 100,'g', 163, 17,   5.5,  7.9, 0,  undefined, 1255),
  f('fd-pro-020', 'Lamb Leg (cooked)',                 'protein', 100,'g', 258, 26,   0,   16,   0),
  f('fd-pro-021', 'Lamb Chops (cooked)',               'protein', 100,'g', 294, 25,   0,   21,   0),
  f('fd-pro-022', 'Venison (cooked)',                  'protein', 100,'g', 158, 30,   0,    3.2, 0),
  f('fd-pro-023', 'Bison (ground, cooked)',            'protein', 100,'g', 185, 27,   0,    8,   0),

  // PROTEIN — Fish & Seafood
  f('fd-pro-030', 'Salmon (cooked)',                   'protein', 100,'g', 208, 20,   0,   13,   0),
  f('fd-pro-031', 'Tuna (canned in water)',            'protein', 100,'g', 116, 26,   0,    1,   0,  undefined, 320),
  f('fd-pro-032', 'Tuna (fresh, cooked)',              'protein', 100,'g', 144, 30,   0,    1.3, 0),
  f('fd-pro-033', 'Cod (cooked)',                      'protein', 100,'g', 105, 23,   0,    0.9, 0),
  f('fd-pro-034', 'Tilapia (cooked)',                  'protein', 100,'g', 128, 26,   0,    2.7, 0),
  f('fd-pro-035', 'Halibut (cooked)',                  'protein', 100,'g', 140, 27,   0,    2.9, 0),
  f('fd-pro-036', 'Sea Bass (cooked)',                 'protein', 100,'g', 124, 24,   0,    2.6, 0),
  f('fd-pro-037', 'Trout (cooked)',                    'protein', 100,'g', 190, 26,   0,    9,   0),
  f('fd-pro-038', 'Sardines (canned in oil)',          'protein', 100,'g', 208, 25,   0,   11,   0,  undefined, 505),
  f('fd-pro-039', 'Mackerel (cooked)',                 'protein', 100,'g', 262, 24,   0,   18,   0),
  f('fd-pro-040', 'Herring (cooked)',                  'protein', 100,'g', 217, 25,   0,   12,   0),
  f('fd-pro-041', 'Shrimp (cooked)',                   'protein', 100,'g',  99, 24,   0.2,  0.3, 0),
  f('fd-pro-042', 'Crab (cooked)',                     'protein', 100,'g',  97, 20,   0,    1.5, 0),
  f('fd-pro-043', 'Lobster (cooked)',                  'protein', 100,'g',  98, 21,   0.5,  0.6, 0),
  f('fd-pro-044', 'Scallops (cooked)',                 'protein', 100,'g', 111, 20,   5.4,  0.8, 0),
  f('fd-pro-045', 'Mussels (cooked)',                  'protein', 100,'g', 172, 24,   7.4,  4.5, 0),
  f('fd-pro-046', 'Squid (cooked)',                    'protein', 100,'g', 175, 18,   7.5,  7.5, 0),
  f('fd-pro-047', 'Canned Salmon',                     'protein', 100,'g', 139, 21,   0,    6,   0,  undefined, 360),

  // PROTEIN — Eggs & Organ  (per piece; gramsPerUnit enables g conversion in picker)
  f('fd-pro-050', 'Whole Eggs',                        'protein',   1,'piece', 78,  6.5,  0.6,  5.5, 0,  0.6, undefined, undefined, 50),
  f('fd-pro-051', 'Egg Whites',                        'protein',   1,'piece', 17,  3.6,  0.2,  0.1, 0, undefined, undefined, undefined, 33),
  f('fd-pro-052', 'Beef Liver (cooked)',               'protein', 100,'g', 175, 27,   4,    5,   0),
  f('fd-pro-053', 'Chicken Liver (cooked)',            'protein', 100,'g', 167, 25,   0.9,  6.5, 0),

  // PROTEIN — Plant-based & Supplements
  f('fd-pro-060', 'Whey Protein Powder',               'protein',  30,'g', 120, 24,   3,    1.5, 0),
  f('fd-pro-061', 'Casein Protein Powder',             'protein',  30,'g', 110, 24,   3,    1,   0),
  f('fd-pro-062', 'Plant Protein Powder',              'protein',  30,'g', 110, 20,   5,    2,   2),
  f('fd-pro-063', 'Seitan',                            'protein', 100,'g', 370, 75,  14,    1.9, 0.6),

  // ─────────────────────────────────────────────────────────────────────────────
  // DAIRY
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-dai-001', 'Greek Yogurt (plain, 0%)',          'dairy',   100,'g',  59, 10,   3.6,  0.4, 0,  3.2),
  f('fd-dai-002', 'Greek Yogurt (full fat)',           'dairy',   100,'g',  97,  9,   3.6,  5,   0,  3.2),
  f('fd-dai-003', 'Regular Yogurt (plain)',            'dairy',   100,'g',  61,  3.5, 4.7,  3.3, 0,  4.7),
  f('fd-dai-004', 'Cottage Cheese (1%)',               'dairy',   100,'g',  72, 12,   2.7,  1,   0),
  f('fd-dai-005', 'Cottage Cheese (4%)',               'dairy',   100,'g', 103, 11,   3.4,  4.5, 0),
  f('fd-dai-010', 'Whole Milk',                        'dairy',   100,'ml', 61,  3.2, 4.8,  3.3, 0,  5.1),
  f('fd-dai-011', 'Skim Milk (0%)',                    'dairy',   100,'ml', 34,  3.4, 5,    0.1, 0,  5),
  f('fd-dai-012', '2% Milk',                           'dairy',   100,'ml', 50,  3.3, 4.8,  2,   0,  4.8),
  f('fd-dai-013', 'Cheddar Cheese',                    'dairy',   100,'g', 402, 25,   1.3, 33,   0),
  f('fd-dai-014', 'Mozzarella',                        'dairy',   100,'g', 280, 28,   2.2, 17,   0),
  f('fd-dai-015', 'Parmesan (grated)',                 'dairy',   100,'g', 431, 38,   4.1, 29,   0,  undefined, 1529),
  f('fd-dai-016', 'Feta Cheese',                       'dairy',   100,'g', 264, 14,   4.1, 21,   0,  undefined, 1116),
  f('fd-dai-017', 'Swiss Cheese',                      'dairy',   100,'g', 380, 27,   5.4, 28,   0,  undefined,  187),
  f('fd-dai-018', 'Gouda',                             'dairy',   100,'g', 356, 25,   2.2, 27,   0),
  f('fd-dai-019', 'Brie',                              'dairy',   100,'g', 334, 21,   0.5, 28,   0,  undefined,  629),
  f('fd-dai-020', 'Cream Cheese',                      'dairy',   100,'g', 342,  6,   4.1, 34,   0,  undefined,  321),
  f('fd-dai-021', 'Ricotta',                           'dairy',   100,'g', 174, 11,   3,   13,   0),
  f('fd-dai-022', 'Sour Cream',                        'dairy',   100,'g', 193,  2.4, 4.6, 19,   0),
  f('fd-dai-023', 'Heavy Cream',                       'dairy',   100,'ml',345,  2.8, 2.8, 36,   0),
  f('fd-dai-024', 'Kefir',                             'dairy',   100,'ml', 52,  3.6, 4.8,  1.5, 0,  4.8),
  f('fd-dai-025', 'Goat Milk',                         'dairy',   100,'ml', 69,  3.6, 4.5,  4.1, 0,  4.5),
  f('fd-dai-026', 'Goat Cheese',                       'dairy',   100,'g', 364, 22,   2.5, 30,   0,  undefined,  368),
  f('fd-dai-027', 'Blue Cheese',                       'dairy',   100,'g', 353, 21,   2.3, 29,   0,  undefined, 1395),
  f('fd-dai-028', 'Butter',                            'dairy',   100,'g', 717,  0.9, 0.1, 81,   0,  undefined,  714),
  f('fd-dai-029', 'Ghee',                              'dairy',   100,'g', 900,  0,   0,  100,   0,  undefined,    2),

  // ─────────────────────────────────────────────────────────────────────────────
  // GRAINS & STARCHES
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-gra-001', 'White Rice (cooked)',               'grains',  100,'g', 130,  2.7, 28,   0.3, 0.4),
  f('fd-gra-002', 'Brown Rice (cooked)',               'grains',  100,'g', 112,  2.6, 24,   0.9, 1.8),
  f('fd-gra-003', 'Jasmine Rice (cooked)',             'grains',  100,'g', 129,  2.7, 28,   0.2, 0.4),
  f('fd-gra-004', 'Basmati Rice (cooked)',             'grains',  100,'g', 130,  2.7, 28,   0.3, 0.5),
  f('fd-gra-005', 'Wild Rice (cooked)',                'grains',  100,'g', 101,  4,   21,   0.3, 1.8),
  f('fd-gra-006', 'Oats (dry rolled)',                 'grains',  100,'g', 389, 17,   66,   7,  10.6),
  f('fd-gra-007', 'Quinoa (cooked)',                   'grains',  100,'g', 120,  4.4, 21.3, 1.9, 2.8),
  f('fd-gra-008', 'Pasta (white, cooked)',             'grains',  100,'g', 158,  5.8, 31,   0.9, 1.8),
  f('fd-gra-009', 'Whole Wheat Pasta (cooked)',        'grains',  100,'g', 124,  5.3, 24,   0.5, 4.5),
  f('fd-gra-010', 'Couscous (cooked)',                 'grains',  100,'g', 112,  3.8, 23,   0.2, 1.4),
  f('fd-gra-011', 'Barley (cooked)',                   'grains',  100,'g', 123,  2.3, 28,   0.4, 3.8),
  f('fd-gra-012', 'Bulgur (cooked)',                   'grains',  100,'g',  83,  3.1, 18,   0.2, 4.5),
  f('fd-gra-013', 'Buckwheat (cooked)',                'grains',  100,'g',  92,  3.4, 20,   0.6, 2.7),
  f('fd-gra-014', 'Millet (cooked)',                   'grains',  100,'g', 119,  3.5, 23,   1,   1.3),
  f('fd-gra-015', 'Farro (cooked)',                    'grains',  100,'g', 170,  7,   33,   1.5, 3.5),
  f('fd-gra-016', 'White Bread',                       'grains',    1,'slice',  80,  2.7, 14.7, 1.0, 0.8, undefined, 147, undefined, 30),
  f('fd-gra-017', 'Whole Wheat Bread',                 'grains',    1,'slice',  79,  4.2, 13.1, 1.1, 2.2, undefined, 128, undefined, 32),
  f('fd-gra-018', 'Sourdough Bread',                   'grains',    1,'slice',  94,  3.5, 17.9, 0.6, 0.8, undefined, 182, undefined, 35),
  f('fd-gra-019', 'Rye Bread',                         'grains',    1,'slice',  83,  2.7, 15.4, 1.1, 1.9, undefined, 193, undefined, 32),
  f('fd-gra-020', 'Pita Bread',                        'grains',    1,'piece', 165,  5.5, 33.0, 0.7, 1.3, undefined, 322, undefined, 60),
  f('fd-gra-021', 'Naan',                              'grains',    1,'piece', 285,  8.1, 47.7, 6.3, 1.7, undefined, 457, undefined, 90),
  f('fd-gra-022', 'Bagel',                             'grains',    1,'piece', 240,  9.3, 47.0, 1.5, 1.7, undefined, 434, undefined, 98),
  f('fd-gra-023', 'English Muffin',                    'grains',    1,'piece', 129,  4.6, 25.1, 1.0, 1.5, undefined, 223, undefined, 57),
  f('fd-gra-024', 'Flour Tortilla',                    'grains',    1,'piece', 135,  3.6, 22.9, 3.2, 1.1, undefined, 254, undefined, 45),
  f('fd-gra-025', 'Corn Tortilla',                     'grains',    1,'piece',  57,  1.4, 12.0, 0.7, 1.2, undefined,  76, undefined, 26),
  f('fd-gra-026', 'White Potato (boiled)',             'grains',  100,'g',  77,  2,   17,   0.1, 2.2),
  f('fd-gra-027', 'Sweet Potato (baked)',              'grains',  100,'g',  90,  2,   21,   0.1, 3.3, 4.2),
  f('fd-gra-028', 'Corn (cooked)',                     'grains',  100,'g',  96,  3.4, 21,   1.5, 2.4, 3.2),
  f('fd-gra-029', 'Rice Cakes (plain)',                'grains',  100,'g', 387,  7.4, 82,   2.8, 0.4, undefined, 115),
  f('fd-gra-030', 'Granola (oat-based)',               'grains',  100,'g', 471, 10,   64,  20,   5.6, 22),
  f('fd-gra-031', 'Cornflakes',                        'grains',  100,'g', 357,  7.5, 84,   0.4, 1.2,  7.4, 660),
  f('fd-gra-032', 'Rolled Oat Porridge (cooked)',      'grains',  100,'g',  71,  2.5, 12,   1.4, 1.7),
  f('fd-gra-033', 'Popcorn (air-popped)',              'grains',  100,'g', 387, 13,   78,   4.5,15,   0.9),
  f('fd-gra-034', 'Gnocchi (cooked)',                  'grains',  100,'g', 131,  2.8, 29,   0.2, 1.1),
  f('fd-gra-035', 'Polenta (cooked)',                  'grains',  100,'g',  70,  1.7, 14,   0.4, 1),
  f('fd-gra-036', 'Taro (cooked)',                     'grains',  100,'g', 142,  0.5, 34,   0.1, 4.3),
  f('fd-gra-037', 'Cassava / Yuca (cooked)',           'grains',  100,'g', 155,  0.7, 38,   0.1, 1.8),
  f('fd-gra-038', 'Plantain (cooked)',                 'grains',  100,'g', 122,  0.8, 32,   0.2, 2.3, 14),

  // ─────────────────────────────────────────────────────────────────────────────
  // VEGETABLES
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-veg-001', 'Broccoli',                          'vegetables',100,'g',  34,  2.8,  7,   0.4, 2.6),
  f('fd-veg-002', 'Spinach',                           'vegetables',100,'g',  23,  2.9,  3.6, 0.4, 2.2),
  f('fd-veg-003', 'Carrot',                            'vegetables',100,'g',  41,  0.9, 10,   0.2, 2.8, 4.7),
  f('fd-veg-004', 'Cucumber',                          'vegetables',100,'g',  15,  0.7,  3.6, 0.1, 0.5),
  f('fd-veg-005', 'Tomato',                            'vegetables',100,'g',  18,  0.9,  3.9, 0.2, 1.2, 2.6),
  f('fd-veg-006', 'Bell Pepper (red)',                 'vegetables',100,'g',  31,  1,    6,   0.3, 2.1, 4.2),
  f('fd-veg-007', 'Bell Pepper (green)',               'vegetables',100,'g',  20,  0.9,  4.6, 0.2, 1.7, 2.4),
  f('fd-veg-008', 'Bell Pepper (yellow)',              'vegetables',100,'g',  27,  1,    6.3, 0.2, 0.9, 5.3),
  f('fd-veg-009', 'Zucchini',                          'vegetables',100,'g',  17,  1.2,  3.1, 0.3, 1),
  f('fd-veg-010', 'Mushrooms (button)',                'vegetables',100,'g',  22,  3.1,  3.3, 0.3, 1),
  f('fd-veg-011', 'Shiitake Mushrooms',                'vegetables',100,'g',  39,  2.2,  6.8, 0.5, 2.5),
  f('fd-veg-012', 'Portobello Mushroom',               'vegetables',100,'g',  22,  2.1,  3.9, 0.4, 1.3),
  f('fd-veg-013', 'Cauliflower',                       'vegetables',100,'g',  25,  1.9,  5,   0.3, 2),
  f('fd-veg-014', 'Green Cabbage',                     'vegetables',100,'g',  25,  1.3,  5.8, 0.1, 2.5),
  f('fd-veg-015', 'Red Cabbage',                       'vegetables',100,'g',  31,  1.4,  7.4, 0.2, 2.1),
  f('fd-veg-016', 'Yellow Onion',                      'vegetables',100,'g',  40,  1.1,  9.3, 0.1, 1.7, 4.2),
  f('fd-veg-017', 'Red Onion',                         'vegetables',100,'g',  40,  1.1,  9.3, 0.1, 1.7, 4.2),
  f('fd-veg-018', 'Green Onion / Scallion',            'vegetables',100,'g',  32,  1.8,  7.3, 0.2, 2.6),
  f('fd-veg-019', 'Garlic',                            'vegetables',100,'g', 149,  6.4, 33,   0.5, 2.1),
  f('fd-veg-020', 'Ginger (fresh)',                    'vegetables',100,'g',  80,  1.8, 18,   0.8, 2),
  f('fd-veg-021', 'Asparagus',                         'vegetables',100,'g',  20,  2.2,  3.9, 0.1, 2.1),
  f('fd-veg-022', 'Eggplant / Aubergine',              'vegetables',100,'g',  25,  1,    6,   0.2, 3),
  f('fd-veg-023', 'Green Beans',                       'vegetables',100,'g',  31,  1.8,  7,   0.2, 2.7),
  f('fd-veg-024', 'Kale',                              'vegetables',100,'g',  49,  4.3,  9,   0.9, 3.6),
  f('fd-veg-025', 'Brussels Sprouts',                  'vegetables',100,'g',  43,  3.4,  9,   0.3, 3.8),
  f('fd-veg-026', 'Celery',                            'vegetables',100,'g',  16,  0.7,  3,   0.2, 1.6),
  f('fd-veg-027', 'Fresh Peas',                        'vegetables',100,'g',  81,  5.4, 14,   0.4, 5.1, 5.7),
  f('fd-veg-028', 'Beets',                             'vegetables',100,'g',  43,  1.6, 10,   0.2, 2.8, 6.8),
  f('fd-veg-029', 'Pumpkin',                           'vegetables',100,'g',  26,  1,    6.5, 0.1, 0.5),
  f('fd-veg-030', 'Butternut Squash',                  'vegetables',100,'g',  45,  1,   12,   0.1, 2,   2.2),
  f('fd-veg-031', 'Acorn Squash',                      'vegetables',100,'g',  40,  0.9, 10,   0.1, 1.5),
  f('fd-veg-032', 'Leek',                              'vegetables',100,'g',  61,  1.5, 14,   0.3, 1.8),
  f('fd-veg-033', 'Artichoke',                         'vegetables',100,'g',  47,  3.3, 11,   0.2, 5.4),
  f('fd-veg-034', 'Bok Choy',                          'vegetables',100,'g',  13,  1.5,  2.2, 0.2, 1),
  f('fd-veg-035', 'Swiss Chard',                       'vegetables',100,'g',  19,  1.8,  3.7, 0.2, 1.6),
  f('fd-veg-036', 'Romaine Lettuce',                   'vegetables',100,'g',  17,  1.2,  3.3, 0.3, 2.1),
  f('fd-veg-037', 'Arugula',                           'vegetables',100,'g',  25,  2.6,  3.7, 0.7, 1.6),
  f('fd-veg-038', 'Radish',                            'vegetables',100,'g',  16,  0.7,  3.4, 0.1, 1.6),
  f('fd-veg-039', 'Fennel',                            'vegetables',100,'g',  31,  1.2,  7.3, 0.2, 3.1),
  f('fd-veg-040', 'Corn on the Cob',                   'vegetables',100,'g',  86,  3.3, 19,   1.4, 2,   3.2),
  f('fd-veg-041', 'Okra',                              'vegetables',100,'g',  33,  1.9,  7.5, 0.2, 3.2),
  f('fd-veg-042', 'Jalapeño',                          'vegetables',100,'g',  29,  0.9,  6.5, 0.4, 2.8, 4.1),
  f('fd-veg-043', 'Snap Peas',                         'vegetables',100,'g',  42,  2.8,  7.6, 0.2, 2.6),
  f('fd-veg-044', 'Watercress',                        'vegetables',100,'g',  11,  2.3,  1.3, 0.1, 0.5),
  f('fd-veg-045', 'Endive',                            'vegetables',100,'g',  17,  1.3,  3.4, 0.2, 3.1),
  f('fd-veg-046', 'Turnip',                            'vegetables',100,'g',  28,  0.9,  6.4, 0.1, 1.8),
  f('fd-veg-047', 'Parsnip',                           'vegetables',100,'g',  75,  1.2, 18,   0.3, 4.4),
  f('fd-veg-048', 'Spaghetti Squash (cooked)',         'vegetables',100,'g',  31,  0.6,  7,   0.6, 1.5),
  f('fd-veg-049', 'Cherry Tomatoes',                   'vegetables',100,'g',  18,  0.9,  3.9, 0.2, 1.2, 2.6),
  f('fd-veg-050', 'Sun-Dried Tomatoes',                'vegetables',100,'g', 258,  14,  56,   3,  12,   37,  2095),

  // ─────────────────────────────────────────────────────────────────────────────
  // FRUITS
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-fru-001', 'Banana',                            'fruits',    1,'piece',105,  1.3, 27.1, 0.4, 3.1, 14.2, undefined, undefined, 118),
  f('fd-fru-002', 'Apple',                             'fruits',    1,'piece', 95,  0.5, 25.5, 0.4, 4.4, 18.2, undefined, undefined, 182),
  f('fd-fru-003', 'Orange',                            'fruits',    1,'piece', 62,  1.2, 15.7, 0.1, 3.1, 12.3, undefined, undefined, 131),
  f('fd-fru-004', 'Strawberry',                        'fruits',  100,'g',  32,  0.7,  7.7, 0.3, 2,   4.9),
  f('fd-fru-005', 'Blueberry',                         'fruits',  100,'g',  57,  0.7, 14,   0.3, 2.4, 10),
  f('fd-fru-006', 'Mango',                             'fruits',  100,'g',  60,  0.8, 15,   0.4, 1.6, 13.7),
  f('fd-fru-007', 'Watermelon',                        'fruits',  100,'g',  30,  0.6,  7.6, 0.2, 0.4, 6.2),
  f('fd-fru-008', 'Grapes (red/green)',                'fruits',  100,'g',  69,  0.7, 18,   0.2, 0.9, 15.5),
  f('fd-fru-009', 'Pineapple',                         'fruits',  100,'g',  50,  0.5, 13,   0.1, 1.4, 9.9),
  f('fd-fru-010', 'Peach',                             'fruits',  100,'g',  39,  0.9, 10,   0.3, 1.5, 8.4),
  f('fd-fru-011', 'Pear',                              'fruits',  100,'g',  57,  0.4, 15,   0.1, 3.1, 9.8),
  f('fd-fru-012', 'Cherry',                            'fruits',  100,'g',  63,  1.1, 16,   0.2, 2.1, 12.8),
  f('fd-fru-013', 'Raspberry',                         'fruits',  100,'g',  52,  1.2, 12,   0.7, 6.5, 4.4),
  f('fd-fru-014', 'Blackberry',                        'fruits',  100,'g',  43,  1.4, 10,   0.5, 5.3, 4.9),
  f('fd-fru-015', 'Kiwi',                              'fruits',  100,'g',  61,  1.1, 15,   0.5, 3,   9),
  f('fd-fru-016', 'Pomegranate',                       'fruits',  100,'g',  83,  1.7, 19,   1.2, 4,   13.7),
  f('fd-fru-017', 'Papaya',                            'fruits',  100,'g',  43,  0.5, 11,   0.3, 1.7, 7.8),
  f('fd-fru-018', 'Cantaloupe',                        'fruits',  100,'g',  34,  0.8,  8.2, 0.2, 0.9, 7.9),
  f('fd-fru-019', 'Honeydew Melon',                    'fruits',  100,'g',  36,  0.5,  9.1, 0.1, 0.8, 8.1),
  f('fd-fru-020', 'Plum',                              'fruits',  100,'g',  46,  0.7, 11.4, 0.3, 1.4, 9.9),
  f('fd-fru-021', 'Apricot',                           'fruits',  100,'g',  48,  1.4, 11,   0.4, 2,   9.2),
  f('fd-fru-022', 'Grapefruit',                        'fruits',  100,'g',  42,  0.8, 11,   0.1, 1.6, 6.9),
  f('fd-fru-023', 'Lemon',                             'fruits',  100,'g',  29,  1.1,  9.3, 0.3, 2.8, 2.5),
  f('fd-fru-024', 'Lime',                              'fruits',  100,'g',  30,  0.7, 11,   0.2, 2.8, 1.7),
  f('fd-fru-025', 'Dates (Medjool)',                   'fruits',    1,'piece', 66,  0.4, 18.0, 0.1, 1.6, 15.8, undefined, undefined, 24),
  f('fd-fru-026', 'Raisins',                           'fruits',  100,'g', 299,  3.1, 79,   0.5, 3.7, 59),
  f('fd-fru-027', 'Dried Cranberries',                 'fruits',  100,'g', 308,  0.1, 83,   1.4, 5,   72),
  f('fd-fru-028', 'Fig (fresh)',                       'fruits',  100,'g',  74,  0.8, 19,   0.3, 2.9, 16.3),
  f('fd-fru-029', 'Coconut Flesh (fresh)',             'fruits',  100,'g', 354,  3.3, 15,  33,   9),
  f('fd-fru-030', 'Avocado',                           'fruits',  100,'g', 160,  2,    9,  15,   7),
  f('fd-fru-031', 'Cranberry (fresh)',                 'fruits',  100,'g',  46,  0.4, 12,   0.1, 4.6, 4),
  f('fd-fru-032', 'Guava',                             'fruits',  100,'g',  68,  2.6, 14,   1,   5.4, 9),
  f('fd-fru-033', 'Lychee',                            'fruits',  100,'g',  66,  0.8, 17,   0.4, 1.3, 15),
  f('fd-fru-034', 'Passion Fruit',                     'fruits',  100,'g',  97,  2.2, 23,   0.7,10.4, 11.2),
  f('fd-fru-035', 'Persimmon',                         'fruits',  100,'g', 127,  0.8, 34,   0.4, 3.6, 0),
  f('fd-fru-036', 'Tangerine',                         'fruits',  100,'g',  53,  0.8, 13,   0.3, 1.8, 10.6),
  f('fd-fru-037', 'Nectarine',                         'fruits',  100,'g',  44,  1.1, 11,   0.3, 1.7, 7.9),
  f('fd-fru-038', 'Pomelo',                            'fruits',  100,'g',  38,  0.8,  9.6, 0.1, 1,   0),
  f('fd-fru-039', 'Jackfruit (raw)',                   'fruits',  100,'g',  95,  1.7, 23,   0.6, 1.5, 19.1),
  f('fd-fru-040', 'Dragon Fruit',                      'fruits',  100,'g',  60,  1.2, 13,   0,   3,   8),

  // ─────────────────────────────────────────────────────────────────────────────
  // NUTS & SEEDS
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-nut-001', 'Almonds',                           'nuts_seeds',100,'g', 579, 21,  22,  50,  12.5),
  f('fd-nut-002', 'Walnuts',                           'nuts_seeds',100,'g', 654, 15,  14,  65,   6.7),
  f('fd-nut-003', 'Peanuts',                           'nuts_seeds',100,'g', 567, 26,  16,  49,   8.5),
  f('fd-nut-004', 'Cashews',                           'nuts_seeds',100,'g', 553, 18,  30,  44,   3.3),
  f('fd-nut-005', 'Pistachios',                        'nuts_seeds',100,'g', 562, 20,  28,  45,  10.3),
  f('fd-nut-006', 'Pecans',                            'nuts_seeds',100,'g', 691,  9.2,14,  72,   9.6),
  f('fd-nut-007', 'Hazelnuts',                         'nuts_seeds',100,'g', 628, 15,  17,  61,   9.7),
  f('fd-nut-008', 'Brazil Nuts',                       'nuts_seeds',100,'g', 659, 14,  12,  67,   7.5),
  f('fd-nut-009', 'Macadamia Nuts',                    'nuts_seeds',100,'g', 718,  7.9,14,  76,   8.6),
  f('fd-nut-010', 'Pine Nuts',                         'nuts_seeds',100,'g', 673, 14,  13,  68,   3.7),
  f('fd-nut-011', 'Chia Seeds',                        'nuts_seeds',100,'g', 486, 17,  42,  31,  34),
  f('fd-nut-012', 'Flaxseeds',                         'nuts_seeds',100,'g', 534, 18,  29,  42,  27),
  f('fd-nut-013', 'Pumpkin Seeds',                     'nuts_seeds',100,'g', 559, 30,  11,  49,   6),
  f('fd-nut-014', 'Sunflower Seeds',                   'nuts_seeds',100,'g', 584, 21,  20,  51,   8.6),
  f('fd-nut-015', 'Sesame Seeds',                      'nuts_seeds',100,'g', 573, 17,  23,  50,  11.8),
  f('fd-nut-016', 'Hemp Seeds',                        'nuts_seeds',100,'g', 553, 32,   9,  49,   4),
  f('fd-nut-017', 'Peanut Butter',                     'nuts_seeds',100,'g', 588, 25,  20,  50,   6,   9),
  f('fd-nut-018', 'Almond Butter',                     'nuts_seeds',100,'g', 614, 21,  19,  56,  10.5),
  f('fd-nut-019', 'Tahini',                            'nuts_seeds',100,'g', 595, 17,  21,  54,   9.3),
  f('fd-nut-020', 'Coconut (shredded, unsweetened)',   'nuts_seeds',100,'g', 466,  4.2,44,  33,  16),
  f('fd-nut-021', 'Mixed Nuts (roasted)',              'nuts_seeds',100,'g', 607, 15,  21,  54,   6.2),

  // ─────────────────────────────────────────────────────────────────────────────
  // LEGUMES
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-leg-001', 'Lentils (cooked)',                  'legumes',  100,'g', 116,  9,  20,   0.4, 7.9),
  f('fd-leg-002', 'Chickpeas (cooked)',                'legumes',  100,'g', 164,  8.9,27,   2.6, 7.6),
  f('fd-leg-003', 'Black Beans (cooked)',              'legumes',  100,'g', 132,  8.9,24,   0.5, 8.7),
  f('fd-leg-004', 'Edamame',                           'legumes',  100,'g', 122, 11,   9.9, 5.2, 5.2),
  f('fd-leg-005', 'Kidney Beans (cooked)',             'legumes',  100,'g', 127,  8.7,23,   0.5, 6.4),
  f('fd-leg-006', 'Pinto Beans (cooked)',              'legumes',  100,'g', 143,  9,  27,   0.7, 9),
  f('fd-leg-007', 'Navy Beans (cooked)',               'legumes',  100,'g', 140,  8.2,26,   0.6,10.5),
  f('fd-leg-008', 'Black-Eyed Peas (cooked)',          'legumes',  100,'g', 116,  7.7,21,   0.5, 6.5),
  f('fd-leg-009', 'Split Peas (cooked)',               'legumes',  100,'g', 118,  8.3,21,   0.4, 8.1),
  f('fd-leg-010', 'Soybeans (cooked)',                 'legumes',  100,'g', 173, 17,  10,   9,   6),
  f('fd-leg-011', 'Tofu (firm)',                       'legumes',  100,'g',  76,  8.1, 1.9, 4.8, 0.3),
  f('fd-leg-012', 'Tofu (silken)',                     'legumes',  100,'g',  55,  5.3, 2.4, 2.7, 0.1),
  f('fd-leg-013', 'Tempeh',                            'legumes',  100,'g', 193, 19,   9.4,11,   0),
  f('fd-leg-014', 'Hummus',                            'legumes',  100,'g', 177,  4.9,20,   9.6, 6),
  f('fd-leg-015', 'Mung Beans (cooked)',               'legumes',  100,'g', 105,  7,  19,   0.4, 7.6),
  f('fd-leg-016', 'Adzuki Beans (cooked)',             'legumes',  100,'g', 128,  7.5,25,   0.1, 7.3),
  f('fd-leg-017', 'Cannellini Beans (cooked)',         'legumes',  100,'g', 142,  9.7,25,   0.5, 6.3),
  f('fd-leg-018', 'Fava Beans (cooked)',               'legumes',  100,'g',  88,  7.9,15,   0.5, 5.4),
  f('fd-leg-019', 'Green Lentils (cooked)',            'legumes',  100,'g', 116,  9,  20,   0.4, 7.9),

  // ─────────────────────────────────────────────────────────────────────────────
  // FATS & OILS
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-fat-001', 'Olive Oil (extra virgin)',          'fats_oils',100,'ml',884,  0,   0,  100,  0),
  f('fd-fat-002', 'Avocado Oil',                       'fats_oils',100,'ml',884,  0,   0,  100,  0),
  f('fd-fat-003', 'Coconut Oil',                       'fats_oils',100,'ml',892,  0,   0,   99,  0),
  f('fd-fat-004', 'Canola Oil',                        'fats_oils',100,'ml',884,  0,   0,  100,  0),
  f('fd-fat-005', 'Sunflower Oil',                     'fats_oils',100,'ml',884,  0,   0,  100,  0),
  f('fd-fat-006', 'Sesame Oil',                        'fats_oils',100,'ml',884,  0,   0,  100,  0),
  f('fd-fat-007', 'Lard',                              'fats_oils',100,'g', 902,  0,   0,  100,  0),
  f('fd-fat-008', 'Mayonnaise',                        'fats_oils',100,'g', 680,  1,   0.6, 75,  0,  0.6, 635),
  f('fd-fat-009', 'MCT Oil',                           'fats_oils',100,'ml',870,  0,   0,  100,  0),
  f('fd-fat-010', 'Flaxseed Oil',                      'fats_oils',100,'ml',884,  0,   0,  100,  0),
  f('fd-fat-011', 'Walnut Oil',                        'fats_oils',100,'ml',884,  0,   0,  100,  0),

  // ─────────────────────────────────────────────────────────────────────────────
  // BEVERAGES
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-bev-001', 'Orange Juice (fresh)',              'beverages',100,'ml', 45,  0.7, 10,  0.2, 0.2, 9),
  f('fd-bev-002', 'Coffee (black)',                    'beverages',100,'ml',  1,  0.3,  0,  0,   0),
  f('fd-bev-003', 'Almond Milk (unsweetened)',         'beverages',100,'ml', 17,  0.6,  0.6, 1.4, 0.4),
  f('fd-bev-004', 'Oat Milk',                         'beverages',100,'ml', 47,  1,    7.5, 1.5, 0.8, 3),
  f('fd-bev-005', 'Soy Milk (unsweetened)',            'beverages',100,'ml', 33,  3.3,  1.9, 1.8, 0.4),
  f('fd-bev-006', 'Coconut Milk (canned, full fat)',  'beverages',100,'ml',197,  2,    2.8,21,   0),
  f('fd-bev-007', 'Coconut Milk (light)',             'beverages',100,'ml', 50,  0.5,  2.5, 4.3, 0),
  f('fd-bev-008', 'Apple Juice',                      'beverages',100,'ml', 46,  0.1, 11.4, 0.1, 0.1, 10.9),
  f('fd-bev-009', 'Green Tea',                        'beverages',100,'ml',  1,  0.2,  0.2, 0,   0),
  f('fd-bev-010', 'Black Tea',                        'beverages',100,'ml',  1,  0.1,  0.3, 0,   0),
  f('fd-bev-011', 'Coconut Water',                    'beverages',100,'ml', 19,  0.7,  4.5, 0.2, 0,   4.5),
  f('fd-bev-012', 'Whole Milk',                       'beverages',100,'ml', 61,  3.2,  4.8, 3.3, 0,   5.1),
  f('fd-bev-013', 'Sports Drink (electrolyte)',       'beverages',100,'ml', 25,  0,    6,   0,   0,   6,   53),
  f('fd-bev-014', 'Vegetable Juice (V8-style)',       'beverages',100,'ml', 17,  0.7,  3.8, 0,   0.5, 2.6, 243),
  f('fd-bev-015', 'Tomato Juice',                     'beverages',100,'ml', 17,  0.9,  3.9, 0.1, 0.4, 3.2, 238),
  f('fd-bev-016', 'Protein Shake (avg mixed)',        'beverages',300,'ml',200, 25,   10,   5,   1),
  f('fd-bev-017', 'Pineapple Juice',                  'beverages',100,'ml', 50,  0.4, 12.4, 0.1, 0.2, 9.9),
  f('fd-bev-018', 'Grape Juice',                      'beverages',100,'ml', 60,  0.4, 14.8, 0.1, 0.1, 13.7),
  f('fd-bev-019', 'Rice Milk',                        'beverages',100,'ml', 47,  0.3, 10,   1,   0,   5),

  // ─────────────────────────────────────────────────────────────────────────────
  // CONDIMENTS & SAUCES
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-con-001', 'Ketchup',                          'condiments',100,'g', 101,  1.2, 26,  0.1, 0.3, 22,  907),
  f('fd-con-002', 'Yellow Mustard',                   'condiments',100,'g',  66,  4.4,  5.8, 3.3, 3,   0,  1135),
  f('fd-con-003', 'Dijon Mustard',                    'condiments',100,'g',  66,  4.1,  8.2, 3,   2.4, 3.1, 1252),
  f('fd-con-004', 'Soy Sauce',                        'condiments',100,'ml', 53,  8.1,  4.9, 0.1, 0.3, 0,  5493),
  f('fd-con-005', 'Hot Sauce',                        'condiments',100,'ml', 11,  0.5,  2.2, 0.2, 0,   0,  2090),
  f('fd-con-006', 'BBQ Sauce',                        'condiments',100,'g', 172,  1.3, 41,   0.7, 0.5, 32,  850),
  f('fd-con-007', 'Tomato Sauce (marinara)',          'condiments',100,'g',  29,  1.5,  6.4, 0.2, 1.5, 3.4, 400),
  f('fd-con-008', 'Salsa',                            'condiments',100,'g',  36,  1.6,  7.4, 0.2, 1.8, 4.6, 420),
  f('fd-con-009', 'Pesto',                            'condiments',100,'g', 245,  4.5,  4.4,24,   1.5, 1.5, 580),
  f('fd-con-010', 'Ranch Dressing',                   'condiments',100,'ml',474,  1.7,  4.6,50,   0,   3.4, 720),
  f('fd-con-011', 'Caesar Dressing',                  'condiments',100,'ml',450,  2.5,  3.5,47,   0,   1.6, 780),
  f('fd-con-012', 'Balsamic Vinegar',                 'condiments',100,'ml', 88,  0.5, 17,   0,   0,  14.5,  23),
  f('fd-con-013', 'Apple Cider Vinegar',              'condiments',100,'ml', 22,  0,    0.9, 0,   0,   0.4,   5),
  f('fd-con-014', 'Honey',                            'condiments',100,'g', 304,  0.3, 82,   0,   0.2, 82,    4),
  f('fd-con-015', 'Maple Syrup',                      'condiments',100,'ml',260,  0,   67,   0.1, 0,  60,    12),
  f('fd-con-016', 'White Sugar',                      'condiments',100,'g', 387,  0,  100,   0,   0, 100,     1),
  f('fd-con-017', 'Brown Sugar',                      'condiments',100,'g', 380,  0,   98,   0,   0,  97,    28),
  f('fd-con-018', 'Coconut Sugar',                    'condiments',100,'g', 375,  0,   97,   0,   0,  75,     5),
  f('fd-con-019', 'Agave Nectar',                     'condiments',100,'ml',310,  0,   76,   0.1, 0,  68,     7),
  f('fd-con-020', 'Oyster Sauce',                     'condiments',100,'ml', 51,  0.9, 11,   0.3, 0.2, 5.8, 2733),
  f('fd-con-021', 'Fish Sauce',                       'condiments',100,'ml', 35,  5,    3.6, 0.1, 0,   0,   5990),
  f('fd-con-022', 'Worcestershire Sauce',             'condiments',100,'ml', 78,  0.9, 19,   0,   0,  11,   980),
  f('fd-con-023', 'Tahini',                           'condiments',100,'g', 595, 17,   21,  54,   9.3, 0.5,  115),
  f('fd-con-024', 'Guacamole',                        'condiments',100,'g', 150,  1.9,  8.6,13,   5.6, 0.5, 287),
  f('fd-con-025', 'Tzatziki',                         'condiments',100,'g',  54,  3.8,  3.4, 2.9, 0.3, 2.1, 260),
  f('fd-con-026', 'Sriracha',                         'condiments',100,'g',  93,  1.8, 19,   0.4, 2,   0,  2190),
  f('fd-con-027', 'Teriyaki Sauce',                   'condiments',100,'ml',116,  1.7, 26,   0.2, 0.3, 22, 3030),
  f('fd-con-028', 'Tomato Paste',                     'condiments',100,'g',  82,  4.3, 19,   0.5, 4.1,12,  1014),

  // ─────────────────────────────────────────────────────────────────────────────
  // SNACKS & SWEETS
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-snk-001', 'Dark Chocolate (70–85%)',          'snacks',  100,'g', 598,  7.8, 46,  43,  10.9, 24),
  f('fd-snk-002', 'Milk Chocolate',                   'snacks',  100,'g', 535,  7.7, 60,  30,   2.4, 52),
  f('fd-snk-003', 'White Chocolate',                  'snacks',  100,'g', 539,  5.9, 59,  32,   0.2, 59),
  f('fd-snk-004', 'Potato Chips (salted)',            'snacks',  100,'g', 536,  7,   53,  35,   4.4, 0.5, 525),
  f('fd-snk-005', 'Pretzels',                         'snacks',  100,'g', 381, 10,   80,   3,   3,   2.4, 1029),
  f('fd-snk-006', 'Tortilla Chips',                   'snacks',  100,'g', 489,  7.2, 64,  23,   4.5, 0.4, 531),
  f('fd-snk-007', 'Rice Crackers',                    'snacks',  100,'g', 387,  6.8, 83,   2.5, 1.8, 0.4, 468),
  f('fd-snk-008', 'Oat Granola Bar',                  'snacks',  100,'g', 471,  7.1, 68,  20,   4,  26,   247),
  f('fd-snk-009', 'Protein Bar (avg)',                'snacks',   60,'g', 200, 20,   22,   6,   4,  10,   200),
  f('fd-snk-010', 'Crackers (plain)',                 'snacks',  100,'g', 432,  9.5, 72,  12,   2.6, 2.1, 671),
  f('fd-snk-011', 'Popcorn (butter)',                 'snacks',  100,'g', 557, 12,   74,  24,  14,   0,   869),
  f('fd-snk-012', 'Trail Mix',                        'snacks',  100,'g', 462, 11,   47,  27,   5,  22,   126),
  f('fd-snk-013', 'Gummy Bears',                      'snacks',  100,'g', 330,  5.5, 79,   0.2, 0,  47,   110),
  f('fd-snk-014', 'Vanilla Ice Cream',                'snacks',  100,'g', 207,  3.5, 24,  11,   0,  21,    80),
  f('fd-snk-015', 'Cheesecake (plain)',               'snacks',  100,'g', 321,  5.5, 26,  23,   0.3,19,   220),
  f('fd-snk-016', 'Chocolate Brownie',                'snacks',  100,'g', 466,  5.3, 60,  23,   2.4,42,   191),
  f('fd-snk-017', 'Plain Croissant',                  'snacks',  100,'g', 406,  8.2, 46,  21,   2.1, 9.8, 508),
  f('fd-snk-018', 'Glazed Donut',                     'snacks',  100,'g', 452,  5.7, 51,  25,   1.6,24,   326),

  // ─────────────────────────────────────────────────────────────────────────────
  // OTHER
  // ─────────────────────────────────────────────────────────────────────────────
  f('fd-oth-001', 'Egg (1 large boiled)',             'other',     1,'piece', 78,  6.3,  0.6, 5.3, 0,  0.6, undefined, undefined, 50),
  f('fd-oth-002', 'Bone Broth',                       'other',   240,'ml', 31, 6,    0.5,  0.5, 0,  0,   480),
  f('fd-oth-003', 'Gelatin (plain)',                  'other',   100,'g', 335, 85,    0,   0,   0),
  f('fd-oth-004', 'Nutritional Yeast',                'other',   100,'g', 325, 50,   38,   5.4,14),
  f('fd-oth-005', 'Spirulina (powder)',               'other',   100,'g', 290, 57,   24,   8,   3.6),
  f('fd-oth-006', 'Miso Paste',                       'other',   100,'g', 199, 12,   26,   6,   5.4, 4.4, 3728),
  f('fd-oth-007', 'Sauerkraut',                       'other',   100,'g',  19,  0.9,  4.3, 0.1, 2.9, 1.8, 661),
  f('fd-oth-008', 'Kimchi',                           'other',   100,'g',  15,  1.1,  2.4, 0.5, 1.6, 1.5, 498),
  f('fd-oth-009', 'Greek Olives',                     'other',   100,'g', 145,  1,    3.8,15,   3.3, 0,   1556),
  f('fd-oth-010', 'Pickles (dill)',                   'other',   100,'g',  11,  0.4,  2.3, 0.2, 0.9, 0.8,1208),
];

// ── Seeding ───────────────────────────────────────────────────────────────────

const FOOD_SEED_VERSION = 'v4';
const FOOD_SEED_KEY = 'foodSeedVersion';

export async function seedFoodItemsIfEmpty(): Promise<void> {
  if (localStorage.getItem(FOOD_SEED_KEY) === FOOD_SEED_VERSION) return;
  const rows = SEED_FOOD_ITEMS.map(foodItemToDbRow);
  // ignoreDuplicates: false so existing rows get alt_servings updated
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase
      .from('food_items')
      .upsert(rows.slice(i, i + 100), { onConflict: 'id', ignoreDuplicates: false });
    if (error) { console.error('Failed to seed food items:', error); return; }
  }
  localStorage.setItem(FOOD_SEED_KEY, FOOD_SEED_VERSION);
}

export async function getAllFoodItems(): Promise<FoodItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  const isAdmin = useUserStore.getState().canAccessAdmin();

  let query = supabase.from('food_items').select('*');
  if (!isAdmin && userId) {
    query = query.or(`is_custom.eq.false,user_id.eq.${userId}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(dbRowToFoodItem);
}
