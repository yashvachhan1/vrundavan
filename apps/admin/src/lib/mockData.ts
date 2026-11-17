export const DEFAULT_MOCK_ORDERS = [
  {
    id: 'ORD-101',
    quote_id: 'VRUN-7A1B',
    customer: 'Rahul Verma',
    phone: '+91 98765 43210',
    email: 'rahul@example.com',
    package: 'Custom Plan: Wedding Day (Photo + Video - ₹50,000), Drone Aerial Coverage (1 Day - ₹10,000)',
    total_amount: 60000,
    location: 'Junagadh',
    date: '2026-11-25',
    status: 'confirmed',
    amountPaid: '5000',
    assignedTeam: ['Rahul Sharma', 'Sanjay Kumar'],
    created_at: '2026-10-15T10:00:00Z'
  },
  {
    id: 'ORD-102',
    quote_id: 'VRUN-8C2D',
    customer: 'Sneha Patel',
    phone: '+91 87654 32109',
    email: 'sneha@example.com',
    package: 'Pre-Wedding Poetics',
    total_amount: 55000,
    location: 'Girnar Hills, Junagadh',
    date: '2026-12-05',
    status: 'confirmed',
    assignedTeam: ['Rahul Sharma'],
    amountPaid: '5000',
    created_at: '2026-10-22T14:30:00Z'
  },
  {
    id: 'ORD-103',
    quote_id: 'VRUN-9E3F',
    customer: 'Amit & Riya Shah',
    phone: '+91 91234 56780',
    email: 'amit.riya@example.com',
    package: 'The Masterpiece (Full Wedding Film & Photography)',
    total_amount: 175000,
    location: 'Rajkot Heritage Club',
    date: '2026-12-18',
    status: 'pending',
    assignedTeam: ['Rahul Sharma', 'Sanjay Kumar', 'Priya Singh'],
    amountPaid: '10000',
    created_at: '2026-11-04T09:15:00Z'
  },
  {
    id: 'ORD-104',
    quote_id: 'VRUN-4K9L',
    customer: 'Darshan Joshi',
    phone: '+91 99887 76655',
    email: 'darshan@example.com',
    package: 'Intimate Celebrations (Haldi + Mehendi)',
    total_amount: 85000,
    location: 'Somnath Beach Resort',
    date: '2026-12-22',
    status: 'pending_payment',
    assignedTeam: [],
    amountPaid: '0',
    created_at: '2026-11-10T16:45:00Z'
  },
  {
    id: 'ORD-105',
    quote_id: 'VRUN-5M8N',
    customer: 'Kavita Mehta',
    phone: '+91 97654 12345',
    email: 'kavita@example.com',
    package: 'Custom Plan: Engagement Ceremony & Candid Photography',
    total_amount: 45000,
    location: 'Junagadh',
    date: '2027-01-14',
    status: 'confirmed',
    assignedTeam: ['Rahul Sharma'],
    amountPaid: '5000',
    created_at: '2026-11-12T11:20:00Z'
  }
];

export const DEFAULT_MOCK_TEAM = [
  { id: 'tm-1', name: 'Rahul Sharma', role: 'Lead Photographer', phone: '+91 98765 43210', icon: 'Camera' },
  { id: 'tm-2', name: 'Sanjay Kumar', role: 'Drone Operator', phone: '+91 76543 21098', icon: 'User' },
  { id: 'tm-3', name: 'Priya Singh', role: 'Senior Video Editor', phone: '+91 65432 10987', icon: 'Video' }
];

export const DEFAULT_MOCK_PACKAGES = [
  {
    id: 'pkg-1',
    name: 'Pre-Wedding Poetics',
    price: '₹55,000',
    period: 'per shoot',
    description: 'Capturing candid coupling stories in organic golden hour natural lighting.',
    features: ['1 Cinematographer', '1 Candid Photographer', 'Drone coverage', '1 min teaser reel', '3 to 4 min cinematic song'],
    is_popular: false,
    active: true
  },
  {
    id: 'pkg-2',
    name: 'The Masterpiece',
    price: '₹1,75,000',
    period: 'per day',
    description: 'Our signature offering. A complete cinematic storytelling of your big day.',
    features: ['2 Cinematographers', '2 Candid Photographers', '1 Traditional Photographer', 'Drone coverage', '5 to 6 min cinematic highlight', 'Full cinematic film (40+ mins)', 'Premium Photo Album'],
    is_popular: true,
    badge_text: 'Most Popular',
    active: true
  },
  {
    id: 'pkg-3',
    name: 'Intimate Celebrations',
    price: '₹85,000',
    period: 'per day',
    description: 'Perfect for Haldi, Mehendi, or intimate single-day ceremonies.',
    features: ['1 Traditional Photographer', '1 Traditional Videographer', '1 Candid Photographer', 'Full ceremony coverage video', 'All processed high-res photos'],
    is_popular: false,
    active: true
  }
];

export const DEFAULT_MOCK_PLAN_ITEMS = [
  { id: 'cpi-1', type: 'event', name: 'Haldi Ceremony', price: 15000, description: 'Bright & colorful haldi coverage', icon: 'camera', active: true },
  { id: 'cpi-2', type: 'event', name: 'Mehendi Function', price: 20000, description: 'Intimate mehendi evening with family', icon: 'camera', active: true },
  { id: 'cpi-3', type: 'event', name: 'Wedding (Lagna)', price: 50000, description: 'Full traditional wedding day coverage', icon: 'camera', active: true },
  { id: 'cpi-4', type: 'service', name: 'Cinematic 4K Video', price: 80000, description: '4K film with professional color grading', icon: 'video', active: true },
  { id: 'cpi-5', type: 'service', name: 'Candid Photography', price: 40000, description: 'Natural unposed moments captured', icon: 'camera', active: true },
  { id: 'cpi-6', type: 'addon', name: 'Same Day Edit Teaser', price: 25000, description: 'Highlight teaser ready for reception', icon: 'video', active: true },
  { id: 'cpi-7', type: 'addon', name: 'Aerial Drone 4K', price: 10000, description: 'Bird-eye aerial cinematography', icon: 'drone', active: true }
];
