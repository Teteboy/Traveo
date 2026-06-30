import 'package:flutter/material.dart';

class Destination {
  final String id;
  final String name;
  final String country;
  final double rating;
  final String price;
  final String category;
  final String description;
  final String imagePath;
  final IconData icon;
  final List<String> highlights;
  final int reviews;

  const Destination({
    required this.id,
    required this.name,
    required this.country,
    required this.rating,
    required this.price,
    required this.category,
    required this.description,
    required this.imagePath,
    required this.icon,
    required this.highlights,
    this.reviews = 0,
  });
}

class MediaItem {
  final String label;
  final String type;
  final String? duration;
  final String imagePath;
  final IconData icon;

  const MediaItem({
    required this.label,
    required this.type,
    this.duration,
    required this.imagePath,
    required this.icon,
  });
}

const List<Destination> kDestinations = [
  Destination(
    id: '1',
    name: 'Santorini',
    country: 'Greece',
    rating: 4.9,
    price: 'From FCFA 899',
    category: 'beach',
    description:
        'Iconic white buildings perched on dramatic volcanic cliffs overlooking the deep blue Aegean Sea. Famous for breathtaking sunsets in Oia, crystal-clear waters, and world-class cuisine.',
    imagePath: 'assets/images/Logo.png',
    icon: Icons.beach_access_rounded,
    highlights: ['Oia Sunset', 'Caldera Views', 'Local Cuisine', 'Wine Tours'],
    reviews: 1248,
  ),
  Destination(
    id: '2',
    name: 'Safari Masai Mara',
    country: 'Kenya',
    rating: 4.8,
    price: 'From FCFA 1,200',
    category: 'adventure',
    description:
        'Witness the spectacular Great Wildebeest Migration. Home to the Big Five and some of Africa\'s most breathtaking landscapes and wildlife.',
    imagePath: 'assets/images/Logo.png',
    icon: Icons.pets_rounded,
    highlights: [
      'Big Five Safari',
      'Migration',
      'Hot Air Balloon',
      'Maasai Culture'
    ],
    reviews: 986,
  ),
  Destination(
    id: '3',
    name: 'Tokyo Street Food',
    country: 'Japan',
    rating: 4.9,
    price: 'From FCFA 650',
    category: 'food',
    description:
        'Dive into Tokyo\'s electric food scene — from steaming ramen in Shinjuku alleyways to fresh sushi at Tsukiji, yakitori stalls, and Michelin-starred restaurants.',
    imagePath: 'assets/images/Logo.png',
    icon: Icons.ramen_dining_rounded,
    highlights: [
      'Ramen Tours',
      'Tsukiji Market',
      'Izakayas',
      'Cooking Classes'
    ],
    reviews: 2103,
  ),
  Destination(
    id: '4',
    name: 'Swiss Alps Railway',
    country: 'Switzerland',
    rating: 4.7,
    price: 'From FCFA 1,100',
    category: 'train',
    description:
        'Journey through snow-capped peaks on the legendary Glacier Express and Bernina Express — the world\'s most scenic train routes through breathtaking alpine scenery.',
    imagePath: 'assets/images/Logo.png',
    icon: Icons.train_rounded,
    highlights: [
      'Glacier Express',
      'Bernina Pass',
      'Alpine Villages',
      'Mountain Lakes'
    ],
    reviews: 743,
  ),
  Destination(
    id: '5',
    name: 'Bali Retreat',
    country: 'Indonesia',
    rating: 4.8,
    price: 'From FCFA 599',
    category: 'beach',
    description:
        'A paradise of ancient temples, lush rice terraces, pristine beaches, and world-class surf. Bali blends spiritual culture with natural beauty.',
    imagePath: 'assets/images/Logo.png',
    icon: Icons.temple_buddhist_rounded,
    highlights: ['Ubud Temples', 'Rice Terraces', 'Surfing', 'Spa & Wellness'],
    reviews: 3147,
  ),
  Destination(
    id: '6',
    name: 'Patagonia Trek',
    country: 'Argentina',
    rating: 4.9,
    price: 'From FCFA 980',
    category: 'adventure',
    description:
        'Explore the end of the world where granite towers pierce the sky, glaciers calve into turquoise lakes, and condors soar overhead.',
    imagePath: 'assets/images/Logo.png',
    icon: Icons.terrain_rounded,
    highlights: [
      'Torres del Paine',
      'Glacier Trek',
      'Wildlife',
      'Wild Camping'
    ],
    reviews: 621,
  ),
];

const List<MediaItem> kMediaItems = [
  MediaItem(
      label: 'Santorini Sunset',
      type: 'video',
      duration: '2:34',
      imagePath: 'assets/images/Logo.png',
      icon: Icons.wb_sunny_rounded),
  MediaItem(
      label: 'Bali Rice Terraces',
      type: 'image',
      imagePath: 'assets/images/Logo.png',
      icon: Icons.grass_rounded),
  MediaItem(
      label: 'Tokyo at Night',
      type: 'video',
      duration: '1:58',
      imagePath: 'assets/images/Logo.png',
      icon: Icons.location_city_rounded),
  MediaItem(
      label: 'Swiss Peaks',
      type: 'image',
      imagePath: 'assets/images/Logo.png',
      icon: Icons.ac_unit_rounded),
  MediaItem(
      label: 'Safari Drive',
      type: 'video',
      duration: '3:12',
      imagePath: 'assets/images/Logo.png',
      icon: Icons.directions_car_rounded),
  MediaItem(
      label: 'Paris Streets',
      type: 'image',
      imagePath: 'assets/images/Logo.png',
      icon: Icons.apartment_rounded),
];

class TraveoCategory {
  final String id;
  final String label;
  final IconData icon;
  const TraveoCategory({required this.id, required this.label, required this.icon});
}

const List<TraveoCategory> kCategories = [
  TraveoCategory(id: 'all',       label: 'All',          icon: Icons.explore_rounded),
  TraveoCategory(id: 'adventure', label: 'Adventure',    icon: Icons.terrain_rounded),
  TraveoCategory(id: 'beach',     label: 'Beach',        icon: Icons.beach_access_rounded),
  TraveoCategory(id: 'food',      label: 'Food & Drink', icon: Icons.ramen_dining_rounded),
  TraveoCategory(id: 'train',     label: 'Train',        icon: Icons.train_rounded),
];
