import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Heart, Search, Home, ArrowLeft, Menu, Share2, Plus, Minus, X, ArrowRight, Sparkles, Trash2, CreditCard, CheckCircle, Filter, User, Package, Settings, LogOut, Bell, MapPin, UserPlus, ShoppingCart, Clock, Truck, Mail, Eye, Star, Camera, Image, Upload, Grid, ThumbsUp, RefreshCw, Palette, Sparkle, ChevronRight, SwitchCamera, Zap, RotateCcw, Timer, Flame, Award, Send, MessageCircle, Users, Unlock, Lock, ThumbsDown, Repeat, Ticket, QrCode, Layers, DollarSign, FileText, AlertCircle, HelpCircle, Gift, HandCoins, Shirt, Link, Check, Loader2, Store, Mic, Paperclip, Flag, Gem, Watch, Coffee, Trophy, Circle, Store as StoreIcon, Bot, Wand2, Globe, Instagram, Twitter, Facebook, BadgeCheck, ExternalLink } from 'lucide-react';
// --- GEMINI API INTEGRATION ---
const apiKey = ""; // The execution environment provides the key at runtime

// Text Generation (Chat)
const callGeminiChat = async (prompt: string, systemContext: string = ""): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const finalPrompt = systemContext ? `${systemContext}\n\nUser Query: ${prompt}` : prompt;
  const payload = { contents: [{ parts: [{ text: finalPrompt }] }] };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
  } catch (err) {
    return "Error connecting to AI.";
  }
};

