// Fictional seed data for the Good Deeds demo (Brighton & Hove). All people, posts and offers are made up.

export type CategoryId =
  | 'litter'
  | 'graffiti'
  | 'beach'
  | 'greening'
  | 'foodbank'
  | 'animal'
  | 'schooltech'
  | 'skillswap'

export const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: 'litter', name: 'Litter picking' },
  { id: 'graffiti', name: 'Graffiti removal' },
  { id: 'beach', name: 'Beach cleaning' },
  { id: 'greening', name: 'Greening' },
  { id: 'foodbank', name: 'Food banks' },
  { id: 'animal', name: 'Dog walking' },
  { id: 'schooltech', name: 'School tech support' },
  { id: 'skillswap', name: 'Skill swap' },
]
export const catName = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.name ?? id

export const SKILLS = ['Tech', 'Gardening', 'Cooking', 'Driving', 'Admin', 'Teaching', 'Animal care', 'DIY'] as const

export type Pref3<A extends string, B extends string> = A | B | 'either'

export interface User {
  id: string
  firstName: string
  email: string
  dob: string
  postcode: string
  indoorOutdoor: Pref3<'indoor', 'outdoor'>
  manualPref: Pref3<'manual', 'nonmanual'>
  soloGroup: Pref3<'solo', 'group'>
  skills: string[]
  termsAcceptedAt: string
  idVerified: boolean
  prefsSet: boolean
}

export interface Opportunity {
  id: string
  posterId: string
  title: string
  category: CategoryId
  description: string
  tasks: string[]
  date: string // yyyy-mm-dd
  startTime: string // HH:MM
  hours: number
  place: string
  address: string
  postcode: string
  lat: number
  lng: number
  indoorOutdoor: 'indoor' | 'outdoor'
  manual: boolean
  online: boolean
  type: 'individual' | 'group'
  capacity: number
  otherAttendees: number // fictional members of the public already signed up
  skills: string[]
  provided: string
  bring: string[]
  access: string
  status: 'open' | 'completed'
  image: string
  imageAlt: string
  createdAt: string
}

export type SignupStatus = 'joined' | 'pending' | 'confirmed' | 'cancelled'
export interface Signup {
  id: string
  oppId: string
  userId: string
  status: SignupStatus
  joinedAt: string
  doneAt?: string
  confirmedAt?: string
  points: number
}

export interface Business {
  id: string
  name: string
  area: string
  description: string
}
export interface Offer {
  id: string
  businessId: string
  title: string
  cost: number
}
export interface Redemption {
  id: string
  userId: string
  offerId: string
  points: number
  code: string
  at: string
}
export interface Note {
  id: string
  userId: string
  text: string
  oppId?: string
  at: string
  seen: boolean
}

export const TODAY = '2026-11-12' // Thursday 12 November 2026 – the demo's "today"