// Image Generation (Virtual Try-On)
const callGeminiImage = async (prompt: string): Promise<string | null> => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const payload = {
        instances: [{ prompt: prompt }],
        parameters: { sampleCount: 1 }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Image API Error: ${response.status}`);
        const data = await response.json();
        return data.predictions?.[0]?.bytesBase64Encoded 
            ? `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}` 
            : null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

// --- Types ---
// --- UPDATE THIS INTERFACE ---
interface Product {
  id: number;
  brand: string;
  name: string;
  price: number;
  image: string; // Keep this for the grid view
  images?: string[]; // NEW: For the carousel
  category: string;
  style: 'streetwear' | 'vintage' | 'high_fashion' | 'minimalist' | 'casual' | 'sportswear';
  description: string;
  condition?: 'new' | 'pre-owned';
  seller?: string;
  colors?: string[]; // NEW: Hex codes or names
  materials?: string; // NEW
  care?: string; // NEW
}

interface CartItem extends Product {
  cartId: string;
  size: string;
  quantity: number;
  isGift?: boolean; 
  giftRecipient?: string;
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  status: 'processing' | 'shipped' | 'delivered';
  total: number;
  trackingNumber: string;
  estimatedDelivery: string;
  deliveryAddress: string;
  carrier: string;
  trackingSteps: TrackingStep[];
}

interface TrackingStep {
  id: number;
  status: string;
  location: string;
  date: string;
  time: string;
  completed: boolean;
}

interface UserProfile {
  name: string;
  handle: string;
  email: string;
  bio: string;
  avatar?: string;
  phone: string;
  address: string;
  cred: number; 
  pageRating: number;
  followers: number;
  following: number;
  isPublicCloset: boolean;
  savedCards: SavedCard[];
  stylePreferences: string[];
}

interface SavedCard {
  last4: string;
  expiry: string;
  type: 'visa' | 'mastercard';
}

interface FashionStyle {
  id: number;
  name: string;
  description: string;
  category: 'streetwear' | 'casual' | 'smart' | 'minimal' | 'bold';
  image: string;
  outfitItems: OutfitItem[];
  rating: number; 
  reviewCount: number; 
  author: string;
  authorImage?: string;
  isFriend?: boolean;
}

interface OutfitItem {
  id: number;
  name: string;
  brand: string;
  image: string;
  price: number;
}

interface Drop {
  id: number;
  brand: string;
  title: string;
  date: string; 
  image: string;
  entered?: boolean; 
}

interface Friend {
  id: number;
  name: string;
  handle: string;
  image: string;
  isOnline: boolean;
  isFollowing?: boolean;
}

interface Notification {
  id: number;
  type: 'order' | 'social' | 'drop' | 'system' | 'gift' | 'request'; 
  title: string;
  message: string;
  time: string;
  read: boolean;
  image?: string; 
  relatedProductId?: number;
}

interface ChatMessage {
  id: number;
  sender: 'me' | 'them' | 'ai';
  text: string;
  time: string;
  productSuggestionId?: number; 
}

interface BrandProfile {
    id: string;
    name: string;
    logo: string;
    banner: string;
    description: string;
    followers: number;
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    location?: string;
    verified?: boolean;
}
// --- Mock Data ---
const BRANDS_LIST: BrandProfile[] = [
    {
        id: 'galxboy',
        name: "GALXBOY",
        logo: "https://mallofafrica.co.za/wp-content/uploads/GALXBOY.jpg",
        banner: "https://www.mimosamall.co.za/wp-content/uploads/2023/10/GalXBoy-shopfront-1.png",
        description: "Mamelodi's finest. Smart, street, and culturally relevant.",
        followers: 125000,
        website: "galxboy.co.za",
        instagram: "galxboy_sa",
        twitter: "galxboy",
        location: "Pretoria, South Africa",
        verified: true
    },
    {
        id: 'kite',
        name: "KITE",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVOS_GASmBAgBMLjg6qZh77__6ozhO2SR6dw&s", // Placeholder
        banner: "https://media.citizen.co.za/wp-content/uploads/2025/10/Lekau-new-sneaker.jpg", // Placeholder
        description: "Embrace the sky. Premium footwear and apparel by Lekau Sehoana. Built on the story of resilience.",
        followers: 180000,
        website: "kiteshop.co.za",
        instagram: "kite",
        location: "Midrand, South Africa",
        verified: true
    },
    {
        id: 'tshepo',
        name: "TSHEPO JEANS",
        logo: "https://www.tshepo.shop/cdn/shop/files/TSHEPO_square_icon_3b260185-0948-4aa5-aeb0-a330a76153c6.png?v=1755177518", // Placeholder
        banner: "https://media.citizen.co.za/wp-content/uploads/2025/11/Tshepo-and-Maphorisa-Picture-Instagram.jpg", // Placeholder
        description: "A premium lifestyle denim brand. Each pair is a masterpiece, offering the perfect fit for the African body.",
        followers: 95000,
        website: "tshepo.shop",
        instagram: "tshepojeans",
        location: "Victoria Yards, JHB",
        verified: true
    },
    {
        id: 'grade',
        name: "GRADE AFRICA",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6VIsKANF5Dkp-CwsVQGFteC_0FvJGJPyMCQ&s",
        banner: "https://gradeafrica.com/cdn/shop/collections/297CCC53-2A91-4A5A-A07E-36F01D7DC397.jpg?v=1728557892",
        description: "Protect the future. Streetwear for the new generation.",
        followers: 67000,
        website: "gradeafrica.com",
        instagram: "gradeafrica",
        location: "Johannesburg, South Africa",
        verified: true
    },
    {
        id: 'maxhosa',
        name: "MAXHOSA AFRICA",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV3UA2J05Y16-00c8jnqnrhVg9o8h7yb647A&s", // Placeholder
        banner: "https://shore.africa/wp-content/uploads/2025/05/Maxhosa-Africa-1.jpg", // Placeholder
        description: "Luxury knitwear celebrating Xhosa beadwork aesthetics. Global luxury with African heritage.",
        followers: 350000,
        website: "maxhosa.africa",
        instagram: "maxhosa",
        location: "JHB & Cape Town",
        verified: true
    },
    {
        id: 'sol sol',
        name: "SOL SOL",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqpSm6q1ArdjUVsx1oyAt4ZWxB6_Jeystt1w&s",
        banner: "https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2017%2F08%2Fsol-sol-2018-spring-summer-lookbook-0.jpg?fit=max&cbr=1&q=90&w=750&h=500",
        description: "Sol Sol Denim trucker jacket is a boxy silhouette ",
        followers: 55000,
        website: "orphanstreetclothingshop.com",
        instagram: "sol sol",
        location: "Cape Town, South Africa",
        verified: true
    },
    {
        id: 'thebemagugu',
        name: "THEBE MAGUGU",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnbkvNKRuZE8f35FGF4PV3rv4HjZ1TWEpPQQ&s",
        banner: "https://wwd.com/wp-content/uploads/2024/05/10-Thebe-Magugu-Team.jpg?crop=0px%2C18px%2C2000px%2C1119px&resize=1000%2C563",
        description: "Luxury South African fashion brand. Exploring history and culture through modern design.",
        followers: 205000,
        website: "thebemagugu.com",
        instagram: "thebemagugu",
        location: "Johannesburg & Paris",
        verified: true
    },
    {
        id: 'bathu',
        name: "BATHU",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS18LyMfh5LlSeovSSoGDMwzT7NH3B6Ug5GiQ&s", // Placeholder
        banner: "https://theinsidersa.co.za/wp-content/uploads/2021/09/Vodacom-Bathu-3-1024x512.jpg", // Placeholder
        description: "Walk your journey. The leading South African sneaker brand telling the township story.",
        followers: 400000,
        website: "bathu.co.za",
        instagram: "bathu_sa",
        location: "South Africa",
        verified: true
    }
];

const PRODUCTS: Product[] = [
  { 
    id: 1, 
    brand: "GALXBOY", 
    name: "Protea Bowling Shirt", 
    price: 450, 
    category: "Tops", 
    style: 'streetwear', 
    image: "https://galxboy.co.za/cdn/shop/files/Bowling-shirt-1.jpg?v=1762431748&width=800",
    images: [
        "https://galxboy.co.za/cdn/shop/files/Bowling-shirt-1.jpg?v=1762431748&width=800",
        "https://galxboy.co.za/cdn/shop/files/Bowling-shirt-1---back.jpg?v=1762431761&width=800"
    ],
    colors: ["#000000", "#FFFFFF", "#FF0000"], 
    materials: "100% Rayon Viscose. Lightweight and breathable.",
    care: "Cold hand wash. Do not tumble dry. Cool iron.",
    description: "The Protea Bowling Shirt features a relaxed fit with an open collar, showcasing the iconic South African flower in a bold streetwear print.", 
    condition: 'new' 
  },
  { 
    id: 2, 
    brand: "GRADE AFRICA", 
    name: "Protectors of Future Varsity", 
    price: 1999, 
    category: "Jackets", 
    style: 'streetwear', 
    image: "https://gradeafrica.com/cdn/shop/files/F7F08A0B-D466-4CB7-9AA4-0A76622DFF38.png?v=1698697384&width=823",
    images: [
        "https://gradeafrica.com/cdn/shop/files/F7F08A0B-D466-4CB7-9AA4-0A76622DFF38.png?v=1698697384&width=823",
        "https://gradeafrica.com/cdn/shop/files/FE8D7771-E12E-4BAB-ADD5-E4D134ED6D3A.png?v=1698697384&width=823"
    ],
    colors: ["#000000", "#FFFFFF"], 
    materials: "Wool body with PU leather sleeves.",
    care: "Dry clean only.",
    description: "A statement piece for the new generation. This varsity jacket features 'Protectors of the Future' embroidery and chenille patches.", 
    condition: 'new' 
  },
  { 
    id: 3, 
    brand: "TSHEPO JEANS", 
    name: "Checkered Knit Polo", 
    price: 1800, 
    category: "Tops", 
    style: 'smart', 
    image: "https://www.tshepo.shop/cdn/shop/files/CheckeredPolo_01_a387535e-11bc-47ab-8d39-f29e8ba69faa.jpg?v=1762348069&width=3000",
    images: [
        "https://www.tshepo.shop/cdn/shop/files/CheckeredPolo_01_a387535e-11bc-47ab-8d39-f29e8ba69faa.jpg?v=1762348069&width=3000",
        "https://www.tshepo.shop/cdn/shop/files/CheckeredPolo_02_37a9a2e1-9c1e-482d-a20f-74fcc5702c4d.jpg?v=1762348069&width=3000"
    ],
    colors: ["#000080", "#FFFFFF"], 
    materials: "100% Cotton Knit.",
    care: "Cold wash. Dry flat to maintain shape.",
    description: "Classic heritage meets modern knitwear. This checkered polo features the Tshepo crown logo subtly woven into the pattern.", 
    condition: 'new' 
  },
  { 
    id: 4, 
    brand: "BATHU", 
    name: "Elev8 - Nude", 
    price: 1799, 
    category: "Shoes", 
    style: 'streetwear', 
    image: "https://www.bathu.co.za/cdn/shop/files/elev8v3.jpg?v=1758643401",
    images: [
        "https://www.bathu.co.za/cdn/shop/files/elev8v3.jpg?v=1758643401",
        "https://www.bathu.co.za/cdn/shop/files/elev8v7.jpg?v=1758643401"
    ],
    colors: ["#E5C6A0", "#FFFFFF"], 
    materials: "Premium Suede and Tech Mesh Upper.",
    care: "Wipe with damp cloth. Use suede protector.",
    description: "Elevate your journey. The Elev8 sneaker combines futuristic silhouette with the Bathu story of walking your journey.", 
    condition: 'new' 
  },
  { 
    id: 5, 
    brand: "THEBE MAGUGU", 
    name: "Girl Seeks Girl Bohemia", 
    price: 16550, 
    category: "Tops", 
    style: 'high_fashion', 
    image: "https://images.ctfassets.net/jc4tugmrgmqg/5Qgc3SeNfpOR9wkRyRlecE/5f8d318dde594ccf742132451b917f20/25_07_17_TM_Catalog0945-80.jpg?fm=webp&h=2880",
    images: [
        "https://images.ctfassets.net/jc4tugmrgmqg/5Qgc3SeNfpOR9wkRyRlecE/5f8d318dde594ccf742132451b917f20/25_07_17_TM_Catalog0945-80.jpg?fm=webp&h=2880",
        "https://images.ctfassets.net/jc4tugmrgmqg/1B5iZytZIJyEE9jMHuNTdI/2521aa09ed8da7839f5935d87bf2ed8b/MG-2-80.jpg?fm=webp&h=2880"
    ],
    colors: ["#FF0000", "#000000"], 
    materials: "Silk Crepe de Chine.",
    care: "Professional Dry Clean Only.",
    description: "From the 'Girl Seeks Girl' collection. A masterpiece of ruffled bohemian design, exploring feminine strength and vulnerability.", 
    condition: 'new' 
  },
  { 
    id: 6, 
    brand: "MAXHOSA AFRICA", 
    name: "MLTP15.1 - Ladies Top", 
    price: 15000, 
    category: "Tops", 
    style: 'high_fashion', 
    image: "https://maxhosa.africa/cdn/shop/files/Ladiesboatneckflaredlongsleevetop1_Front_7bacb895-9bca-453f-be7e-76a043163599.jpg?v=1723805568&width=5660",
    images: [
        "https://maxhosa.africa/cdn/shop/files/Ladiesboatneckflaredlongsleevetop1_Front_7bacb895-9bca-453f-be7e-76a043163599.jpg?v=1723805568&width=5660"
    ],
    colors: ["#000000", "#FFFFFF", "#A52A2A"], 
    materials: "Signature Merino Wool & Mohair.",
    care: "Store folded. Dry clean only.",
    description: "A stunning boat neck flared top featuring the iconic Maxhosa beadwork-inspired patterns. A true collector's piece.", 
    condition: 'new' 
  },
  // Added KITE and BROKE to keep the grid balanced (8 items)
  { 
    id: 7, 
    brand: "KITE", 
    name: "Kite Runners Black", 
    price: 1299, 
    category: "Shoes", 
    style: 'streetwear', 
    image: "https://flykite.co.za/wp-content/uploads/2025/09/black-runners-1-800x800.png", // Placeholder until link provided
    images: ["https://flykite.co.za/wp-content/uploads/2025/09/black-runners-1-800x800.png", 
    "https://flykite.co.za/wp-content/uploads/2025/09/Off-white-runners-1-800x800.png"  
      
    ],
    colors: ["#FFFFFF", "#000000", "#FF0000"], 
    materials: "Premium PU Leather.",
    care: "Wipe clean.",
    description: "The sneaker that started a movement. Bold design meets everyday comfort.", 
    condition: 'new' 
  },
  { 
    id: 8, 
    brand: "SOL SOL", 
    name: " Denim Trucker", 
    price: 1700, 
    category: "Jacket", 
    style: 'vintage', 
    image: "https://orphanstreetclothingshop.com/cdn/shop/products/OSC10210NCR_1024x1024@2x.jpg?v=1667459063", // Placeholder until link provided
    images: ["https://orphanstreetclothingshop.com/cdn/shop/products/OSC10210NCR_1024x1024@2x.jpg?v=1667459063",
      "https://orphanstreetclothingshop.com/cdn/shop/products/MG_6125_1024x1024@2x.jpg?v=1667459062", "https://orphanstreetclothingshop.com/cdn/shop/products/MG_6126_1024x1024@2x.jpg?v=1667459063", "https://orphanstreetclothingshop.com/cdn/shop/products/MG_6127_1024x1024@2x.jpg?v=1667459062"
    ],
    colors: ["#000000", "#FFFFFF"], 
    materials: "Denim",
    care: "Cold wash.",
    description: "Sol Sol Denim trucker jacket is a boxy silhouette for a stylish feel perfect for layering or wearing over a T-shirt/Vest", 
    condition: 'new' 
  }
];


const FRIENDS: Friend[] = [
  { id: 1, name: "Thabo M", handle: "@thabo_drip", image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=200&auto=format&fit=crop", isOnline: true, isFollowing: false },
  { id: 2, name: "Lerato K", handle: "@lerato_styles", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop", isOnline: false, isFollowing: true },
  { id: 3, name: "Sipho J", handle: "@sipho_sneaks", image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=200&auto=format&fit=crop", isOnline: true, isFollowing: false },
];

const COMMUNITY_POSTS: FashionStyle[] = [
  { id: 101, name: "Bowling Club Fit", description: "This Galxboy shirt is a summer essential 🇿🇦", category: "streetwear", image: PRODUCTS[0].image, outfitItems: [{ id: 1, name: "Protea Bowling Shirt", brand: "GALXBOY", image: PRODUCTS[0].image, price: 450 }], rating: 4.8, reviewCount: 42, author: "@thabo_drip", authorImage: FRIENDS[0].image, isFriend: true },
  { id: 102, name: "Varsity Vibes", description: "Grade Africa never misses with the jackets.", category: "casual", image: PRODUCTS[1].image, outfitItems: [{ id: 2, name: "Protectors of Future Varsity", brand: "GRADE AFRICA", image: PRODUCTS[1].image, price: 1999 }], rating: 4.9, reviewCount: 28, author: "@lerato_styles", authorImage: FRIENDS[1].image, isFriend: true }
];

const FASHION_STYLES: FashionStyle[] = [
  { id: 1, name: "Pink", description: "Bold colors meet urban functionality.", category: "streetwear", image: "https://www.bathu.co.za/cdn/shop/files/BathuShirts0227-POST_1_640x_crop_center.jpg?v=1764941347", outfitItems: [{ id: 1, name: "OG Puffer Jacket V2", brand: "GALXBOY", image: PRODUCTS[0].image, price: 3500 }, { id: 7, name: "Rebel Cargo Pants", brand: "SOL SOL", image: PRODUCTS[5].image, price: 1400 }], rating: 4.9, reviewCount: 124, author: "@tshepo_m" },
  { id: 2, name: "Minimal", description: "Clean lines and neutral tones.", category: "minimal", image: "https://www.unseengrail.com/cdn/shop/files/12_5e1ee6b4-70cb-499f-9555-2c851bbc6256.png?v=1736765757&width=990", outfitItems: [{ id: 4, name: "Zuluboy Graphic Tee", brand: "GRADE AFRICA", image: PRODUCTS[3].image, price: 699 }], rating: 4.7, reviewCount: 89, author: "@ct_minimalist" }
];

const DROPS: Drop[] = [
  { id: 1, brand: "GALXBOY", title: "Summer Flowers", date: "2024-12-15T10:00:00", image: PRODUCTS[0].image, entered: false },
  { id: 2, brand: "TSHEPO", title: "Denim & Knit", date: "2024-12-20T12:00:00", image: PRODUCTS[2].image, entered: false }
];

const NOTIFICATIONS_DATA: Notification[] = [
  { id: 1, type: 'gift', title: 'Gift Received', message: 'Jacob bought you a Galxboy Shirt! 🎁', time: '10m ago', read: false, image: PRODUCTS[0].image },
  { id: 2, type: 'request', title: 'Buy Request', message: 'Lerato wants the Bathu Elev8. 🥺', time: '1h ago', read: false, image: PRODUCTS[3].image, relatedProductId: 4 },
  { id: 3, type: 'order', title: 'Order Shipped', message: 'Your order #ORD-88321 is on its way.', time: '2h ago', read: true },
  { id: 4, type: 'social', title: 'New Follower', message: '@thabo_drip started following you.', time: '5h ago', read: true },
];


const TRACKING_STEPS: TrackingStep[] = [
  { id: 1, status: 'Order Placed', location: 'Online Store', date: 'Mar 15', time: '10:30 AM', completed: true },
  { id: 2, status: 'Processing', location: 'Cape Town Warehouse', date: 'Mar 16', time: '2:15 PM', completed: true },
  { id: 3, status: 'Shipped', location: 'Cape Town Depot', date: 'Mar 17', time: '9:45 AM', completed: true },
  { id: 4, status: 'In Transit', location: 'Johannesburg Hub', date: 'Mar 18', time: '3:30 PM', completed: true },
  { id: 5, status: 'Out for Delivery', location: 'Your Area', date: 'Mar 19', time: '8:00 AM', completed: false },
  { id: 6, status: 'Delivered', location: 'Your Address', date: 'Mar 19', time: '2:00 PM', completed: false },
];

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, sender: 'them', text: 'Yooo! That new drop is crazy 🔥', time: '10:02 AM' },
  { id: 2, sender: 'me', text: 'I know right? Trying to cop the puffer.', time: '10:05 AM' },
  { id: 3, sender: 'them', text: 'Let me know if you get it.', time: '10:06 AM' },
];

// --- Custom Components ---

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button = ({ children, onClick, variant = 'primary', className = '', fullWidth = false, disabled = false, type = 'button' }: ButtonProps) => {
  const baseStyle = "py-4 px-6 rounded-full font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed border";
  const variants = {
    primary: "bg-white text-black border-white hover:bg-gray-200", 
    secondary: "bg-black border-white text-white hover:bg-white/10",
    outline: "bg-transparent border-white/50 text-white hover:border-white hover:bg-white/5",
    danger: "bg-transparent border-white text-white hover:bg-white hover:text-black", 
    success: "bg-white text-black border-white"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Toast = ({ message, isVisible, onClose }: { message: string, isVisible: boolean, onClose: () => void }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom fade-in duration-300 w-max max-w-[90%] pointer-events-none">
      <div className="bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm border border-white">
        <CheckCircle size={18} className="text-white" />
        {message}
      </div>
    </div>
  );
};

const TopBar = ({ title, showCart = true, onCartClick, onBellClick, unreadCount = 0, cartCount = 0 }: { title: React.ReactNode; showCart?: boolean; onCartClick: () => void; onBellClick?: () => void; unreadCount?: number; cartCount?: number; }) => (
  <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-white/10">
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center gap-2">
        {typeof title === 'string' ? <h1 className="text-xl font-black tracking-tighter text-white">{title}</h1> : title}
      </div>
      <div className="flex items-center gap-3">
        {onBellClick && (
          <button onClick={onBellClick} className="relative w-10 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full border-2 border-black text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>}
          </button>
        )}
        {showCart && (
          <button onClick={onCartClick} className="relative w-10 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-white text-black rounded-full border-2 border-black text-[10px] font-bold flex items-center justify-center">{cartCount}</span>}
          </button>
        )}
      </div>
    </div>
  </header>
);

const RatingStars = ({ rating, count, onRate }: { rating: number, count?: number, onRate?: (rating: number) => void }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} onClick={(e) => { e.stopPropagation(); onRate?.(star); }}>
        <Star size={14} className={star <= Math.round(rating) ? "fill-white text-white" : "text-white/30"} />
      </button>
    ))}
    {count !== undefined && <span className="text-xs text-white/50 ml-1">({count})</span>}
  </div>
);

// --- Modals & Components ---

const ScoopAIModal = ({ isOpen, onClose, contextProduct, onSelectProduct }: { isOpen: boolean, onClose: () => void, contextProduct?: Product | null, onSelectProduct: (p: Product) => void }) => {
    const [input, setInput] = useState('');
    const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && aiMessages.length === 0) {
            const initialMsg: ChatMessage = {
                id: Date.now(),
                sender: 'ai',
                text: contextProduct 
                    ? `I see you're looking at the ${contextProduct.name}. Want some styling tips for it? ✨`
                    : "Yo! I'm your Scoop AI stylist. Need help finding a fit or checking trends?",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setAiMessages([initialMsg]);
        }
    }, [isOpen, contextProduct]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiMessages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now(),
            sender: 'me',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setAiMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const productContextString = PRODUCTS.map(p => `${p.id}: ${p.brand} ${p.name} (${p.category})`).join(', ');

        const systemPrompt = `You are "Scoop AI", a trendy fashion stylist for a South African streetwear app called Scoop. 
        You speak in a cool, casual tone, using occasional ZA slang (like 'lekker', 'drip', 'fit', 'bra', 'yebo'). 
        Keep responses concise (under 50 words usually).
        
        Here is the store inventory (ID: Name): ${productContextString}.
        
        IMPORTANT: If you recommend a specific product from the inventory, you MUST include its ID in brackets at the end of the sentence like this: [PRODUCT:1] or [PRODUCT:4].
        Do not make up IDs. Only use the ones provided.
        
        ${contextProduct ? `The user is currently looking at this product: ${contextProduct.brand} ${contextProduct.name} (${contextProduct.style}). Suggest outfits that work with this specific item.` : ''}`;

        const responseText = await callGeminiChat(input, systemPrompt);

        // Parse product ID from response
        const productMatch = responseText.match(/\[PRODUCT:(\d+)\]/);
        const productId = productMatch ? parseInt(productMatch[1]) : undefined;
        const cleanText = responseText.replace(/\[PRODUCT:\d+\]/g, '').trim();

        const aiMsg: ChatMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            text: cleanText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            productSuggestionId: productId
        };

        setAiMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[96] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-purple-400" />
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Scoop AI Stylist</h2>
                </div>
                <button onClick={onClose}><X size={24} className="text-white"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiMessages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 ${
                            msg.sender === 'me' 
                                ? 'bg-white text-black rounded-tr-none' 
                                : 'bg-gradient-to-br from-purple-900/50 to-black border border-purple-500/30 text-white rounded-tl-none'
                        }`}>
                            {msg.sender === 'ai' && <Sparkles size={12} className="text-purple-400 mb-1" />}
                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                        </div>
                        
                        {/* Render Product Card if suggestion exists */}
                        {msg.productSuggestionId && !!PRODUCTS.find(p => p.id === msg.productSuggestionId) && (
                            <div className="mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden animate-in slide-in-from-bottom-2">
                                {(() => {
                                    const p = PRODUCTS.find(prod => prod.id === msg.productSuggestionId)!;
                                    return (
                                        <>
                                            <img src={p.image} className="w-full h-32 object-cover grayscale" />
                                            <div className="p-3">
                                                <p className="text-[10px] text-white/50 uppercase font-bold">{p.brand}</p>
                                                <p className="text-white font-bold text-sm truncate">{p.name}</p>
                                                <div className="flex gap-2 mt-3">
                                                    <button onClick={() => { onClose(); onSelectProduct(p); }} className="flex-1 bg-white text-black text-xs font-bold py-1.5 rounded-lg">View</button>
                                                    <button onClick={() => { /* Add to cart logic */ onClose(); onSelectProduct(p); }} className="flex-1 border border-white/20 text-white text-xs font-bold py-1.5 rounded-lg">Add</button>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 rounded-tl-none flex gap-2 items-center">
                            <Loader2 size={16} className="text-purple-400 animate-spin" />
                            <span className="text-white/50 text-xs">Cooking up a fit...</span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <div className="p-4 border-t border-white/10 bg-black">
                <div className="flex items-center gap-2 bg-zinc-900 rounded-full px-2 py-2 border border-white/10 focus-within:border-purple-500/50 transition-colors">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for styling tips..." 
                        className="flex-1 bg-transparent text-white placeholder-white/40 outline-none h-10 px-4"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const StoryModal = ({ story, isOpen, onClose }: { story: Story | null, isOpen: boolean, onClose: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(timer);
    } else {
      setProgress(0);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !story) return null;

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col animate-in zoom-in duration-300">
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-8 flex gap-1">
        <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="relative flex-1">
        <img src={story.image} className="w-full h-full object-cover" alt={story.title} />
        <div className="absolute top-8 right-4 z-20">
          <button onClick={onClose} className="text-white"><X size={24}/></button>
        </div>
        <div className="absolute top-8 left-4 z-20 flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/40" />
           <span className="text-white font-bold text-sm">{story.title}</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-8 pt-24">
           <div className="flex items-center gap-4">
              <input type="text" placeholder="Send message..." className="flex-1 bg-transparent border border-white/50 rounded-full px-4 py-3 text-white placeholder-white/70 outline-none focus:border-white" />
              <button className="text-white"><Heart size={28} /></button>
              <button className="text-white"><Send size={28} /></button>
           </div>
        </div>
      </div>
    </div>
  );
};

const ChatModal = ({ isOpen, onClose, user, messages, onSendMessage }: { isOpen: boolean, onClose: () => void, user: any, messages: ChatMessage[], onSendMessage: (text: string) => void }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { if(isOpen) scrollToBottom(); }, [messages, isOpen]);
    if (!isOpen || !user) return null;
    return (
        <div className="absolute inset-0 z-[95] bg-black flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-black/95">
                <button onClick={onClose}><ArrowLeft className="text-white" /></button>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10"><img src={user.image} className="w-full h-full object-cover" alt="User" /></div>
                <div className="flex-1"><h3 className="text-white font-bold">{user.name}</h3><p className="text-white/50 text-xs">{user.isOnline ? 'Online' : 'Offline'}</p></div>
                <button className="text-white"><Settings size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl p-3 ${msg.sender === 'me' ? 'bg-white text-black rounded-tr-none' : 'bg-zinc-800 text-white rounded-tl-none border border-white/10'}`}>
                            <p className="text-sm font-medium">{msg.text}</p>
                            <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-black/50 text-right' : 'text-white/40'}`}>{msg.time}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-white/10 bg-black">
                <div className="flex items-center gap-3 bg-zinc-900 rounded-full px-4 py-2 border border-white/10">
                    <button className="text-white/50 hover:text-white"><Plus size={20}/></button>
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) { onSendMessage(input); setInput(''); } }} placeholder="Message..." className="flex-1 bg-transparent text-white placeholder-white/40 outline-none h-10" />
                    {input.trim() ? <button onClick={() => { onSendMessage(input); setInput(''); }} className="text-white bg-blue-600 rounded-full p-2"><Send size={16}/></button> : <button className="text-white/50 hover:text-white"><Mic size={20}/></button>}
                </div>
            </div>
        </div>
    );
};

const OtherUserProfileModal = ({ handle, isOpen, onClose, onOpenChat, isFollowing, onToggleFollow }: { handle: string | null, isOpen: boolean, onClose: () => void, onOpenChat: (user: any) => void, isFollowing: boolean, onToggleFollow: () => void }) => {
  if (!isOpen || !handle) return null;
  const mockUser = FRIENDS.find(f => f.handle === handle) || { name: 'User', handle: handle, image: '', isOnline: false };
  return (
    <div className="absolute inset-0 z-[90] bg-black flex flex-col animate-in slide-in-from-right duration-300">
       <div className="p-4 flex items-center gap-4 border-b border-white/10 bg-black/95 sticky top-0"><button onClick={onClose}><ArrowLeft className="text-white" /></button><span className="text-white font-bold text-lg">{handle}</span></div>
       <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-6 mb-8">
             <div className="w-20 h-20 rounded-full bg-white/10 overflow-hidden border border-white/20">{mockUser.image ? <img src={mockUser.image} className="w-full h-full object-cover" alt={mockUser.name} /> : <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">{mockUser.name[0]}</div>}</div>
             <div className="flex-1 flex justify-around"><div className="text-center"><span className="block text-white font-bold text-lg">124</span><span className="text-xs text-white/50">Posts</span></div><div className="text-center"><span className="block text-white font-bold text-lg">1.2k</span><span className="text-xs text-white/50">Followers</span></div><div className="text-center"><span className="block text-white font-bold text-lg">450</span><span className="text-xs text-white/50">Following</span></div></div>
          </div>
          <p className="text-white font-bold text-lg mb-1">{mockUser.name}</p><p className="text-white/60 text-sm mb-6">Streetwear enthusiast. CPT based.</p>
          <div className="flex gap-3 mb-8"><button onClick={onToggleFollow} className={`flex-1 font-bold py-2 rounded-lg transition-colors ${isFollowing ? 'bg-transparent border border-white/20 text-white' : 'bg-white text-black'}`}>{isFollowing ? 'Following' : 'Follow'}</button><button onClick={() => onOpenChat(mockUser)} className="flex-1 border border-white/20 text-white font-bold py-2 rounded-lg hover:bg-white/5">Message</button></div>
          <div className="grid grid-cols-3 gap-1">{[1,2,3,4,5,6].map(i => (<div key={i} className="aspect-square bg-black border border-white/10"><img src={`https://source.unsplash.com/random/300x300?fashion&sig=${i}`} className="w-full h-full object-cover grayscale" alt="Post" /></div>))}</div>
       </div>
    </div>
  );
};

const BrandProfileModal = ({ 
    brand, 
    isOpen, 
    onClose, 
    onSelectProduct, 
    onEnterRaffle 
}: { 
    brand: string | null, 
    isOpen: boolean, 
    onClose: () => void, 
    onSelectProduct: (p: Product) => void, 
    onEnterRaffle: () => void 
}) => {
    const [view, setView] = useState<'catalog' | 'drops'>('catalog');
    const [isFollowing, setIsFollowing] = useState(false);

    if (!isOpen || !brand) return null;

    const brandInfo = BRANDS_LIST.find(b => b.name === brand) || { 
        id: 'unknown', 
        name: brand, 
        logo: "", 
        banner: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80", 
        description: "Official Brand Page", 
        followers: 0,
        verified: false
    };
    
    const brandProducts = PRODUCTS.filter(p => p.brand === brand);
    const brandDrops = DROPS.filter(d => d.brand === brand);

    return (
        <div className="absolute inset-0 z-[90] bg-black flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header / Banner */}
            <div className="relative h-48 shrink-0">
                <img src={brandInfo.banner} className="w-full h-full object-cover opacity-80" alt="Banner" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                {/* Back Button */}
                <button onClick={onClose} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md hover:bg-black transition-colors z-20">
                    <ArrowLeft size={20}/>
                </button>
            </div>

            {/* Profile Info Section */}
            <div className="px-6 relative -mt-12 flex flex-col items-start pb-4">
                {/* Logo & Follow Button Row */}
                <div className="flex justify-between items-end w-full mb-3">
                    <div className="w-24 h-24 rounded-2xl bg-black p-1 shadow-2xl relative z-10">
                        <div className="w-full h-full rounded-xl overflow-hidden border border-white/20 relative bg-zinc-900">
                            {brandInfo.logo ? (
                                <img src={brandInfo.logo} className="w-full h-full object-cover" alt="Logo"/>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl">
                                    {brand.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${isFollowing ? 'bg-transparent border border-white/30 text-white' : 'bg-white text-black'}`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>

                {/* Name & Badge */}
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-black text-white tracking-tight">{brand}</h1>
                    {brandInfo.verified && <BadgeCheck size={20} className="text-blue-400 fill-blue-400/20" />}
                </div>

                {/* Location & Website */}
                <div className="flex items-center gap-4 text-white/50 text-xs font-bold mb-4">
                    {brandInfo.location && (
                        <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{brandInfo.location}</span>
                        </div>
                    )}
                    {brandInfo.website && (
                        <a href={`https://${brandInfo.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                            <Link size={12} />
                            <span>{brandInfo.website}</span>
                        </a>
                    )}
                </div>

                {/* Description */}
                <p className="text-white/80 text-sm leading-relaxed mb-4 max-w-sm">
                    {brandInfo.description}
                </p>

                {/* Stats & Socials Row */}
                <div className="flex items-center justify-between w-full border-t border-white/10 pt-4">
                    <div className="text-white">
                        <span className="font-bold text-lg">{brandInfo.followers.toLocaleString()}</span>
                        <span className="text-white/50 text-xs ml-1">Followers</span>
                    </div>
                    
                    <div className="flex gap-4">
                        {brandInfo.instagram && <button className="text-white/60 hover:text-pink-500 transition-colors"><Instagram size={20}/></button>}
                        {brandInfo.twitter && <button className="text-white/60 hover:text-blue-400 transition-colors"><Twitter size={20}/></button>}
                        {brandInfo.facebook && <button className="text-white/60 hover:text-blue-600 transition-colors"><Facebook size={20}/></button>}
                        {brandInfo.website && <button className="text-white/60 hover:text-white transition-colors"><Globe size={20}/></button>}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 sticky top-0 bg-black z-20">
                <button onClick={() => setView('catalog')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-widest transition-colors ${view === 'catalog' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'}`}>
                    Catalog
                </button>
                <button onClick={() => setView('drops')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-widest transition-colors ${view === 'drops' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'}`}>
                    Drops <span className="bg-white/10 text-[10px] px-1.5 py-0.5 rounded ml-1">{brandDrops.length}</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-black">
                {view === 'catalog' ? (
                    <div className="grid grid-cols-2 gap-4">
                        {brandProducts.map(product => (
                            <div key={product.id} onClick={() => onSelectProduct(product)} className="group cursor-pointer">
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 mb-2 relative">
                                    <img src={product.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={product.name}/>
                                    {product.condition === 'pre-owned' && (
                                        <div className="absolute top-2 left-2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded-full">RESALE</div>
                                    )}
                                </div>
                                <h4 className="text-white font-bold text-sm truncate">{product.name}</h4>
                                <p className="text-white/50 text-xs">R {product.price}</p>
                            </div>
                        ))}
                        {brandProducts.length === 0 && <p className="text-white/40 col-span-2 text-center mt-10">No items currently in stock.</p>}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {brandDrops.map(drop => (
                            <div key={drop.id} className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                                <img src={drop.image} className="w-full h-full object-cover opacity-60" alt={drop.title}/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex flex-col justify-end">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Flame size={16} className="text-orange-500 fill-orange-500" />
                                        <span className="text-orange-500 font-bold text-xs uppercase tracking-widest">Dropping Soon</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white">{drop.title}</h3>
                                    <p className="text-white/60 mb-4">{new Date(drop.date).toLocaleDateString()}</p>
                                    <button onClick={onEnterRaffle} className={`font-bold py-3 rounded-xl w-full ${drop.entered ? 'bg-zinc-800 text-white/50' : 'bg-white text-black'}`}>
                                        {drop.entered ? 'Raffle Entered' : 'Enter Raffle'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {brandDrops.length === 0 && <p className="text-white/40 text-center mt-10">No upcoming drops announced.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

const LookbookModal = ({ style, isOpen, onClose, onSelectProduct }: { style: FashionStyle | null, isOpen: boolean, onClose: () => void, onSelectProduct: (product: Product) => void }) => {
  if (!isOpen || !style) return null;
  return (
    <div className="absolute inset-0 z-[80] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/95 sticky top-0"><h2 className="text-xl font-bold text-white">Shop the Look</h2><button onClick={onClose}><X size={24} className="text-white"/></button></div>
      <div className="flex-1 overflow-y-auto p-4"><div className="aspect-square w-full rounded-2xl overflow-hidden mb-6 border border-white/10"><img src={style.image} className="w-full h-full object-cover grayscale" alt={style.name} /><div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent"><h3 className="text-2xl font-black text-white">{style.name}</h3><p className="text-white/60">Styled by {style.author}</p></div></div><h3 className="text-sm font-bold text-white/50 mb-4 uppercase tracking-widest">Items in this fit</h3><div className="space-y-4">{style.outfitItems.map(item => { const fullProduct = PRODUCTS.find(p => p.name === item.name || p.id === item.id) || { ...item, description: "Item details not found", category: "Unknown", condition: 'new' } as Product; return (<div key={item.id} className="flex gap-4 p-4 rounded-xl bg-zinc-900 border border-white/10 items-center"><img src={item.image} className="w-16 h-16 rounded-lg object-cover grayscale" alt={item.name} /><div className="flex-1"><h4 className="font-bold text-white text-sm">{item.name}</h4><p className="text-white/50 text-xs">{item.brand}</p><p className="text-white font-bold mt-1">R {item.price}</p></div><Button variant="secondary" className="h-10 px-4 text-xs" onClick={() => { onClose(); onSelectProduct(fullProduct); }}>View</Button></div>); })}</div></div>
    </div>
  );
};

const NotificationPanel = ({ isOpen, onClose, notifications, onAction }: { isOpen: boolean, onClose: () => void, notifications: Notification[], onAction: (notif: Notification) => void }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[80] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/95 backdrop-blur-md sticky top-0"><h2 className="text-2xl font-black text-white">Notifications</h2><button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white"><X size={20} /></button></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">{notifications.length === 0 ? (<div className="flex flex-col items-center justify-center h-full opacity-50"><Bell size={48} className="mb-4 text-white"/><p className="text-white">No notifications yet</p></div>) : (notifications.map(notif => (<div key={notif.id} className={`p-4 rounded-xl border border-white/10 ${notif.read ? 'bg-transparent' : 'bg-white/5'}`}><div className="flex items-start gap-4"><div className="relative"><div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 overflow-hidden border border-white/10">{notif.image ? <img src={notif.image} className="w-full h-full object-cover grayscale" alt="Notif" /> : notif.type === 'gift' ? <Gift size={20} /> : notif.type === 'request' ? <HandCoins size={20} /> : <MessageCircle size={20} />}</div>{notif.type === 'gift' && <div className="absolute -bottom-1 -right-1 bg-white text-black p-0.5 rounded-full"><Gift size={10}/></div>}</div><div className="flex-1"><h4 className="font-bold text-white text-sm">{notif.title}</h4><p className="text-white/60 text-xs mt-1 leading-relaxed">{notif.message}</p><p className="text-white/30 text-[10px] mt-2">{notif.time}</p>{notif.type === 'request' && notif.relatedProductId && (<div className="mt-3"><Button variant="primary" className="py-2 px-4 text-xs h-8 w-full" onClick={() => onAction(notif)}>Buy Now</Button></div>)}</div></div></div>)))}</div>
    </div>
  );
};

const AuthScreen = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = () => { if (!email || !password || (!isLogin && !name)) { alert("Please fill in all fields"); return; } setLoading(true); setTimeout(() => { setLoading(false); const profile: UserProfile = { name: name || 'Scoop User', handle: `@${name.toLowerCase().replace(/\s/g, '_')}` || '@user', email: email, bio: 'Just joined Scoop!', phone: '', address: '', cred: 0, pageRating: 5.0, followers: 0, following: 0, isPublicCloset: true, savedCards: [], stylePreferences: [] }; onComplete(profile); }, 1500); };
  return (
      <div className="flex-1 bg-black flex flex-col justify-center p-8 animate-in fade-in duration-500">
          <div className="mb-12 text-center"><h1 className="text-5xl font-black text-white tracking-tighter mb-2">Scoop<span className="text-white/50">.</span></h1><p className="text-white/60">The streets are watching.</p></div>
          <div className="space-y-4">{!isLogin && (<div className="space-y-2"><label className="text-xs font-bold text-white/70 ml-2 uppercase">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-white/20 rounded-xl p-4 text-white outline-none focus:border-white" placeholder="e.g. Neo Kgosana" /></div>)}<div className="space-y-2"><label className="text-xs font-bold text-white/70 ml-2 uppercase">Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-white/20 rounded-xl p-4 text-white outline-none focus:border-white" placeholder="name@example.com" /></div><div className="space-y-2"><label className="text-xs font-bold text-white/70 ml-2 uppercase">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-white/20 rounded-xl p-4 text-white outline-none focus:border-white" placeholder="••••••••" /></div></div>
          <div className="mt-8"><Button fullWidth variant="primary" onClick={handleSubmit} className="h-14 text-lg">{loading ? 'Connecting...' : (isLogin ? 'Sign In' : 'Create Account')}</Button></div><button onClick={() => setIsLogin(!isLogin)} className="mt-6 text-white/50 text-sm font-bold text-center hover:text-white transition-colors">{isLogin ? "New to Scoop? Join the movement." : "Already have an account? Sign In."}</button>
      </div>
  );
};

const StyleOnboarding = ({ onComplete }: { onComplete: (styles: string[]) => void }) => {
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const styles = [{ id: 'streetwear', label: 'Streetwear', icon: Shirt }, { id: 'high_fashion', label: 'High Fashion', icon: Gem }, { id: 'vintage', label: 'Vintage', icon: Watch }, { id: 'minimalist', label: 'Minimalist', icon: Circle }, { id: 'casual', label: 'Casual', icon: Coffee }, { id: 'sportswear', label: 'Sportswear', icon: Trophy }];
    const toggleStyle = (id: string) => { if (selectedStyles.includes(id)) { setSelectedStyles(selectedStyles.filter(s => s !== id)); } else { setSelectedStyles([...selectedStyles, id]); } };
    const handleContinue = () => { setIsCalculating(true); setTimeout(() => { onComplete(selectedStyles); }, 2000); };
    if (isCalculating) { return (<div className="flex-1 bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-500"><Loader2 size={48} className="text-white animate-spin mb-6" /><h2 className="text-2xl font-black text-white mb-2 text-center">Building your feed...</h2><p className="text-white/50 text-center">Our algorithm is curating drops based on your vibe.</p></div>); }
    return (
        <div className="flex-1 bg-black flex flex-col p-8 animate-in fade-in slide-in-from-bottom duration-500"><div className="mt-12 mb-8"><h2 className="text-3xl font-black text-white mb-2">What's your vibe?</h2><p className="text-white/60">Select styles to customize your shop.</p></div><div className="grid grid-cols-2 gap-4 mb-8">{styles.map(style => { const Icon = style.icon; return (<button key={style.id} onClick={() => toggleStyle(style.id)} className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 group ${selectedStyles.includes(style.id) ? 'bg-white border-white text-black scale-105 shadow-xl' : 'bg-zinc-900 border-white/10 text-white/60 hover:bg-zinc-800'}`}><Icon size={28} className="mb-1" /><span className="font-bold text-sm">{style.label}</span>{selectedStyles.includes(style.id) && <div className="absolute top-2 right-2"><Check size={16} /></div>}</button>); })}</div><div className="mt-auto"><Button fullWidth variant="primary" onClick={handleContinue} disabled={selectedStyles.length === 0} className="h-14 text-lg">Continue</Button><p className="text-center text-white/30 text-xs mt-4">You can change this later in settings</p></div></div>
    );
};

const EditProfileModal = ({ isOpen, onClose, profile, onSave }: { isOpen: boolean, onClose: () => void, profile: UserProfile, onSave: (p: UserProfile) => void }) => {
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);
  const handleImageUpload = () => { const mocks = ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop"]; const random = mocks[Math.floor(Math.random() * mocks.length)]; setAvatar(random); };
  if (!isOpen) return null;
  return (
      <div className="absolute inset-0 z-[90] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black"><button onClick={onClose}><X size={24} className="text-white" /></button><h2 className="text-xl font-bold text-white">Edit Profile</h2><button onClick={() => { onSave({ ...profile, name, handle, bio, avatar }); onClose(); }} className="text-white font-bold bg-white/20 px-4 py-2 rounded-full text-sm">Save</button></div>
          <div className="p-6 space-y-6"><div className="flex justify-center"><button onClick={handleImageUpload} className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-dashed border-white/30 flex items-center justify-center relative overflow-hidden group">{avatar ? (<img src={avatar} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />) : (<Camera size={32} className="text-white/50" />)}<div className="absolute inset-0 flex items-center justify-center"><Camera size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" /></div><div className="absolute bottom-0 right-0 bg-white text-black rounded-full p-1"><Plus size={16} /></div></button></div><div className="text-center"><p className="text-xs text-white/30">Tap to change photo</p></div><div className="space-y-2"><label className="text-xs font-bold text-white/50 ml-2 uppercase">Display Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-white/20 rounded-xl p-4 text-white outline-none focus:border-white" /></div><div className="space-y-2"><label className="text-xs font-bold text-white/50 ml-2 uppercase">Handle</label><input type="text" value={handle} onChange={e => setHandle(e.target.value)} className="w-full bg-black border border-white/20 rounded-xl p-4 text-white outline-none focus:border-white" /></div><div className="space-y-2"><label className="text-xs font-bold text-white/50 ml-2 uppercase">Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-black border border-white/20 rounded-xl p-4 text-white outline-none focus:border-white h-24 resize-none" /></div></div>
      </div>
  );
};

const ReturnModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [reason, setReason] = useState('');
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-black rounded-[2rem] border border-white/20 w-full max-w-md p-6"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">Return Item</h3><button onClick={onClose}><X size={20} className="text-white" /></button></div><p className="text-white/60 text-sm mb-6">Select a reason for your return. Items must be unwashed and unworn with tags attached.</p><div className="space-y-3 mb-8">{['Size too small', 'Size too big', 'Defective / Damaged', 'Not as described', 'Changed my mind'].map(r => (<button key={r} onClick={() => setReason(r)} className={`w-full p-4 rounded-xl border text-left text-sm font-bold transition-all ${reason === r ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/20 hover:border-white/50'}`}>{r}</button>))}</div><Button fullWidth variant="primary" disabled={!reason} onClick={() => { alert('Return request submitted!'); onClose(); }}>Submit Request</Button></div>
    </div>
  );
};

const PoliciesModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [activePolicy, setActivePolicy] = useState<'returns' | 'terms' | 'privacy'>('returns');
  if (!isOpen) return null;
  const content = { returns: "We offer a 30-day return policy for all items. To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.", terms: "By accessing or using the Scoop app, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.", privacy: "We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share information about you when you use our app." };
  return (
    <div className="absolute inset-0 z-[90] bg-black/95 backdrop-blur-md flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-xl font-bold text-white">Legal & Support</h2><button onClick={onClose}><X size={20} className="text-white" /></button></div><div className="flex border-b border-white/10">{[{ id: 'returns', label: 'Returns' }, { id: 'terms', label: 'Terms' }, { id: 'privacy', label: 'Privacy' }].map(tab => (<button key={tab.id} onClick={() => setActivePolicy(tab.id as any)} className={`flex-1 py-4 text-sm font-bold transition-colors ${activePolicy === tab.id ? 'text-white border-b-2 border-white' : 'text-white/40'}`}>{tab.label}</button>))}</div><div className="flex-1 p-6 overflow-y-auto"><div className="prose prose-invert"><h3 className="text-white font-bold text-lg mb-4">{activePolicy === 'returns' ? 'Return Policy' : activePolicy === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h3><p className="text-white/70 leading-relaxed">{content[activePolicy]}</p><div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3"><HelpCircle size={20} className="text-white shrink-0 mt-1" /><div><p className="text-white font-bold text-sm">Need more help?</p><p className="text-white/50 text-xs">Contact our support team at support@scoop.co.za</p></div></div></div></div>
    </div>
  );
};

const SelectItemModal = ({ isOpen, onClose, orders, onSelect }: { isOpen: boolean, onClose: () => void, orders: Order[], onSelect: (item: CartItem) => void }) => {
  if (!isOpen) return null;
  const allItems = orders.flatMap(o => o.items);
  return (
    <div className="absolute inset-0 z-[95] bg-black/95 backdrop-blur-md flex flex-col justify-end animate-in slide-in-from-bottom duration-300">
      <div className="bg-zinc-900 rounded-t-[2.5rem] border-t border-white/20 max-h-[80vh] flex flex-col"><div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-xl font-bold text-white">Select from Closet</h2><button onClick={onClose}><X size={20} className="text-white"/></button></div><div className="p-6 overflow-y-auto grid grid-cols-2 gap-4">{allItems.length === 0 ? (<p className="col-span-2 text-center text-white/50 py-8">No items found in your closet.</p>) : (allItems.map((item, idx) => (<div key={idx} onClick={() => onSelect(item)} className="bg-black rounded-xl border border-white/10 overflow-hidden cursor-pointer hover:border-white/50 transition-colors"><img src={item.image} className="w-full aspect-square object-cover grayscale" alt={item.name} /><div className="p-3"><p className="text-white font-bold text-sm truncate">{item.name}</p><p className="text-white/50 text-xs">{item.brand}</p></div></div>)))}</div></div>
    </div>
  );
};

const CreationMenu = ({ isOpen, onClose, onAction }: { isOpen: boolean, onClose: () => void, onAction: (action: string) => void }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[80] bg-black/90 backdrop-blur-md flex flex-col justify-end pb-32 animate-in slide-in-from-bottom duration-300">
      <div className="px-6 space-y-4">
        <button onClick={() => onAction('post')} className="w-full bg-zinc-900 border border-white/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors group"><div className="w-12 h-12 rounded-full bg-black border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Image size={24}/></div><div className="text-left"><h3 className="font-bold text-white text-lg">Post Fit Check</h3><p className="text-white/50 text-sm">Share your purchased gear</p></div></button>
        <button onClick={() => onAction('canvas')} className="w-full bg-zinc-900 border border-white/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors group"><div className="w-12 h-12 rounded-full bg-black border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Layers size={24}/></div><div className="text-left"><h3 className="font-bold text-white text-lg">Create Canvas</h3><p className="text-white/50 text-sm">Mix and match items to build a look</p></div></button>
        <button onClick={() => onAction('ai')} className="w-full bg-zinc-900 border border-white/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors group"><div className="w-12 h-12 rounded-full bg-black border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Bot size={24}/></div><div className="text-left"><h3 className="font-bold text-white text-lg">Ask Scoop AI</h3><p className="text-white/50 text-sm">Get fashion advice & styling tips</p></div></button>
        <button onClick={onClose} className="w-full py-4 rounded-full bg-black border border-white/20 text-white font-bold mt-4">Cancel</button>
      </div>
    </div>
  );
};

const ShareModal = ({ product, isOpen, onClose, onGift, onRequest }: { product: Product | null, isOpen: boolean, onClose: () => void, onGift: (friend: Friend) => void, onRequest: (friend: Friend) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
  if (!isOpen || !product) return null;
  const filteredFriends = FRIENDS.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.handle.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div className="absolute inset-0 z-[90] bg-black/95 backdrop-blur-sm flex flex-col justify-end sm:justify-center animate-in fade-in duration-300">
        <div className="bg-zinc-900 w-full sm:w-[90%] sm:max-w-md sm:mx-auto sm:rounded-[2rem] rounded-t-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900 sticky top-0 z-10"><h2 className="text-xl font-bold text-white">Share to...</h2><button onClick={onClose} className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/50 hover:text-white hover:bg-black transition-colors"><X size={18} /></button></div>
            <div className="p-4 bg-black/20 flex gap-4 items-center"><img src={product.image} className="w-16 h-16 rounded-xl object-cover grayscale" alt={product.name} /><div className="flex-1 min-w-0"><p className="text-white font-bold truncate">{product.name}</p><p className="text-white/50 text-xs">{product.brand}</p></div></div>
            <div className="p-6 flex-1 overflow-y-auto"><div className="relative mb-6"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} /><input type="text" placeholder="Search friends" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-white/30 focus:border-white/50 focus:outline-none"/></div><div className="grid grid-cols-4 gap-4 mb-6">{filteredFriends.map(friend => (<button key={friend.id} onClick={() => setSelectedFriend(selectedFriend === friend.id ? null : friend.id)} className="flex flex-col items-center gap-2 group"><div className={`w-14 h-14 rounded-full p-[2px] transition-all ${selectedFriend === friend.id ? 'bg-white scale-110' : 'bg-transparent border border-white/20'}`}><img src={friend.image} className="w-full h-full rounded-full object-cover" alt={friend.name} /></div><span className={`text-[10px] text-center truncate w-full ${selectedFriend === friend.id ? 'text-white font-bold' : 'text-white/50'}`}>{friend.name.split(' ')[0]}</span></button>))}<button className="flex flex-col items-center gap-2 group"><div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-white/10 group-hover:text-white transition-colors"><Share2 size={20} /></div><span className="text-[10px] text-white/50">More</span></button></div>{!selectedFriend && (<div className="space-y-3 opacity-50 pointer-events-none"><button className="w-full p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 text-left"><div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white"><Link size={18}/></div><div><p className="text-white font-bold text-sm">Copy Link</p></div></button><button className="w-full p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 text-left"><div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white"><Plus size={18}/></div><div><p className="text-white font-bold text-sm">Add to Story</p></div></button></div>)}</div>
            <div className="p-6 border-t border-white/10 bg-zinc-900">{!selectedFriend ? (<p className="text-center text-white/50 text-sm">Select a homie to interact</p>) : (<div className="grid grid-cols-2 gap-3"><Button variant="primary" onClick={() => onGift(FRIENDS.find(f => f.id === selectedFriend)!)}><Gift size={16} /> Gift</Button><Button variant="outline" onClick={() => onRequest(FRIENDS.find(f => f.id === selectedFriend)!)}><HandCoins size={16} /> Request</Button></div>)}</div>
        </div>
    </div>
  );
};

const CopOrDropGame = ({ isOpen, onClose, onGameAction }: { isOpen: boolean, onClose: () => void, onGameAction: (action: 'cop' | 'drop', product: Product) => void }) => {
  const [index, setIndex] = useState(0);
  const currentProduct = PRODUCTS[index % PRODUCTS.length];
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[90] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="flex justify-between items-center p-6 bg-black"><button onClick={onClose}><X className="text-white"/></button><h2 className="text-xl font-black text-white">Cop or Drop</h2><div className="w-6"/></div>
      <div className="flex-1 px-6 pb-8 flex flex-col justify-center">
        <div className="relative aspect-[3/4] w-full bg-zinc-900 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"><img src={currentProduct.image} className="w-full h-full object-cover grayscale"/><div className="absolute bottom-0 left-0 w-full p-8 text-center"><h3 className="text-3xl font-black text-white">{currentProduct.brand}</h3><p className="text-white/60">{currentProduct.name}</p></div></div>
        <div className="flex justify-center gap-8 mt-8"><button onClick={() => { onGameAction('drop', currentProduct); setIndex(i=>i+1); }} className="w-20 h-20 rounded-full border-2 border-white/30 flex items-center justify-center text-white"><ThumbsDown size={32}/></button><button onClick={() => { onGameAction('cop', currentProduct); setIndex(i=>i+1); }} className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-all"><Heart size={32} fill="black"/></button></div>
      </div>
    </div>
  );
};

const CreatePostModal = ({ item, isOpen, onClose, onPost }: { item: CartItem | null, isOpen: boolean, onClose: () => void, onPost: (post: any) => void }) => {
  const [caption, setCaption] = useState('');
  if (!isOpen || !item) return null;
  return (
    <div className="absolute inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-black rounded-[2.5rem] border border-white/20 w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">Post to Feed</h3><button onClick={onClose} className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center text-white"><X size={18} /></button></div>
          <div className="mb-6"><img src={item.image} className="w-full aspect-square object-cover rounded-xl grayscale mb-4 border border-white/10" /><textarea placeholder="Say something about your drip..." value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full bg-black border border-white/20 rounded-xl p-4 text-white placeholder-white/40 focus:border-white focus:ring-0 resize-none h-24"/></div>
          <Button fullWidth variant="primary" onClick={() => { onPost({ id: Date.now(), name: "My New Cop", description: caption, category: "streetwear", image: item.image, outfitItems: [{ ...item }], rating: 5, reviewCount: 1, author: "@neo_kg", authorImage: "", isFriend: false }); onClose(); }}>Post Now</Button>
        </div>
      </div>
    </div>
  );
};

const SizeGuideModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [category, setCategory] = useState<'tops' | 'bottoms' | 'shoes'>('tops');

  if (!isOpen) return null;

  // Helper to convert values based on unit state
  // 1 cm = 0.3937 inches
  const cv = (val: number) => {
    if (category === 'shoes') return val; // Don't convert shoe sizes
    return unit === 'cm' ? val : Math.round(val * 0.3937 * 10) / 10;
  };

  const renderTable = () => {
    if (category === 'tops') {
      return (
        <table className="w-full text-left text-sm text-white/80">
          <thead>
            <tr className="border-b border-white/20 text-white/50 text-xs uppercase tracking-wider">
              <th className="py-4 font-bold">Size</th>
              <th className="py-4 font-bold">Chest</th>
              <th className="py-4 font-bold">Length</th>
              <th className="py-4 font-bold">Sleeve</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            <tr><td className="py-4 font-bold text-white">XS</td><td>{cv(96)}</td><td>{cv(68)}</td><td>{cv(62)}</td></tr>
            <tr><td className="py-4 font-bold text-white">S</td><td>{cv(102)}</td><td>{cv(70)}</td><td>{cv(63)}</td></tr>
            <tr><td className="py-4 font-bold text-white">M</td><td>{cv(108)}</td><td>{cv(72)}</td><td>{cv(64)}</td></tr>
            <tr><td className="py-4 font-bold text-white">L</td><td>{cv(114)}</td><td>{cv(74)}</td><td>{cv(65)}</td></tr>
            <tr><td className="py-4 font-bold text-white">XL</td><td>{cv(120)}</td><td>{cv(76)}</td><td>{cv(66)}</td></tr>
            <tr><td className="py-4 font-bold text-white">XXL</td><td>{cv(126)}</td><td>{cv(78)}</td><td>{cv(67)}</td></tr>
          </tbody>
        </table>
      );
    }
    if (category === 'bottoms') {
      return (
        <table className="w-full text-left text-sm text-white/80">
          <thead>
            <tr className="border-b border-white/20 text-white/50 text-xs uppercase tracking-wider">
              <th className="py-4 font-bold">Size</th>
              <th className="py-4 font-bold">Waist</th>
              <th className="py-4 font-bold">Hips</th>
              <th className="py-4 font-bold">Length</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            <tr><td className="py-4 font-bold text-white">30 (S)</td><td>{cv(76)}</td><td>{cv(96)}</td><td>{cv(102)}</td></tr>
            <tr><td className="py-4 font-bold text-white">32 (M)</td><td>{cv(81)}</td><td>{cv(101)}</td><td>{cv(104)}</td></tr>
            <tr><td className="py-4 font-bold text-white">34 (L)</td><td>{cv(86)}</td><td>{cv(106)}</td><td>{cv(106)}</td></tr>
            <tr><td className="py-4 font-bold text-white">36 (XL)</td><td>{cv(91)}</td><td>{cv(111)}</td><td>{cv(108)}</td></tr>
            <tr><td className="py-4 font-bold text-white">38 (XXL)</td><td>{cv(96)}</td><td>{cv(116)}</td><td>{cv(110)}</td></tr>
          </tbody>
        </table>
      );
    }
    if (category === 'shoes') {
      return (
        <table className="w-full text-left text-sm text-white/80">
          <thead>
            <tr className="border-b border-white/20 text-white/50 text-xs uppercase tracking-wider">
              <th className="py-4 font-bold">UK</th>
              <th className="py-4 font-bold">US</th>
              <th className="py-4 font-bold">EU</th>
              <th className="py-4 font-bold">CM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            <tr><td className="py-4 font-bold text-white">6</td><td>7</td><td>40</td><td>25.5</td></tr>
            <tr><td className="py-4 font-bold text-white">7</td><td>8</td><td>41</td><td>26.5</td></tr>
            <tr><td className="py-4 font-bold text-white">8</td><td>9</td><td>42</td><td>27.5</td></tr>
            <tr><td className="py-4 font-bold text-white">9</td><td>10</td><td>43</td><td>28.5</td></tr>
            <tr><td className="py-4 font-bold text-white">10</td><td>11</td><td>44</td><td>29.5</td></tr>
            <tr><td className="py-4 font-bold text-white">11</td><td>12</td><td>45</td><td>30.5</td></tr>
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="absolute inset-0 z-[90] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/95 sticky top-0">
        <h2 className="text-xl font-bold text-white">Size Guide</h2>
        <div className="flex items-center gap-4">
            {/* Unit Toggle */}
            {category !== 'shoes' && (
                <div className="bg-zinc-900 rounded-lg p-1 flex border border-white/10">
                    <button 
                        onClick={() => setUnit('cm')} 
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${unit === 'cm' ? 'bg-white text-black' : 'text-white/50'}`}
                    >
                        CM
                    </button>
                    <button 
                        onClick={() => setUnit('in')} 
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${unit === 'in' ? 'bg-white text-black' : 'text-white/50'}`}
                    >
                        IN
                    </button>
                </div>
            )}
            <button onClick={onClose} className="text-white"><X size={24}/></button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex border-b border-white/10">
        {['tops', 'bottoms', 'shoes'].map((cat) => (
            <button 
                key={cat}
                onClick={() => setCategory(cat as any)}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${category === cat ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white'}`}
            >
                {cat}
            </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderTable()}

        {/* How to Measure Section */}
        <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-white/60"/> 
                How to Measure
            </h3>
            <div className="space-y-4 text-sm text-white/60">
                {category === 'tops' && (
                    <>
                        <p><strong className="text-white">Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                        <p><strong className="text-white">Length:</strong> Measure from the highest point of the shoulder down to the hem.</p>
                    </>
                )}
                {category === 'bottoms' && (
                    <>
                        <p><strong className="text-white">Waist:</strong> Measure around the narrowest part (typically your lower back).</p>
                        <p><strong className="text-white">Hips:</strong> Measure around the fullest part of your hips.</p>
                    </>
                )}
                {category === 'shoes' && (
                    <>
                        <p><strong className="text-white">Foot Length:</strong> Measure from your heel to your longest toe in centimeters.</p>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const OrderTrackingModal = ({ order, isOpen, onClose }: { order: Order | null, isOpen: boolean, onClose: () => void }) => {
  if(!isOpen) return null;
  return <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center"><div className="bg-black p-6 rounded-2xl border border-white"><h3 className="text-white mb-4">Order Tracking</h3><Button onClick={onClose}>Close</Button></div></div>
};
const LiveTryOnCamera = ({ product, isOpen, onClose }: { product: Product | null, isOpen: boolean, onClose: () => void }) => {
  if(!isOpen) return null;
  return <div className="absolute inset-0 z-[80] bg-black flex flex-col"><div className="flex-1 relative"><button onClick={onClose} className="absolute top-12 right-6 text-white"><X/></button><p className="text-white text-center mt-20">Camera Feed Simulator</p></div></div>
};

const DropCard = ({ drop, onEnterRaffle }: { drop: Drop, onEnterRaffle: () => void }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
    useEffect(() => {
      const timer = setInterval(() => {
        const target = new Date("2025-12-31T00:00:00"); 
        const now = new Date();
        const difference = target.getTime() - now.getTime();
        if (difference > 0) {
          setTimeLeft({ days: Math.floor(difference / (1000 * 60 * 60 * 24)), hours: Math.floor((difference / (1000 * 60 * 60)) % 24), mins: Math.floor((difference / 1000 / 60) % 60), secs: Math.floor((difference / 1000) % 60) });
        }
      }, 1000);
      return () => clearInterval(timer);
    }, []);
  
    return (
      <div className="relative w-full aspect-[2/1] rounded-[2rem] overflow-hidden group border border-white/10 cursor-pointer mb-8">
        <img src={drop.image} className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 transition-transform duration-700" alt={drop.title} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute top-6 left-6">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-white fill-white animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-widest border border-white/30 px-2 py-0.5 rounded-full backdrop-blur-sm">Upcoming Drop</span>
          </div>
          <h2 className="text-3xl font-black text-white leading-none">{drop.brand}</h2>
          <p className="text-lg text-white/80">{drop.title}</p>
        </div>
        <div className="absolute bottom-6 left-6">
          <div className="flex gap-4">
            <div className="text-center"><span className="block text-2xl font-black text-white">{timeLeft.days}</span><span className="text-[10px] text-white/50 uppercase font-bold">Days</span></div>
            <div className="text-center"><span className="block text-2xl font-black text-white">{timeLeft.hours}</span><span className="text-[10px] text-white/50 uppercase font-bold">Hrs</span></div>
            <div className="text-center"><span className="block text-2xl font-black text-white">{timeLeft.mins}</span><span className="text-[10px] text-white/50 uppercase font-bold">Mins</span></div>
            <div className="text-center"><span className="block text-2xl font-black text-white">{timeLeft.secs}</span><span className="text-[10px] text-white/50 uppercase font-bold">Secs</span></div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6">
           {drop.entered ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-bold text-sm">
                 <Ticket size={16} /> Entered
              </div>
           ) : (
              <button onClick={onEnterRaffle} className="flex items-center gap-2 px-4 py-2 border border-white bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors font-bold text-sm">
                 <Ticket size={16} /> Enter Raffle (50)
              </button>
           )}
        </div>
      </div>
    );
  };

const VirtualTryOn = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('tops'); // 'tops', 'bottoms', 'accessories'
  
  if (!isOpen) return null;

  const toggleItem = (item: Product) => {
      if (selectedItems.find(i => i.id === item.id)) {
          setSelectedItems(selectedItems.filter(i => i.id !== item.id));
      } else {
          // Logic to replace item of same category (e.g. only one top at a time for simplicity in this demo)
          const otherItems = selectedItems.filter(i => i.category !== item.category);
          setSelectedItems([...otherItems, item]);
      }
  };

  const handleGenerate = async () => {
    if (selectedItems.length === 0) return;
    
    setIsGenerating(true);
    setGeneratedImage(null); // Clear previous

    // Construct a prompt based on selected items
    const itemDescriptions = selectedItems.map(i => `${i.brand} ${i.name}`).join(", ");
    const prompt = `A realistic full body photo of a trendy young person wearing ${itemDescriptions}. Street style, high fashion photography, 8k resolution.`;

    const imageBase64 = await callGeminiImage(prompt);
    
    if (imageBase64) {
        setGeneratedImage(imageBase64);
    } else {
        alert("Sorry, could not generate the try-on image at this time.");
    }
    
    setIsGenerating(false);
  };

  // Filter products for the selector
  const filteredProducts = PRODUCTS.filter(p => {
      if (activeTab === 'tops') return p.category === 'Tops' || p.category === 'Hoodies' || p.category === 'Jackets';
      if (activeTab === 'bottoms') return p.category === 'Bottoms';
      return p.category === 'Accessories';
  });

  return (
    <div className="absolute inset-0 z-[90] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-black/95 backdrop-blur-md z-10 border-b border-white/10">
        <button onClick={onClose}><X className="text-white" /></button>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Wand2 size={18} className="text-purple-400" /> Virtual Studio</h2>
        <button 
            onClick={handleGenerate} 
            disabled={selectedItems.length === 0 || isGenerating}
            className="text-black bg-white px-4 py-1.5 rounded-full text-xs font-bold disabled:opacity-50"
        >
            {isGenerating ? 'Rendering...' : 'Visualize Fit'}
        </button>
      </div>

      {/* Main Preview Area (My Look) */}
      <div className="flex-1 bg-zinc-900 relative flex items-center justify-center overflow-hidden">
          {generatedImage ? (
              <div className="relative w-full h-full animate-in fade-in zoom-in duration-500">
                  <img src={generatedImage} className="w-full h-full object-cover" alt="Generated Look" />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                      <button onClick={() => setGeneratedImage(null)} className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/20"><RotateCcw size={20}/></button>
                      <button className="p-3 bg-white text-black rounded-full shadow-lg"><Share2 size={20}/></button>
                  </div>
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center opacity-50">
                  {isGenerating ? (
                      <>
                        <Loader2 size={48} className="text-purple-400 animate-spin mb-4" />
                        <p className="text-white font-bold">Stitching pixels...</p>
                      </>
                  ) : (
                      <>
                        <User size={64} className="text-white/20 mb-4" />
                        <p className="text-white text-sm">Select items below to build your fit.</p>
                      </>
                  )}
              </div>
          )}
          
          {/* Selected Items Overlay (when not generated) */}
          {!generatedImage && selectedItems.length > 0 && (
             <div className="absolute top-4 left-4 flex flex-col gap-2">
                 {selectedItems.map(item => (
                     <div key={item.id} className="relative w-12 h-12 bg-white/10 rounded-lg overflow-hidden border border-white/20">
                         <img src={item.image} className="w-full h-full object-cover" />
                         <button onClick={() => toggleItem(item)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><X size={16} className="text-white"/></button>
                     </div>
                 ))}
             </div>
          )}
      </div>

      {/* Create a Look Selector */}
      <div className="h-1/3 bg-black border-t border-white/10 flex flex-col">
          <div className="flex border-b border-white/10">
              {['tops', 'bottoms', 'accessories'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === tab ? 'text-white border-b-2 border-white' : 'text-white/40'}`}
                  >
                      {tab}
                  </button>
              ))}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-3">
                  {filteredProducts.map(product => (
                      <div 
                        key={product.id} 
                        onClick={() => toggleItem(product)}
                        className={`aspect-square rounded-xl overflow-hidden relative cursor-pointer border ${selectedItems.find(i => i.id === product.id) ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-white/10'}`}
                      >
                          <img src={product.image} className="w-full h-full object-cover" />
                          {selectedItems.find(i => i.id === product.id) && (
                              <div className="absolute top-1 right-1 bg-purple-500 rounded-full p-0.5"><Check size={10} className="text-white" /></div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function ScoopApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth State
  const [isOnboarding, setIsOnboarding] = useState(false); // New Onboarding State
  const [profileView, setProfileView] = useState<'main' | 'orders' | 'closet' | 'settings'>('closet'); // DEFAULT PROFILE VIEW TO CLOSET
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<FashionStyle | null>(null); // For Lookbook
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCreationMenuOpen, setIsCreationMenuOpen] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false); // Fixed: Defined isCanvasOpen
  const [isSelectItemOpen, setIsSelectItemOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showTryOnModal, setShowTryOnModal] = useState(false);
  const [liveTryOnProduct, setLiveTryOnProduct] = useState<Product | null>(null);
  const [styleCategoryFilter, setStyleCategoryFilter] = useState('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postItem, setPostItem] = useState<CartItem | null>(null);
  const [selectedSize, setSelectedSize] = useState('S');
  const [showCopOrDrop, setShowCopOrDrop] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    handle: '',
    email: '',
    bio: '',
    phone: '',
    address: '',
    cred: 0,
    pageRating: 5.0,
    followers: 0,
    following: 0,
    isPublicCloset: true,
    savedCards: [],
    stylePreferences: []
  });
  const [earnedCred, setEarnedCred] = useState(0); 
  const [viewingStory, setViewingStory] = useState<Story | null>(null); // State for viewing story
  const [viewingUser, setViewingUser] = useState<string | null>(null); // State for viewing user
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatUser, setCurrentChatUser] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [friendsList, setFriendsList] = useState<Friend[]>(FRIENDS);
  const [viewingBrand, setViewingBrand] = useState<string | null>(null); // Brand Profile State
  const [isScoopAIOpen, setIsScoopAIOpen] = useState(false); // AI Modal State
  const [aiContextProduct, setAiContextProduct] = useState<Product | null>(null); // AI Context


  const [orders, setOrders] = useState<Order[]>([{
      id: 'ORD-88321', date: '15 Mar 2024', status: 'delivered', total: 3500, trackingNumber: 'TRK-987654321', estimatedDelivery: '20 Mar 2024', deliveryAddress: '124 Bree Street, Cape Town', carrier: 'Scoop Express',
      items: [{...PRODUCTS[0], cartId: '1', size: 'M', quantity: 1}],
      trackingSteps: TRACKING_STEPS
  }]);
  
  const [posts, setPosts] = useState<FashionStyle[]>([...COMMUNITY_POSTS, ...FASHION_STYLES]);
  const [drops, setDrops] = useState<Drop[]>(DROPS); // State for drops to handle raffle entry

  // Filtered products for search
  const filteredProducts = searchQuery 
    ? PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredBrands = searchQuery
    ? BRANDS_LIST.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const showToast = (message: string) => setToast({ show: true, message });

  const handlePost = (newPost: FashionStyle) => {
    setPosts([newPost, ...posts]);
    showToast('Posted to Feed!');
  };

  const handleRate = (postId: number, rating: number) => {
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, rating: (p.rating * p.reviewCount + rating) / (p.reviewCount + 1), reviewCount: p.reviewCount + 1 }
        : p
    ));
    showToast(`Rated ${rating} Stars!`);
  };

  const handleGameAction = (action: 'cop' | 'drop', product: Product) => {
    if (action === 'cop') {
      addToCart(product);
      // showToast('Copped!');
    }
  };

  const handleEnterRaffle = () => {
    if (userProfile.cred < 50) {
      showToast('Not enough Cred!');
      return;
    }
    setUserProfile({ ...userProfile, cred: userProfile.cred - 50 });
    setDrops(drops.map(d => d.id === 1 ? { ...d, entered: true } : d));
    showToast('Entered Raffle! -50 Cred');
  };

  const handleCreationAction = (action: string) => {
    setIsCreationMenuOpen(false);
    if (action === 'canvas') setIsCanvasOpen(true); // Fixed: Set isCanvasOpen instead of isVirtualTryOnOpen
    if (action === 'post') {
      const hasPurchases = orders.some(o => o.items.length > 0);
      if (hasPurchases) {
        setIsSelectItemOpen(true);
      } else {
        showToast("You need to buy something first!");
      }
    }
    if (action === 'ai') {
        setAiContextProduct(null);
        setIsScoopAIOpen(true);
    }
  };

  const addToCart = (product: Product, giftInfo?: { isGift: boolean, recipient: string }) => {
    setCart([...cart, { 
       ...product, 
       cartId: Math.random().toString(), 
       size: 'M', 
       quantity: 1,
       isGift: giftInfo?.isGift,
       giftRecipient: giftInfo?.recipient
    }]);
    setSelectedProduct(null);
    showToast(giftInfo?.isGift ? `Gift for ${giftInfo.recipient} added!` : `Added ${product.name}`);
  };

  // --- PASTE THIS SECTION INSIDE SCOOPAPP (Before ProductDetailModal) ---

  const handleAddToCartWithDetails = (product: Product, size: string, color: string, qty: number) => {
    // Logic to add specific variant to cart
    const newItem: CartItem = {
        ...product,
        cartId: Math.random().toString(),
        size: size,
        quantity: qty,
        // You can add color to CartItem interface later if needed
    };

    setCart([...cart, newItem]);
    setSelectedProduct(null); 
    showToast(`Added ${qty} x ${product.name} (${size})`);
  };

  const handleBuyNow = (product: Product, size: string, color: string, qty: number) => {
    handleAddToCartWithDetails(product, size, color, qty);
    setIsCartOpen(true);
    setCheckoutStep(1); // Go straight to checkout
  };

  // -----------------------------------------------------------------------

  const ProductDetailModal = ({ 
    product, 
    isOpen, 
    onClose, 
    onAddToCart, 
    onBuyNow, 
    onShowSizeGuide,
    onShowShare,
    onBrandClick,
    onOpenAI
}: { 
    product: Product | null, 
    isOpen: boolean, 
    onClose: () => void,
    onAddToCart: (item: Product, size: string, color: string, qty: number) => void,
    onBuyNow: (item: Product, size: string, color: string, qty: number) => void,
    onShowSizeGuide: () => void,
    onShowShare: () => void,
    onBrandClick: (brand: string) => void,
    onOpenAI: (product: Product) => void
}) => {
    const [currentImage, setCurrentImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setCurrentImage(0);
            setQuantity(1);
            setSelectedSize('M');
            setActiveAccordion(null);
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const images = product.images || [product.image];
    const colors = product.colors || ['#000000', '#ffffff']; 
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    const toggleAccordion = (section: string) => {
        setActiveAccordion(activeAccordion === section ? null : section);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImage((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="absolute inset-0 z-50 bg-black flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
             {/* --- IMAGE CAROUSEL --- */}
             <div className="relative h-[55%] bg-zinc-900">
                <img 
                    src={images[currentImage]} 
                    className="w-full h-full object-cover transition-opacity duration-300" 
                    alt={product.name} 
                />
                
                {/* Header Buttons */}
                <div className="absolute top-4 left-4 z-10">
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black transition-colors">
                        <ArrowLeft size={20}/>
                    </button>
                </div>
                
                {/* --- RESTORED SEND ICON HERE --- */}
                <div className="absolute top-4 right-4 z-10">
                    <button onClick={onShowShare} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black transition-colors">
                        <Send size={20} className="-ml-0.5 mt-0.5"/> 
                    </button>
                </div>

                {/* Carousel Controls */}
                {images.length > 1 && (
                    <>
                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-sm">
                            <ArrowLeft size={16} />
                        </button>
                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-sm">
                            <ArrowRight size={16} />
                        </button>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                            {images.map((_, idx) => (
                                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${currentImage === idx ? 'bg-white w-4' : 'bg-white/50'}`} />
                            ))}
                        </div>
                    </>
                )}
             </div>

             {/* --- PRODUCT DETAILS --- */}
             <div className="flex-1 bg-black -mt-6 rounded-t-[2.5rem] relative flex flex-col border-t border-white/20 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 pb-32">
                    
                    <div className="flex justify-between items-start mb-2">
                        <button onClick={() => onBrandClick(product.brand)} className="text-2xl font-black text-white flex items-center gap-2">
                            {product.brand} <ChevronRight size={20} className="text-white/30"/>
                        </button>
                        <div className="flex flex-col items-end">
                            <span className="text-xl font-bold text-white">R {product.price}</span>
                        </div>
                    </div>
                    <p className="text-white/60 mb-6">{product.name}</p>

                    {/* Color Selector */}
                    <div className="mb-6">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Color</p>
                        <div className="flex gap-3">
                            {colors.map((color, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedColor(idx)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === idx ? 'border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size Selector */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Size</p>
                            <button onClick={onShowSizeGuide} className="text-xs text-white underline decoration-white/30">Size Guide</button>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`h-10 rounded-lg text-sm font-bold border transition-all ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/20 hover:border-white'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="mb-8">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Quantity</p>
                        <div className="flex items-center gap-4 bg-zinc-900 w-max rounded-full p-1 border border-white/10">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white border border-white/10 hover:bg-white/10"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-white font-bold w-4 text-center">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Accordions */}
                    <div className="space-y-4 mb-8">
                        <div className="border-t border-white/10 pt-4">
                            <button onClick={() => toggleAccordion('materials')} className="w-full flex justify-between items-center text-left">
                                <span className="text-sm font-bold text-white">Materials & Details</span>
                                {activeAccordion === 'materials' ? <Minus size={16} className="text-white"/> : <Plus size={16} className="text-white"/>}
                            </button>
                            {activeAccordion === 'materials' && (
                                <div className="pt-3 animate-in slide-in-from-top-2 fade-in">
                                    <p className="text-white/70 text-sm leading-relaxed">{product.materials || product.description}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="border-t border-white/10 pt-4">
                            <button onClick={() => toggleAccordion('shipping')} className="w-full flex justify-between items-center text-left">
                                <span className="text-sm font-bold text-white">Shipping & Returns</span>
                                {activeAccordion === 'shipping' ? <Minus size={16} className="text-white"/> : <Plus size={16} className="text-white"/>}
                            </button>
                            {activeAccordion === 'shipping' && (
                                <div className="pt-3 animate-in slide-in-from-top-2 fade-in">
                                    <p className="text-white/70 text-sm leading-relaxed">Free shipping on orders over R1000. Returns accepted within 30 days of delivery. Items must be unworn and tags attached.</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <button onClick={() => toggleAccordion('care')} className="w-full flex justify-between items-center text-left">
                                <span className="text-sm font-bold text-white">Care Guide</span>
                                {activeAccordion === 'care' ? <Minus size={16} className="text-white"/> : <Plus size={16} className="text-white"/>}
                            </button>
                            {activeAccordion === 'care' && (
                                <div className="pt-3 animate-in slide-in-from-top-2 fade-in">
                                    <p className="text-white/70 text-sm leading-relaxed">{product.care || "Wash cold with like colors. Do not tumble dry."}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Stylist */}
                    <button 
                        onClick={() => onOpenAI(product)}
                        className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 flex items-center justify-between hover:border-purple-500 transition-all group mb-4"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-purple-400 group-hover:text-purple-300" size={20} />
                            <div className="text-left">
                                <span className="text-white font-bold text-sm block">Ask Scoop AI</span>
                                <span className="text-white/50 text-xs">How do I style this?</span>
                            </div>
                        </div>
                        <ChevronRight className="text-white/40" size={16} />
                    </button>
                </div>

                {/* Sticky Action Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-black border-t border-white/10 flex gap-3 z-20">
                    <button 
                        onClick={() => onAddToCart(product, selectedSize, colors[selectedColor], quantity)}
                        className="flex-1 py-4 rounded-full border border-white text-white font-bold text-sm hover:bg-white/10 transition-colors"
                    >
                        Add to Cart
                    </button>
                    <button 
                        onClick={() => onBuyNow(product, selectedSize, colors[selectedColor], quantity)}
                        className="flex-1 py-4 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                        Buy Now
                    </button>
                </div>
             </div>
        </div>
    );
};
  const handleGift = (friend: Friend) => {
      if(selectedProduct) {
          addToCart(selectedProduct, { isGift: true, recipient: friend.name });
          setShowShareModal(false);
          setIsCartOpen(true); // Open cart immediately
      }
  };

  const handleRequest = (friend: Friend) => {
      // Mock Request logic
      showToast(`Request sent to ${friend.name}!`);
      setShowShareModal(false);
  };
  
  const removeFromCart = (id: string) => setCart(cart.filter(i => i.cartId !== id));
  
  const toggleWishlist = (e: any, id: number) => {
    if (e) e.stopPropagation();
    setWishlist(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleCheckoutComplete = () => {
    const total = cart.reduce((a, b) => a + b.price * b.quantity, 0);
    const points = Math.floor(total / 10);
    
    setEarnedCred(points);
    setUserProfile(prev => ({ ...prev, cred: prev.cred + points }));
    
    const newOrder: Order = {
        id: `ORD-${Math.floor(Math.random() * 100000)}`,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: [...cart],
        status: 'processing',
        total: total,
        trackingNumber: `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        estimatedDelivery: '3-5 Days',
        deliveryAddress: userProfile.address,
        carrier: 'Scoop Logistics',
        trackingSteps: [
            { id: 1, status: 'Order Placed', location: 'Online', date: 'Just now', time: new Date().toLocaleTimeString(), completed: true },
            { id: 2, status: 'Processing', location: 'Warehouse', date: 'Pending', time: '', completed: false },
            { id: 3, status: 'Shipped', location: 'Dispatch', date: 'Pending', time: '', completed: false },
            { id: 4, status: 'In Transit', location: 'Hub', date: 'Pending', time: '', completed: false },
            { id: 5, status: 'Out for Delivery', location: 'Local', date: 'Pending', time: '', completed: false },
            { id: 6, status: 'Delivered', location: 'Home', date: 'Pending', time: '', completed: false },
        ]
    };
    
    setOrders([newOrder, ...orders]);
    setCart([]);
    setCheckoutStep(2);
  };

  const handleNotificationAction = (notif: Notification) => {
    if (notif.type === 'request' && notif.relatedProductId) {
      const product = PRODUCTS.find(p => p.id === notif.relatedProductId);
      if (product) {
        addToCart(product);
        setIsNotificationsOpen(false);
        setIsCartOpen(true);
      }
    }
  };

  const handleAuthComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsOnboarding(true); // Start onboarding instead of direct authentication
  };

  const handleOnboardingComplete = (styles: string[]) => {
      setUserProfile(prev => ({ ...prev, stylePreferences: styles }));
      setIsOnboarding(false);
      setIsAuthenticated(true);
      showToast("Profile Personalized! 🚀");
  };

  const handleDeleteClosetItem = (orderId: string) => {
    if(confirm("Remove this item from your public closet?")) {
      setOrders(orders.filter(o => o.id !== orderId));
    }
  };

  const openChat = (user: any) => {
    setCurrentChatUser(user);
    setIsChatOpen(true);
    setViewingUser(null); // Close profile modal if open
  };

  const sendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: 'me',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
  };

  const toggleFollow = (friendId: number) => {
    setFriendsList(friendsList.map(f => 
      f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f
    ));
  };


  // --- Render Functions ---

  const renderHome = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
       <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 pt-6 space-y-10">
          
          {/* Personalized Section */}
          {userProfile.stylePreferences.length > 0 && (
             <div className="animate-in fade-in slide-in-from-right duration-500">
                <div className="flex items-center gap-2 mb-4">
                    {/* UPDATED ICON HERE: Changed from colored Sparkles to white Zap */}
                    <Zap size={16} className="text-white" />
                    <h3 className="text-xs font-bold text-white/50 tracking-widest uppercase">Curated For You</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                   {/* ... rest of the product list ... */}
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                   {PRODUCTS.filter(p => userProfile.stylePreferences.includes(p.style)).length > 0 ? 
                      PRODUCTS.filter(p => userProfile.stylePreferences.includes(p.style)).map(product => (
                        <div key={product.id} onClick={() => setSelectedProduct(product)} className="w-40 flex-shrink-0 group cursor-pointer">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 mb-2 relative">
                                <img src={product.image} className="w-full h-full object-cover grayscale" />
                                <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-bold border border-white/20">
                                   {product.style.replace('_', ' ')}
                                </div>
                            </div>
                            <h4 className="text-white font-bold text-sm truncate">{product.name}</h4>
                            <p className="text-white/50 text-xs">R {product.price}</p>
                        </div>
                   )) : (
                       <p className="text-white/30 text-sm">No specific items found for your styles yet.</p>
                   )}
                </div>
             </div>
          )}

          {/* Game Teaser */}
          <div onClick={() => setShowCopOrDrop(true)} className="relative h-28 rounded-2xl bg-zinc-900 border border-white/20 overflow-hidden flex items-center justify-between p-6 cursor-pointer group">
             <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div><h3 className="text-lg font-black text-white italic">COP OR DROP</h3><p className="text-sm text-white/60">Swipe to rate • Earn Cred</p></div>
             <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold animate-pulse">GO</div>
          </div>

          {/* Brands Block (Replacing Stories) */}
          <div>
            <h3 className="text-xs font-bold text-white/50 tracking-widest mb-4">BRANDS</h3>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
               {BRANDS_LIST.map((brand, i) => (
                  <button key={i} className="w-32 flex-shrink-0 group" onClick={() => setViewingBrand(brand.name)}>
                     <div className="w-32 h-20 rounded-2xl overflow-hidden relative border border-white/10 group-hover:border-white/50 transition-all">
                        <img src={brand.banner} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="font-black text-white uppercase text-sm drop-shadow-md">{brand.name}</span>
                        </div>
                     </div>
                  </button>
               ))}
            </div>
          </div>

          {/* Drop Card */}
          <div className="px-0">
            <DropCard drop={drops[0]} onEnterRaffle={handleEnterRaffle} />
          </div>

          {/* Product Grid */}
          <div>
            <h3 className="text-xs font-bold text-white/50 tracking-widest mb-4">ALL DROPS</h3>
            <div className="grid grid-cols-2 gap-4 pb-8">
                {PRODUCTS.filter(p => categoryFilter === 'All' || p.category === categoryFilter).map(product => (
                <div key={product.id} onClick={() => setSelectedProduct(product)} className="group cursor-pointer mb-6">
                    <div className="aspect-[3/4] relative rounded-2xl overflow-hidden border border-white/10 mb-3">
                        <img src={product.image} className="w-full h-full object-cover grayscale" alt={product.name} />
                        {product.condition === 'pre-owned' && (
                        <div className="absolute top-2 left-2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded-full">RESALE</div>
                        )}
                        <button onClick={(e) => toggleWishlist(e, product.id)} className="absolute top-2 right-2 p-2 bg-black/50 rounded-full">
                            <Heart size={14} fill={wishlist.includes(product.id) ? "white" : "none"} />
                        </button>
                    </div>
                    <div className="px-1">
                        {/* BRAND NAME IS NOW CLICKABLE */}
                        <button onClick={(e) => { e.stopPropagation(); setViewingBrand(product.brand); }} className="flex items-center gap-1 text-xs font-bold text-white/50 mb-1 uppercase tracking-wider hover:text-white transition-colors text-left">
                            {product.brand} <StoreIcon size={10} className="ml-0.5" />
                        </button>
                        <h4 className="text-white font-bold text-sm truncate mb-1">{product.name}</h4>
                        <p className="text-white font-bold text-sm">R {product.price}</p>
                    </div>
                </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => {
      return (
        <div className="flex-1 overflow-y-auto pb-32 bg-black">
           {/* Profile Header */}
           <div className="flex flex-col items-center pt-8 px-6 pb-6">
             <div className="w-24 h-24 rounded-full bg-black border-2 border-white flex items-center justify-center text-white text-3xl font-bold mb-4 overflow-hidden">
               {userProfile.avatar ? <img src={userProfile.avatar} className="w-full h-full object-cover" /> : userProfile.name.charAt(0)}
             </div>
             <h3 className="text-2xl font-bold text-white text-center">{userProfile.name}</h3>
             <p className="text-white/60 text-sm mb-3 text-center">{userProfile.handle}</p>
             <p className="text-white/80 text-xs mb-6 text-center max-w-[80%] leading-relaxed">{userProfile.bio}</p>
             
             {/* Style Preferences Tags */}
             {userProfile.stylePreferences.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-6 max-w-xs">
                    {userProfile.stylePreferences.map(style => (
                        <span key={style} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white uppercase border border-white/20">
                            {style.replace('_', ' ')}
                        </span>
                    ))}
                </div>
             )}
             
             <div className="flex gap-8 mb-8 w-full justify-center border-y border-white/10 py-4">
               <div className="text-center"><span className="block font-black text-lg text-white">{userProfile.followers}</span><span className="text-[10px] text-white/50 uppercase tracking-wide">Followers</span></div>
               <div className="text-center"><span className="block font-black text-lg text-white">{userProfile.following}</span><span className="text-[10px] text-white/50 uppercase tracking-wide">Following</span></div>
               <div className="text-center"><span className="block font-black text-lg text-white">{userProfile.cred}</span><span className="text-[10px] text-white/50 uppercase tracking-wide">Cred</span></div>
             </div>
             
             <div className="flex gap-3 w-full">
               <button onClick={() => setIsEditProfileOpen(true)} className="flex-1 py-2.5 rounded-lg bg-white text-black font-bold text-sm">Edit Profile</button>
               <button onClick={() => setProfileView('settings')} className="flex-1 py-2.5 rounded-lg border border-white/20 text-white font-bold text-sm">Settings</button>
             </div>
           </div>
           
           {/* Tabs */}
           <div className="flex border-b border-white/10 sticky top-0 bg-black z-10">
              <button 
                onClick={() => setProfileView('closet')} 
                className={`flex-1 py-3 flex justify-center items-center ${profileView === 'closet' || profileView === 'main' ? 'border-b-2 border-white text-white' : 'text-white/40'}`}
              >
                  <Grid size={20} />
              </button>
              <button 
                onClick={() => setProfileView('orders')} 
                className={`flex-1 py-3 flex justify-center items-center ${profileView === 'orders' ? 'border-b-2 border-white text-white' : 'text-white/40'}`}
              >
                  <Package size={20} />
              </button>
           </div>

           {/* Content */}
           <div className="min-h-[300px]">
             {profileView === 'closet' || profileView === 'main' ? (
                <div className="grid grid-cols-3 gap-1 p-1">
                   {/* Mix of bought items and posts */}
                   {orders.flatMap(o => o.items).map((item, i) => (
                     <div key={`item-${i}`} onContextMenu={(e) => { e.preventDefault(); handleDeleteClosetItem(orders[0].id); }} className="aspect-square bg-zinc-900 relative group overflow-hidden">
                        <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt={item.name} />
                     </div>
                   ))}
                   {posts.filter(p => p.author === userProfile.handle).map((post, i) => (
                     <div key={`post-${i}`} className="aspect-square bg-zinc-900 relative group overflow-hidden">
                        <img src={post.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt={post.name} />
                        <div className="absolute top-1 right-1"><Layers size={12} className="text-white drop-shadow-md"/></div>
                     </div>
                   ))}
                   {/* Fillers if empty */}
                   {orders.length === 0 && posts.filter(p => p.author === userProfile.handle).length === 0 && (
                      [1,2,3,4,5,6].map(n => (
                        <div key={n} className="aspect-square bg-white/5 flex items-center justify-center">
                           <div className="w-full h-full bg-zinc-900/50 animate-pulse"/>
                        </div>
                      ))
                   )}
                </div>
             ) : profileView === 'orders' ? (
                <div className="p-4 space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-5 rounded-[2rem] bg-zinc-900 border border-white/10">
                      <div className="flex justify-between mb-4"><span className="font-bold text-white">{order.id}</span><span className="text-xs font-bold border border-white px-2 py-1 rounded-full uppercase">{order.status}</span></div>
                      <div className="flex gap-2 mb-4 overflow-x-auto">{order.items.map((item, i) => <img key={i} src={item.image} className="w-16 h-16 rounded-lg object-cover grayscale" />)}</div>
                      <div className="flex gap-2"><Button variant="secondary" className="flex-1 py-2 text-xs" onClick={() => { setTrackingOrder(order); setShowTrackingModal(true); }}>Track</Button></div>
                    </div>
                  ))}
                </div>
             ) : (
                // Settings View
                <div className="p-4 space-y-4">
                  <button onClick={() => setShowPoliciesModal(true)} className="w-full flex items-center justify-between p-5 rounded-2xl bg-zinc-900 border border-white/10 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3"><FileText size={20} className="text-white"/><span className="text-white font-bold">Legal</span></div><ChevronRight size={18} className="text-white/50" />
                  </button>
                  <button className="w-full flex items-center gap-4 p-5 rounded-2xl border border-white/20 text-red-500 hover:bg-red-500/10 transition-colors mt-4">
                    <LogOut size={20} /><span className="font-bold">Sign Out</span>
                  </button>
                </div>
             )}
           </div>
        </div>
      );
  };

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="absolute inset-0 z-50 bg-black flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
         <div className="relative h-[60%]">
            <img src={selectedProduct.image} className="w-full h-full object-cover grayscale" alt={selectedProduct.name} />
            <div className="absolute top-4 left-4"><button onClick={() => setSelectedProduct(null)} className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center"><ArrowLeft/></button></div>
            <div className="absolute top-4 right-4"><button onClick={() => setShowShareModal(true)} className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center"><Send/></button></div>
         </div>
         <div className="flex-1 bg-black -mt-6 rounded-t-[2.5rem] relative flex flex-col border-t border-white/20 p-6">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-black text-white">{selectedProduct.brand}</h2>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white border border-white/20 uppercase">{selectedProduct.style}</span>
                </div>
            </div>
            <p className="text-white/60 mb-4">{selectedProduct.name}</p>
            <p className="text-white/80 text-sm leading-relaxed mb-6">{selectedProduct.description}</p>
            
            {/* NEW: More by Brand Button */}
            <button onClick={() => { setViewingBrand(selectedProduct.brand); }} className="w-full mb-6 p-4 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                    <StoreIcon className="text-white/60 group-hover:text-white" size={20} />
                    <span className="text-white font-bold text-sm">More by {selectedProduct.brand}</span>
                </div>
                <ArrowRight className="text-white/40" size={16} />
            </button>

            {/* AI Stylist Button */}
            <button 
                onClick={() => { setAiContextProduct(selectedProduct); setIsScoopAIOpen(true); }}
                className="w-full mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 flex items-center justify-between hover:border-purple-500 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="text-purple-400 group-hover:text-purple-300" size={20} />
                    <div className="text-left">
                        <span className="text-white font-bold text-sm block">Ask Scoop AI</span>
                        <span className="text-white/50 text-xs">Get styling tips for this item</span>
                    </div>
                </div>
                <ChevronRight className="text-white/40" size={16} />
            </button>

            <div className="mt-auto flex gap-4">
               <Button fullWidth variant="primary" onClick={() => addToCart(selectedProduct)}>Add to Bag • R {selectedProduct.price}</Button>
            </div>
         </div>
      </div>
    );
  };

  const renderCartOverlay = () => {
     if (!isCartOpen) return null;
     return (
        <div className="absolute inset-0 z-50 bg-black flex flex-col animate-in slide-in-from-bottom duration-300 text-white">
           <div className="p-6 flex justify-between items-center border-b border-white/10">
              <h2 className="text-2xl font-black">My Bag ({cart.length})</h2>
              <button onClick={() => setIsCartOpen(false)}><X className="text-white" /></button>
           </div>
           <div className="flex-1 p-6">
              {cart.length === 0 ? <p className="text-center text-white/50 mt-20">Bag is empty</p> : (
                  cart.map(item => (
                      <div key={item.cartId} className="flex gap-4 mb-4">
                         <img src={item.image} className="w-20 h-20 rounded-lg object-cover grayscale" alt={item.name} />
                         <div>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-sm text-white/50">R {item.price}</p>
                            {item.isGift && (
                                <p className="text-xs text-yellow-500 font-bold mt-1 flex items-center gap-1"><Gift size={10}/> Gift for {item.giftRecipient}</p>
                            )}
                         </div>
                      </div>
                  ))
              )}
           </div>
           {cart.length > 0 && (
              <div className="p-6 border-t border-white/10">
                 <Button fullWidth variant="primary" onClick={() => setCheckoutStep(1)}>Checkout</Button>
              </div>
           )}
        </div>
     );
  };

  const renderCheckout = () => {
    if (checkoutStep === 0) return null;
    return (
      <div className="absolute inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-300 text-white">
        {checkoutStep === 1 && (
           <>
             <div className="p-6 flex items-center gap-4">
               <button onClick={() => setCheckoutStep(0)} className="w-10 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center text-white"><ArrowLeft size={20} /></button>
               <h2 className="text-2xl font-bold text-white">Checkout</h2>
             </div>
             <div className="p-6 space-y-6">
                <div className="p-6 rounded-[2rem] bg-black border border-white/20">
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Shipping</h3>
                  <div className="flex items-center gap-4">
                    <MapPin className="text-white" size={20} />
                    <div>
                      <p className="text-white font-bold">Home</p>
                      <p className="text-white/60 text-sm">124 Bree St, Cape Town</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-[2rem] bg-black border border-white/20">
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Payment</h3>
                  <div className="flex items-center gap-4">
                    <CreditCard className="text-white" size={20} />
                    <div>
                      <p className="text-white font-bold">Visa •••• 4242</p>
                    </div>
                  </div>
                </div>
             </div>
             <div className="mt-auto p-6 border-t border-white/10">
               <div className="flex justify-between mb-6 text-xl font-bold text-white">
                 <span>Total</span>
                 <span>R {cart.reduce((a,b) => a+b.price, 0)}</span>
               </div>
               <Button variant="primary" fullWidth onClick={handleCheckoutComplete}>Pay Now</Button>
             </div>
           </>
        )}
        {checkoutStep === 2 && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in duration-300">
             <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-black mb-6"><CheckCircle size={48} /></div>
             <h2 className="text-3xl font-black text-white mb-2">Order Confirmed!</h2>
             <p className="text-white/60 mb-2">Your gear is on the way.</p>
             {earnedCred > 0 && (
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 inline-flex items-center gap-2 mb-8">
                   <Award size={16} className="text-white" />
                   <span className="text-white font-bold text-sm">You earned {earnedCred} Cred</span>
                </div>
             )}
             <Button fullWidth onClick={() => { setCart([]); setCheckoutStep(0); setActiveTab('home'); }}>Back to Home</Button>
          </div>
        )}
      </div>
    );
  }

  const renderSearch = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
       <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 pt-6">
           <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input 
                type="text"
                placeholder="Search brands, items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-full py-4 pl-12 pr-4 text-white placeholder-white/50 focus:ring-1 focus:ring-white focus:border-white"
              />
           </div>

           {!searchQuery ? (
             <div className="space-y-6">
               <div>
                 <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">Trending</h3>
                 <div className="flex flex-wrap gap-2">
                   {['Galxboy', 'Butan', 'Puffer', 'Bucket Hat', 'Grade'].map(term => (
                     <button key={term} onClick={() => setSearchQuery(term)} className="px-4 py-2 bg-black border border-white/20 rounded-lg text-sm font-bold text-white/80 hover:text-white hover:border-white">
                       {term}
                     </button>
                   ))}
                 </div>
               </div>
             </div>
           ) : (
             <div className="space-y-8">
               {/* Brand Results */}
               {filteredBrands.length > 0 && (
                   <div>
                       <h3 className="text-xs font-bold text-white/50 tracking-widest mb-4 uppercase">Brands</h3>
                       <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                           {filteredBrands.map(brand => (
                               <button key={brand.id} className="w-32 flex-shrink-0 group" onClick={() => setViewingBrand(brand.name)}>
                                   <div className="w-32 h-16 rounded-xl overflow-hidden relative border border-white/10 group-hover:border-white/50 transition-all">
                                       <img src={brand.banner} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                       <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                           <span className="font-black text-white uppercase text-xs drop-shadow-md">{brand.name}</span>
                                       </div>
                                   </div>
                               </button>
                           ))}
                       </div>
                   </div>
               )}

               {/* Product Results */}
               <div>
                   <h3 className="text-xs font-bold text-white/50 tracking-widest mb-4 uppercase">Items</h3>
                   {filteredProducts.length > 0 ? (
                       <div className="space-y-4">
                           {filteredProducts.map(p => (
                               <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex items-center gap-4 p-2 hover:bg-white/5 rounded-xl cursor-pointer">
                                   <img src={p.image} className="w-12 h-12 rounded-lg object-cover grayscale" alt={p.name} />
                                   <div>
                                       <h4 className="font-bold text-sm text-white">{p.name}</h4>
                                       <p className="text-xs text-white/50">{p.brand}</p>
                                   </div>
                                   <ArrowRight className="ml-auto text-white/50" size={16} />
                               </div>
                           ))}
                       </div>
                   ) : (
                       <p className="text-white/30 text-sm">No items matching "{searchQuery}"</p>
                   )}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  const renderCommunityFeed = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
       <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 pt-6 space-y-8">
          {posts.map(post => (
            <div key={post.id} className="group">
              <button className="flex items-center gap-3 mb-3 pl-2 w-full" onClick={() => setViewingUser(post.author)}>
                <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
                  {post.authorImage ? <img src={post.authorImage} className="w-full h-full object-cover" alt={post.author} /> : <div className="w-full h-full bg-white text-black flex items-center justify-center font-bold text-xs">{post.author[1]}</div>}
                </div>
                <div className="text-left"><p className="text-sm font-bold text-white leading-none">{post.author}</p>{post.isFriend && <p className="text-[10px] text-white/50">Friend</p>}</div>
              </button>
              <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 border border-white/10">
                <img src={post.image} className="w-full h-full object-cover grayscale" alt={post.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                   <div className="w-full">
                     <h4 className="text-white font-bold text-xl">{post.name}</h4>
                     <p className="text-white/60 text-sm line-clamp-1 mb-2">{post.description}</p>
                     <div className="flex justify-between items-center">
                        <RatingStars rating={post.rating} count={post.reviewCount} onRate={(r) => handleRate(post.id, r)} />
                        <Button variant="primary" className="py-2 px-4 text-xs h-8" onClick={(e:any) => { e.stopPropagation(); setSelectedStyle(post); }}>View Items</Button>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWishlist = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
       <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 pt-6">
        <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white">Favorites</h2>
            <span className="bg-white text-black text-xs font-bold px-2 py-0.5 rounded-full">{wishlist.length}</span>
        </div>
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] opacity-50">
             <Heart size={48} className="mb-4 text-white/50" />
             <p className="text-white/50">No saved items</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {PRODUCTS.filter(p => wishlist.includes(p.id)).map(product => (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="group cursor-pointer relative">
                <div className="aspect-square rounded-[2rem] overflow-hidden bg-black border border-white/10 mb-4">
                  <img src={product.image} className="w-full h-full object-cover grayscale" alt={product.name} />
                </div>
                <button onClick={(e) => toggleWishlist(e, product.id)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center border border-white/20">
                   <X size={14} />
                </button>
                <div className="pl-1">
                   <h4 className="text-white font-bold text-sm leading-tight mb-1">{product.name}</h4>
                   <p className="text-white font-bold text-sm">R {product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
       <div className="flex-1 overflow-y-auto pb-32">
       <div className="flex items-center gap-4 p-6 sticky top-0 bg-black/95 backdrop-blur-md z-20 border-b border-white/10">
        <button onClick={() => setProfileView('main')} className="w-10 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center text-white">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
      </div>
      <div className="px-6 space-y-4 pt-6">
        <div className="p-6 rounded-[2rem] bg-black border border-white/20 flex justify-between items-center">
           <span className="text-white font-bold">Notifications</span>
           <div className="w-12 h-6 bg-white rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" /></div>
        </div>
        <button onClick={() => setShowPoliciesModal(true)} className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-black border border-white/20 hover:bg-white/5 transition-colors">
           <div className="flex items-center gap-3"><FileText size={20} className="text-white"/><span className="text-white font-bold">Legal & Policies</span></div>
           <ChevronRight size={18} className="text-white/50" />
        </button>
      </div>
      </div>
    </div>
  );

  <ProductDetailModal 
    product={selectedProduct}
    isOpen={!!selectedProduct}
    onClose={() => setSelectedProduct(null)}
    onAddToCart={handleAddToCartWithDetails}
    onBuyNow={handleBuyNow}
    onShowSizeGuide={() => setShowSizeGuide(true)}
    onShowShare={() => setShowShareModal(true)}
    onBrandClick={(brand) => { setSelectedProduct(null); setViewingBrand(brand); }}
    onOpenAI={(p) => { setSelectedProduct(null); setAiContextProduct(p); setIsScoopAIOpen(true); }}
/>

  return (
    <div className="bg-neutral-900 min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-md h-screen bg-black relative shadow-2xl overflow-hidden flex flex-col border-x border-white/10">
        
        {!isAuthenticated && !isOnboarding ? (
           <AuthScreen onComplete={handleAuthComplete} />
        ) : isOnboarding ? (
           <StyleOnboarding onComplete={handleOnboardingComplete} />
        ) : (
          <>
            {/* Main App Header */}
            <TopBar 
              title={<span className="text-3xl font-black tracking-tighter text-white">Scoop<span className="text-white/50">.</span></span>} 
              onCartClick={() => setIsCartOpen(true)} 
              onBellClick={() => setIsNotificationsOpen(true)} 
              unreadCount={0} 
              cartCount={cart.length} 
            />

            {/* Main Content */}
            {activeTab === 'home' && renderHome()}
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'search' && renderSearch()}
            {activeTab === 'styles' && renderCommunityFeed()}
            {activeTab === 'wishlist' && renderWishlist()}

            {/* Bottom Nav */}
            {!selectedProduct && !isCartOpen && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center z-40 pointer-events-none">
                 <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 flex gap-8 shadow-2xl pointer-events-auto">
                    <button onClick={() => setActiveTab('home')}><Home size={24} className={activeTab === 'home' ? 'text-white' : 'text-white/40'} /></button>
                    <button onClick={() => setActiveTab('search')}><Search size={24} className={activeTab === 'search' ? 'text-white' : 'text-white/40'} /></button>
                    
                    {/* Create Button */}
                    <button onClick={() => setIsCreationMenuOpen(true)} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform -translate-y-2 border-4 border-black"><Plus size={28} strokeWidth={3} /></button>

                    <button onClick={() => setActiveTab('styles')}><Users size={24} className={activeTab === 'styles' ? 'text-white' : 'text-white/40'} /></button>
                    
                    {/* Profile Button */}
                    <button onClick={() => { setActiveTab('profile'); setProfileView('main'); }}><User size={24} className={activeTab === 'profile' ? 'text-white' : 'text-white/40'} /></button>
                 </div>
              </div>
            )}

            {/* Modals & Overlays */}
            <ProductDetailModal 
    product={selectedProduct}
    isOpen={!!selectedProduct}
    onClose={() => setSelectedProduct(null)}
    onAddToCart={handleAddToCartWithDetails}
    onBuyNow={handleBuyNow}
    onShowSizeGuide={() => setShowSizeGuide(true)}
    onShowShare={() => setShowShareModal(true)}
    onBrandClick={(brand) => { setSelectedProduct(null); setViewingBrand(brand); }}
    onOpenAI={(p) => { setSelectedProduct(null); setAiContextProduct(p); setIsScoopAIOpen(true); }}
/>
            {renderCartOverlay()}
            {renderCheckout()}
            <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={notifications} onAction={handleNotificationAction} />
            <CopOrDropGame isOpen={showCopOrDrop} onClose={() => setShowCopOrDrop(false)} onGameAction={handleGameAction} />
            <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} profile={userProfile} onSave={setUserProfile} />
            <ShareModal product={selectedProduct} isOpen={showShareModal} onClose={() => setShowShareModal(false)} onGift={handleGift} onRequest={handleRequest} />
            <CreationMenu isOpen={isCreationMenuOpen} onClose={() => setIsCreationMenuOpen(false)} onAction={handleCreationAction} />
            <VirtualTryOn isOpen={isCanvasOpen} onClose={() => setIsCanvasOpen(false)} />
            <ReturnModal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} />
            <PoliciesModal isOpen={showPoliciesModal} onClose={() => setShowPoliciesModal(false)} />
            <SelectItemModal isOpen={isSelectItemOpen} onClose={() => setIsSelectItemOpen(false)} orders={orders} onSelect={(item) => { setPostItem(item); setIsSelectItemOpen(false); setShowCreatePostModal(true); }} />
            <CreatePostModal item={postItem} isOpen={showCreatePostModal} onClose={() => setShowCreatePostModal(false)} onPost={handlePost} />
            <LiveTryOnCamera product={liveTryOnProduct} isOpen={!!liveTryOnProduct} onClose={() => setLiveTryOnProduct(null)} />
            <OrderTrackingModal order={trackingOrder} isOpen={showTrackingModal} onClose={() => setShowTrackingModal(false)} />
            <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
            <BrandProfileModal 
               brand={viewingBrand}
               isOpen={!!viewingBrand}
               onClose={() => setViewingBrand(null)}
               onSelectProduct={(p) => { setViewingBrand(null); setSelectedProduct(p); }}
               onEnterRaffle={handleEnterRaffle}
            />
            <LookbookModal 
               style={selectedStyle} 
               isOpen={!!selectedStyle} 
               onClose={() => setSelectedStyle(null)} 
               onSelectProduct={(p) => { setSelectedStyle(null); setSelectedProduct(p); }} 
            />
            <StoryModal story={viewingStory} isOpen={!!viewingStory} onClose={() => setViewingStory(null)} />
            <OtherUserProfileModal handle={viewingUser} isOpen={!!viewingUser} onClose={() => setViewingUser(null)} onOpenChat={openChat} isFollowing={friendsList.find(f => f.handle === viewingUser)?.isFollowing || false} onToggleFollow={() => { const friend = friendsList.find(f => f.handle === viewingUser); if(friend) toggleFollow(friend.id); }} />
            <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} user={currentChatUser} messages={messages} onSendMessage={sendMessage} />
            <ScoopAIModal isOpen={isScoopAIOpen} onClose={() => setIsScoopAIOpen(false)} contextProduct={aiContextProduct} onSelectProduct={setSelectedProduct} />
          </>
        )}
        <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
      </div>
    </div>
  );
}