export const POSTCODES: Record<string, { lat: number; lng: number; area: string }> = {
  BN1: { lat: 50.8285, lng: -0.1395, area: 'Central Brighton' },
  BN2: { lat: 50.8225, lng: -0.1205, area: 'Kemptown' },
  BN3: { lat: 50.8305, lng: -0.1705, area: 'Hove' },
  BN41: { lat: 50.8365, lng: -0.2005, area: 'Portslade' },
}
export const CITY_CENTRE = { lat: 50.8225, lng: -0.1372 }

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`

export const IMAGES = {
  beach: img('photo-1616680214084-22670de1bc82'),
  beach2: img('photo-1617953141905-b27fb1f17d88'),
  beach3: img('photo-1610093674388-cee0337f2684'),
  litter: img('photo-1758599669406-d5179ccefcb9'),
  litter2: img('photo-1758599668429-121d54188b9c'),
  garden: img('photo-1759716705272-8d1697eccf7a'),
  garden2: img('photo-1544928938-6852c1925194'),
  garden3: img('photo-1551855350-c86caeaf8707'),
  food: img('photo-1599059813005-11265ba4b4ce'),
  food2: img('photo-1593113616828-6f22bca04804'),
  food3: img('photo-1593113646773-028c64a8f1b8'),
  dog: img('photo-1768752926303-4a1771f1cce0'),
  dog2: img('photo-1769732169102-c997d8c334fd'),
  graffiti: img('photo-1571446390594-87abc6667406'),
  graffiti2: img('photo-1582144503536-8b7465bc07b3'),
  tech: img('photo-1761208662734-fb46f1398551'),
  tech2: img('photo-1555436169-20e93ea9a7ff'),
  skill: img('photo-1791298043001-d6488112d8da'),
  skill2: img('photo-1785829413650-ba241aae5f92'),
  pier: img('photo-1635388244110-d43e1c8ff208'),
}

export const CATEGORY_IMAGE: Record<CategoryId, string> = {
  litter: IMAGES.litter2,
  graffiti: IMAGES.graffiti2,
  beach: IMAGES.beach3,
  greening: IMAGES.garden3,
  foodbank: IMAGES.food3,
  animal: IMAGES.dog2,
  schooltech: IMAGES.tech2,
  skillswap: IMAGES.skill2,
}

export const SEED_USERS: User[] = [
  {
    id: 'u-sam',
    firstName: 'Sam',
    email: 'sam@example.com',
    dob: '2010-06-03',
    postcode: 'BN3 4AH',
    indoorOutdoor: 'either',
    manualPref: 'either',
    soloGroup: 'either',
    skills: ['Tech', 'Animal care'],
    termsAcceptedAt: '2026-10-02T18:10:00Z',
    idVerified: true,
    prefsSet: true,
  },
  {
    id: 'u-dave',
    firstName: 'Dave',
    email: 'dave@example.com',
    dob: '1974-03-19',
    postcode: 'BN2 9QA',
    indoorOutdoor: 'outdoor',
    manualPref: 'manual',
    soloGroup: 'group',
    skills: ['DIY'],
    termsAcceptedAt: '2026-09-14T09:00:00Z',
    idVerified: true,
    prefsSet: true,
  },
  {
    id: 'u-samo',
    firstName: 'Sam O.',
    email: 'sam.okafor@example.com',
    dob: '1981-01-08',
    postcode: 'BN1 4GH',
    indoorOutdoor: 'indoor',
    manualPref: 'either',
    soloGroup: 'group',
    skills: ['Admin', 'Driving'],
    termsAcceptedAt: '2026-09-20T09:00:00Z',
    idVerified: true,
    prefsSet: true,
  },
]

// Posters who are not demo log-ins (shown by name only)
export const POSTER_NAMES: Record<string, string> = {
  'u-dave': 'Dave M.',
  'u-samo': 'Sam O.',
  'u-jess': 'Jess H.',
  'u-raj': 'Raj P.',
  'u-aisha': 'Aisha K.',
  'u-ben': 'Ben C.',
  'u-sam': 'Sam L.',
}
export const POSTER_ABOUT: Record<string, string> = {
  'u-dave': 'Runs a monthly litter pick on The Level and seafront cleans with neighbours from Kemptown.',
  'u-samo': 'Coordinates volunteers for the North Laine Community Food Bank, part of a registered charity.',
  'u-jess': 'Looks after planting days with Hove Greening, a group of neighbours greening local streets.',
  'u-raj': 'Volunteers at Downs Dog Rescue and organises weekend walking rotas.',
  'u-aisha': 'Parent governor who helps local primary schools with donated laptops and IT.',
  'u-ben': 'Hosts skill swaps at the Hove Community Hub – fixing, cooking and making.',
}

export const SEED_OPPS: Opportunity[] = [
  {
    id: 'o-beach',
    posterId: 'u-dave',
    title: 'Seafront Beach Clean',
    category: 'beach',
    description:
      'Help keep the beach by the Palace Pier clear of plastic, cans and cigarette ends before the weekend crowds arrive. Friendly, relaxed and easy to join – no experience needed.',
    tasks: [
      'Pick litter along the shingle between the Palace Pier and the Fishing Museum',
      'Separate recycling from general waste at the collection point',
      'Note any unusual finds for the Marine Conservation tally',
    ],
    date: '2026-11-14',
    startTime: '10:00',
    hours: 2,
    place: 'Beach by the Palace Pier',
    address: 'Meet at the bottom of the steps west of the Palace Pier, Madeira Drive',
    postcode: 'BN2 1TW',
    lat: 50.8186,
    lng: -0.1362,
    indoorOutdoor: 'outdoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 12,
    otherAttendees: 0,
    skills: [],
    provided: 'Gloves, litter pickers and bags are provided. Dave gives a 5-minute safety briefing at the start.',
    bring: ['Warm, waterproof layers', 'Sturdy shoes for shingle', 'A water bottle'],
    access:
      'The promenade is step-free. The shingle is uneven – you can help sort recycling on the promenade instead. Accessible toilets at the Palace Pier entrance.',
    status: 'open',
    image: IMAGES.beach,
    imageAlt: 'A group of volunteers with bags standing on a beach',
    createdAt: '2026-11-02T10:00:00Z',
  },
  {
    id: 'o-level',
    posterId: 'u-dave',
    title: 'Monthly Litter Pick on The Level',
    category: 'litter',
    description:
      'Our regular monthly tidy-up of The Level park and the streets around it. Come for the whole session or just an hour.',
    tasks: ['Litter pick the park, skate park edges and Union Road', 'Empty bags at the collection point by the café'],
    date: '2026-11-22',
    startTime: '11:00',
    hours: 1.5,
    place: 'The Level',
    address: 'Meet by The Level café, Union Road',
    postcode: 'BN2 3FX',
    lat: 50.8318,
    lng: -0.1335,
    indoorOutdoor: 'outdoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 15,
    otherAttendees: 0,
    skills: [],
    provided: 'Litter pickers, gloves and bags provided.',
    bring: ['Comfortable clothes', 'A water bottle'],
    access: 'Flat, step-free paths throughout the park. Accessible toilet in the café.',
    status: 'open',
    image: IMAGES.litter,
    imageAlt: 'Volunteers holding rubbish bags in a park',
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'o-foodbank',
    posterId: 'u-samo',
    title: 'Saturday Food Bank Shift',
    category: 'foodbank',
    description:
      'Help sort donations and pack food parcels for families in Brighton. A friendly team shows you the ropes.',
    tasks: ['Check dates on donated food', 'Sort tins and dry goods onto shelves', 'Pack parcels for collection'],
    date: '2026-11-14',
    startTime: '09:30',
    hours: 3,
    place: 'North Laine Community Food Bank',
    address: 'Church hall, Gloucester Road',
    postcode: 'BN1 4AQ',
    lat: 50.8273,
    lng: -0.1382,
    indoorOutdoor: 'indoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 8,
    otherAttendees: 5,
    skills: [],
    provided: 'A short induction on arrival. Aprons and gloves provided.',
    bring: ['Closed-toe shoes'],
    access: 'Step-free entrance via the side ramp. Seated packing tasks available.',
    status: 'open',
    image: IMAGES.food,
    imageAlt: 'Volunteers sorting tins of food donations',
    createdAt: '2026-11-04T10:00:00Z',
  },
  {
    id: 'o-delivery',
    posterId: 'u-samo',
    title: 'Food Parcel Delivery Driver',
    category: 'foodbank',
    description: 'Drive food parcels to people who cannot get to the food bank. Routes stay within Brighton.',
    tasks: ['Load parcels at the food bank', 'Deliver to 6–8 addresses with a route sheet'],
    date: '2026-11-17',
    startTime: '13:00',
    hours: 2,
    place: 'North Laine Community Food Bank',
    address: 'Church hall, Gloucester Road',
    postcode: 'BN1 4AQ',
    lat: 50.8276,
    lng: -0.1376,
    indoorOutdoor: 'outdoor',
    manual: true,
    online: false,
    type: 'individual',
    capacity: 1,
    otherAttendees: 0,
    skills: ['Driving'],
    provided: 'Route sheet and parking permit provided. Fuel is not reimbursed in this demo.',
    bring: ['Your own car and a full UK driving licence'],
    access: 'Involves carrying parcels up to 8 kg.',
    status: 'open',
    image: IMAGES.food2,
    imageAlt: 'People packing food into bags',
    createdAt: '2026-11-05T10:00:00Z',
  },
  {
    id: 'o-dogs',
    posterId: 'u-raj',
    title: 'Weekend Dog Walking',
    category: 'animal',
    description: 'Take rescue dogs for a walk on the Downs so they get exercise and company while they wait for a home.',
    tasks: ['Collect a dog from the kennels', 'Walk a set route on the Downs', 'Note how the walk went for staff'],
    date: '2026-11-15',
    startTime: '10:00',
    hours: 2,
    place: 'Downs Dog Rescue',
    address: 'Warren Road, Woodingdean',
    postcode: 'BN2 6DA',
    lat: 50.8352,
    lng: -0.0905,
    indoorOutdoor: 'outdoor',
    manual: false,
    online: false,
    type: 'group',
    capacity: 6,
    otherAttendees: 2,
    skills: ['Animal care'],
    provided: 'Leads and a route map. Staff match you with a dog that suits your experience.',
    bring: ['Walking boots', 'Waterproof coat'],
    access: 'Routes are hilly and grassy. Not suitable for wheelchairs.',
    status: 'open',
    image: IMAGES.dog,
    imageAlt: 'A dog in a purple collar standing in woodland',
    createdAt: '2026-11-03T10:00:00Z',
  },
  {
    id: 'o-dogsolo',
    posterId: 'u-raj',
    title: 'Lunchtime Walk for Biscuit',
    category: 'animal',
    description: 'Walk Biscuit, a gentle older terrier, around Preston Park while his owner recovers from surgery.',
    tasks: ['Collect Biscuit from his owner on Preston Drove', 'A gentle 40-minute walk'],
    date: '2026-11-18',
    startTime: '12:30',
    hours: 1,
    place: 'Preston Drove',
    address: 'Preston Drove, near Preston Park',
    postcode: 'BN1 6LA',
    lat: 50.8418,
    lng: -0.1432,
    indoorOutdoor: 'outdoor',
    manual: false,
    online: false,
    type: 'individual',
    capacity: 1,
    otherAttendees: 0,
    skills: ['Animal care'],
    provided: 'Lead and poo bags provided.',
    bring: ['Comfortable shoes'],
    access: 'Flat park paths.',
    status: 'open',
    image: IMAGES.dog2,
    imageAlt: 'A person with a dog by a bus stop',
    createdAt: '2026-11-06T10:00:00Z',
  },
  {
    id: 'o-graffiti',
    posterId: 'u-dave',
    title: 'Trafalgar Street Graffiti Clean-up',
    category: 'graffiti',
    description: 'Remove tags from walls and shutters near Brighton station, with permission from the owners.',
    tasks: ['Apply eco-friendly remover', 'Scrub and rinse walls', 'Repaint two shutters'],
    date: '2026-11-21',
    startTime: '10:00',
    hours: 3,
    place: 'Trafalgar Street',
    address: 'Meet at the bottom of Trafalgar Street steps',
    postcode: 'BN1 4ED',
    lat: 50.8293,
    lng: -0.1398,
    indoorOutdoor: 'outdoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 10,
    otherAttendees: 3,
    skills: ['DIY'],
    provided: 'Brushes, remover, paint and protective gloves and goggles.',
    bring: ['Old clothes you don’t mind getting paint on'],
    access: 'Pavement work on a slope. Seating available nearby.',
    status: 'open',
    image: IMAGES.graffiti,
    imageAlt: 'A wall covered in graffiti tags',
    createdAt: '2026-11-03T10:00:00Z',
  },
  {
    id: 'o-shutters',
    posterId: 'u-ben',
    title: 'London Road Shutter Repaint',
    category: 'graffiti',
    description: 'Give tagged shop shutters on London Road a fresh coat, working with local traders.',
    tasks: ['Prep and clean shutters', 'Paint in traders’ chosen colours'],
    date: '2026-11-28',
    startTime: '09:00',
    hours: 2.5,
    place: 'London Road',
    address: 'Meet outside the Open Market, London Road',
    postcode: 'BN1 4JU',
    lat: 50.8345,
    lng: -0.1372,
    indoorOutdoor: 'outdoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 8,
    otherAttendees: 2,
    skills: ['DIY'],
    provided: 'Paint, rollers and drop sheets.',
    bring: ['Old clothes'],
    access: 'Flat pavement. Step-free.',
    status: 'open',
    image: IMAGES.graffiti2,
    imageAlt: 'Colourful graffiti on a wall',
    createdAt: '2026-11-07T10:00:00Z',
  },
  {
    id: 'o-preston',
    posterId: 'u-jess',
    title: 'Bulb Planting in Preston Park',
    category: 'greening',
    description: 'Plant 2,000 spring bulbs along the rose garden edges so they bloom in March.',
    tasks: ['Dig small holes with trowels', 'Plant bulbs in drifts', 'Water in and tidy up'],
    date: '2026-11-15',
    startTime: '10:30',
    hours: 2,
    place: 'Preston Park',
    address: 'Meet by the Rotunda café, Preston Park',
    postcode: 'BN1 6SD',
    lat: 50.8405,
    lng: -0.1470,
    indoorOutdoor: 'outdoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 20,
    otherAttendees: 9,
    skills: ['Gardening'],
    provided: 'Trowels, kneeling pads and gloves.',
    bring: ['Clothes for kneeling on damp grass'],
    access: 'Flat paths; kneeling pads and a seated planting table available.',
    status: 'open',
    image: IMAGES.garden2,
    imageAlt: 'Two women holding shovels outdoors',
    createdAt: '2026-11-02T10:00:00Z',
  },
  {
    id: 'o-hovelawns',
    posterId: 'u-jess',
    title: 'Hove Lawns Hedge Planting',
    category: 'greening',
    description: 'Plant a native hedge along the edge of Hove Lawns to shelter wildlife from sea winds.',
    tasks: ['Plant hawthorn and blackthorn whips', 'Fit tree guards'],
    date: '2026-11-21',
    startTime: '13:00',
    hours: 2,
    place: 'Hove Lawns',
    address: 'Meet by the bandstand, Kingsway',
    postcode: 'BN3 2WN',
    lat: 50.8237,
    lng: -0.1625,
    indoorOutdoor: 'outdoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 14,
    otherAttendees: 4,
    skills: ['Gardening'],
    provided: 'Spades, gloves and tree guards.',
    bring: ['Wellies or boots'],
    access: 'Grass lawns, flat. Step-free from the promenade.',
    status: 'open',
    image: IMAGES.garden,
    imageAlt: 'Raised garden beds around a gazebo in a park',
    createdAt: '2026-11-04T10:00:00Z',
  },
  {
    id: 'o-treepits',
    posterId: 'u-jess',
    title: 'Street Tree Watering Round',
    category: 'greening',
    description: 'Water young street trees on a short Kemptown loop after work. A quick, solo good deed.',
    tasks: ['Collect a watering can from St George’s Road', 'Water 8 young trees on the loop'],
    date: '2026-11-18',
    startTime: '17:30',
    hours: 1,
    place: 'St George’s Road',
    address: 'Collect the can from the community notice board, St George’s Road',
    postcode: 'BN2 1ED',
    lat: 50.8197,
    lng: -0.1198,
    indoorOutdoor: 'outdoor',
    manual: true,
    online: false,
    type: 'individual',
    capacity: 1,
    otherAttendees: 0,
    skills: [],
    provided: 'Watering can and a map of the trees.',
    bring: ['A torch – it gets dark early'],
    access: 'Pavement route with some kerbs.',
    status: 'open',
    image: IMAGES.garden3,
    imageAlt: 'A woman planting a small plant',
    createdAt: '2026-11-08T10:00:00Z',
  },
  {
    id: 'o-laptops',
    posterId: 'u-aisha',
    title: 'Laptop Set-up at Elm Hill Primary',
    category: 'schooltech',
    description: 'Set up 20 donated laptops for a primary school’s after-school coding club.',
    tasks: ['Wipe and update laptops', 'Install the school’s software list', 'Label and charge each laptop'],
    date: '2026-11-19',
    startTime: '15:30',
    hours: 2,
    place: 'Elm Hill Primary School',
    address: 'School office, Elm Grove',
    postcode: 'BN2 3ER',
    lat: 50.8325,
    lng: -0.1235,
    indoorOutdoor: 'indoor',
    manual: false,
    online: false,
    type: 'group',
    capacity: 4,
    otherAttendees: 1,
    skills: ['Tech'],
    provided: 'Software list and step-by-step guide. You work in the staff room, not with pupils.',
    bring: ['Photo ID to sign in at reception'],
    access: 'Step-free entrance and lift. Accessible toilet.',
    status: 'open',
    image: IMAGES.tech,
    imageAlt: 'A teacher with children at tables in a classroom',
    createdAt: '2026-11-05T10:00:00Z',
  },
  {
    id: 'o-onlinehelp',
    posterId: 'u-aisha',
    title: 'Online Tech Help for Parents',
    category: 'schooltech',
    description: 'Join a video call to help parents set up the school’s homework app. Easy to do from home.',
    tasks: ['Answer questions on a group video call', 'Share your screen to show set-up steps'],
    date: '2026-11-24',
    startTime: '19:00',
    hours: 1,
    place: 'Online video call',
    address: 'Joining link shared once you join',
    postcode: 'BN2 3ER',
    lat: 50.8338,
    lng: -0.1262,
    indoorOutdoor: 'indoor',
    manual: false,
    online: true,
    type: 'individual',
    capacity: 1,
    otherAttendees: 0,
    skills: ['Tech', 'Teaching'],
    provided: 'A short guide to the app beforehand.',
    bring: ['A laptop with a camera and microphone'],
    access: 'Captions available on the call.',
    status: 'open',
    image: IMAGES.tech2,
    imageAlt: 'Two people looking at a laptop',
    createdAt: '2026-11-06T10:00:00Z',
  },
  {
    id: 'o-bikes',
    posterId: 'u-ben',
    title: 'Bike Repair Skill Swap',
    category: 'skillswap',
    description: 'Share what you know about fixing bikes – or come to learn. Swap skills over tea and biscuits.',
    tasks: ['Help neighbours fix punctures and brakes', 'Swap tips at the tool table'],
    date: '2026-11-28',
    startTime: '14:00',
    hours: 2,
    place: 'Hove Community Hub',
    address: 'Main hall, Church Road',
    postcode: 'BN3 3DE',
    lat: 50.8282,
    lng: -0.1745,
    indoorOutdoor: 'indoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 12,
    otherAttendees: 6,
    skills: ['DIY'],
    provided: 'Tools and spare parts.',
    bring: ['Your bike, if it needs a fix'],
    access: 'Step-free hall with accessible toilet.',
    status: 'open',
    image: IMAGES.skill2,
    imageAlt: 'Two people working on fabric with scissors',
    createdAt: '2026-11-07T10:00:00Z',
  },
  {
    id: 'o-cooking',
    posterId: 'u-ben',
    title: 'Batch Cooking Skill Swap',
    category: 'skillswap',
    description: 'Cook big pots of soup together, share recipes, and take portions home or donate them.',
    tasks: ['Chop and prep vegetables', 'Share a recipe you love'],
    date: '2026-11-29',
    startTime: '12:00',
    hours: 2.5,
    place: 'Hove Community Hub',
    address: 'Community kitchen, Church Road',
    postcode: 'BN3 3DE',
    lat: 50.8276,
    lng: -0.1730,
    indoorOutdoor: 'indoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 10,
    otherAttendees: 3,
    skills: ['Cooking'],
    provided: 'Ingredients, aprons and containers.',
    bring: ['Tell the organiser about any allergies'],
    access: 'Step-free kitchen with a lowered worktop.',
    status: 'open',
    image: IMAGES.skill,
    imageAlt: 'A young woman and an older woman talking at a table',
    createdAt: '2026-11-08T10:00:00Z',
  },
  {
    id: 'o-hovebeach',
    posterId: 'u-dave',
    title: 'Hove Beach Huts Clean',
    category: 'beach',
    description: 'A short clean along the beach huts on Hove seafront. Great if you only have an hour or so.',
    tasks: ['Pick litter along the shingle', 'Sort recycling'],
    date: '2026-11-22',
    startTime: '10:00',
    hours: 1.5,
    place: 'Hove beach huts',
    address: 'Meet by the King Alfred end of the beach huts, Kingsway',
    postcode: 'BN3 2WN',
    lat: 50.8228,
    lng: -0.1800,
    indoorOutdoor: 'outdoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 15,
    otherAttendees: 4,
    skills: [],
    provided: 'Gloves, pickers and bags.',
    bring: ['Warm layers'],
    access: 'Step-free promenade; shingle is uneven.',
    status: 'open',
    image: IMAGES.beach2,
    imageAlt: 'People walking on a beach',
    createdAt: '2026-11-08T10:00:00Z',
  },
  // Completed in the past – appear only in history
  {
    id: 'o-past-leaves',
    posterId: 'u-jess',
    title: 'Preston Park Leaf Clear-up',
    category: 'greening',
    description: 'Raked leaves off the paths and play area.',
    tasks: [],
    date: '2026-11-01',
    startTime: '10:00',
    hours: 2,
    place: 'Preston Park',
    address: 'Preston Park',
    postcode: 'BN1 6SD',
    lat: 50.84,
    lng: -0.147,
    indoorOutdoor: 'outdoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 20,
    otherAttendees: 10,
    skills: [],
    provided: '',
    bring: [],
    access: '',
    status: 'completed',
    image: IMAGES.garden,
    imageAlt: 'A park garden',
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'o-past-food',
    posterId: 'u-samo',
    title: 'Food Bank Sorting Morning',
    category: 'foodbank',
    description: 'Sorted harvest festival donations.',
    tasks: [],
    date: '2026-10-31',
    startTime: '09:30',
    hours: 3,
    place: 'North Laine Community Food Bank',
    address: 'Church hall, Gloucester Road',
    postcode: 'BN1 4AQ',
    lat: 50.8273,
    lng: -0.1382,
    indoorOutdoor: 'indoor',
    manual: true,
    online: false,
    type: 'group',
    capacity: 8,
    otherAttendees: 6,
    skills: [],
    provided: '',
    bring: [],
    access: '',
    status: 'completed',
    image: IMAGES.food3,
    imageAlt: 'People in front of cardboard boxes',
    createdAt: '2026-10-20T10:00:00Z',
  },
]

// Fictional attendees on Dave's posts, so the organiser view has people in it
export const FICTIONAL_ATTENDEES: Record<string, string> = {
  'u-f1': 'Lucy',
  'u-f2': 'Tom',
  'u-f3': 'Priya',
  'u-f4': 'Oscar',
  'u-f5': 'Hannah',
}

export const SEED_SIGNUPS: Signup[] = [
  ...['u-f1', 'u-f2', 'u-f3', 'u-f4', 'u-f5'].map((u, i) => ({
    id: `s-beach-${i}`,
    oppId: 'o-beach',
    userId: u,
    status: 'joined' as const,
    joinedAt: '2026-11-05T10:00:00Z',
    points: 0,
  })),
  ...['u-f2', 'u-f4'].map((u, i) => ({
    id: `s-level-${i}`,
    oppId: 'o-level',
    userId: u,
    status: 'joined' as const,
    joinedAt: '2026-11-06T10:00:00Z',
    points: 0,
  })),
  { id: 's-sam-1', oppId: 'o-past-food', userId: 'u-sam', status: 'confirmed', joinedAt: '2026-10-25T10:00:00Z', confirmedAt: '2026-10-31T14:00:00Z', points: 30 },
  { id: 's-sam-2', oppId: 'o-past-leaves', userId: 'u-sam', status: 'confirmed', joinedAt: '2026-10-28T10:00:00Z', confirmedAt: '2026-11-01T14:00:00Z', points: 20 },
  { id: 's-sam-3', oppId: 'o-laptops', userId: 'u-sam', status: 'joined', joinedAt: '2026-11-09T10:00:00Z', points: 0 },
]

export const BUSINESSES: Business[] = [
  { id: 'b-beans', name: 'Seaside Beans', area: 'Kemptown', description: 'Independent coffee bar on St James’s Street' },
  { id: 'b-books', name: 'North Laine Books', area: 'North Laine', description: 'Second-hand and new books' },
  { id: 'b-bikes', name: 'The Level Bike Co.', area: 'The Level', description: 'Bike repairs and servicing' },
  { id: 'b-plants', name: 'Hove Plant Shed', area: 'Hove', description: 'Houseplants and garden bits' },
  { id: 'b-scoops', name: 'Shingle Scoops', area: 'Seafront', description: 'Gelato by the beach' },
]

export const OFFERS: Offer[] = [
  { id: 'of-1', businessId: 'b-beans', title: 'Free flat white', cost: 20 },
  { id: 'of-2', businessId: 'b-scoops', title: 'Two scoops for one', cost: 10 },
  { id: 'of-3', businessId: 'b-beans', title: 'Coffee and a pastry', cost: 35 },
  { id: 'of-4', businessId: 'b-plants', title: 'Free small succulent', cost: 40 },
  { id: 'of-5', businessId: 'b-bikes', title: 'Free bike safety check', cost: 50 },
  { id: 'of-6', businessId: 'b-books', title: '£5 off any book', cost: 60 },
  { id: 'of-7', businessId: 'b-plants', title: '20% off a pot and plant', cost: 100 },
]

export const SEED_REDEMPTIONS: Redemption[] = [
  { id: 'r-1', userId: 'u-sam', offerId: 'of-1', points: 20, code: 'GD-4M8Q2', at: '2026-11-03T12:00:00Z' },
]

export const SEED_NOTES: Note[] = []
