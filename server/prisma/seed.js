// Seed — creates the admin user (idempotent) and, on an empty catalog, loads
// the original hard-coded products so the site isn't blank on first run.
//
// Credentials come from env if set, else fall back to the documented defaults:
//   ADMIN_USER=admin  ADMIN_PASS=carbomax2026
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'

const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'carbomax2026'

// Migrated 1:1 from src/i18n.jsx PRODUCTS.
const PRODUCTS = [
  { sku: 'CBX-CO-PR-002', category: 'covers', carName: 'Chevrolet Cobalt', price: 1450000, nameUz: 'Cobalt premium chexol', nameRu: 'Чехлы Cobalt Premium', nameEn: 'Cobalt premium covers' },
  { sku: 'CBX-K5-EL-014', category: 'covers', carName: 'Kia K5', price: 1890000, nameUz: "K5 eko-charm to'plam", nameRu: 'K5 Эко-кожа комплект', nameEn: 'K5 eco-leather set' },
  { sku: 'CBX-TC-3D-007', category: 'mats', carName: 'Hyundai Tucson', price: 720000, nameUz: 'Tucson 3D pollik', nameRu: 'Tucson 3D коврики', nameEn: 'Tucson 3D mats' },
  { sku: 'MGC-M903F', category: 'acc', carName: 'Universal', price: 2350000, nameUz: 'Magicar M903F', nameRu: 'Magicar M903F', nameEn: 'Magicar M903F' },
  { sku: 'CBX-CY-PR-018', category: 'covers', carName: 'Toyota Camry', price: 2100000, nameUz: 'Camry premium chexol', nameRu: 'Camry premium чехлы', nameEn: 'Camry premium covers' },
  { sku: 'CBX-CO-EV-003', category: 'mats', carName: 'Chevrolet Cobalt', price: 480000, nameUz: 'Cobalt EVA pollik', nameRu: 'Cobalt EVA коврики', nameEn: 'Cobalt EVA mats' },
  { sku: 'ACC-LED-CAB-04', category: 'acc', carName: 'Universal', price: 320000, nameUz: "LED salon yorug'i", nameRu: 'LED подсветка салона', nameEn: 'LED cabin lighting' },
]

// Migrated 1:1 from src/i18n.jsx loyalty.tiers (+ an accent colour per tier).
const LOYALTY_TIERS = [
  { name: 'Regular', percent: '5%', accent: '#c4ccc0', descUz: 'Har bir mijoz uchun.', descRu: 'Для каждого клиента.', descEn: 'For every customer.', thresholdUz: 'Boshidanoq aktiv', thresholdRu: 'Активен с первой покупки', thresholdEn: 'Active from your first order' },
  { name: 'Silver', percent: '10%', accent: '#a8d8ec', descUz: 'Sodiq mijozlar uchun.', descRu: 'Для постоянных клиентов.', descEn: 'For loyal customers.', thresholdUz: "5 000 000 so'm xariddan keyin", thresholdRu: 'После 5 000 000 сум покупок', thresholdEn: 'After 5 000 000 UZS in lifetime spend' },
  { name: 'Gold', percent: '15%', accent: '#f5b023', descUz: 'Eng yaxshi shartlar.', descRu: 'Лучшие условия.', descEn: 'Our best terms.', thresholdUz: "15 000 000 so'm xariddan keyin", thresholdRu: 'После 15 000 000 сум покупок', thresholdEn: 'After 15 000 000 UZS in lifetime spend' },
]

// Product categories — slugs match the existing Product.category values.
const CATEGORIES = [
  { slug: 'covers', nameUz: 'Chexollar', nameRu: 'Чехлы', nameEn: 'Covers' },
  { slug: 'mats', nameUz: 'Pollik qoplamalari', nameRu: 'Коврики', nameEn: 'Mats' },
  { slug: 'acc', nameUz: 'Aksessuarlar', nameRu: 'Аксессуары', nameEn: 'Accessories' },
]

// Portfolio — migrated 1:1 from src/i18n.jsx ourWork.items.
const PORTFOLIO = [
  { carName: 'Chevrolet Cobalt', captionUz: "Premium chexol o'rnatildi", captionRu: 'Премиум чехлы установлены', captionEn: 'Premium covers installed' },
  { carName: 'Kia K5', captionUz: 'Eko-charm chexol', captionRu: 'Эко-кожаные чехлы', captionEn: 'Eco-leather covers' },
  { carName: 'Hyundai Tucson', captionUz: '3D pollik va chexol', captionRu: '3D коврики и чехлы', captionEn: '3D mats and covers' },
  { carName: 'Toyota Camry', captionUz: 'Premium chexol va aksessuar', captionRu: 'Премиум чехлы и аксессуары', captionEn: 'Premium covers and accessories' },
  { carName: 'Chevrolet Nexia', captionUz: 'Klassik chexol', captionRu: 'Классические чехлы', captionEn: 'Classic covers' },
  { carName: 'Ravon R3', captionUz: 'Eko-charm chexol', captionRu: 'Эко-кожаные чехлы', captionEn: 'Eco-leather covers' },
]

async function main() {
  const existing = await prisma.adminUser.findUnique({ where: { username: ADMIN_USER } })
  if (!existing) {
    const passwordHash = await bcrypt.hash(ADMIN_PASS, 10)
    await prisma.adminUser.create({ data: { username: ADMIN_USER, passwordHash } })
    console.log(`✓ Admin yaratildi → login: ${ADMIN_USER}  parol: ${ADMIN_PASS}`)
  } else {
    console.log(`• Admin allaqachon mavjud: ${ADMIN_USER}`)
  }

  const catCount = await prisma.category.count()
  if (catCount === 0) {
    for (let i = 0; i < CATEGORIES.length; i++) {
      await prisma.category.create({ data: { ...CATEGORIES[i], displayOrder: i } })
    }
    console.log(`✓ ${CATEGORIES.length} ta kategoriya qo'shildi`)
  } else {
    console.log(`• Allaqachon ${catCount} ta kategoriya bor — o'tkazib yuborildi`)
  }

  const count = await prisma.product.count()
  if (count === 0) {
    for (let i = 0; i < PRODUCTS.length; i++) {
      await prisma.product.create({ data: { ...PRODUCTS[i], displayOrder: i } })
    }
    console.log(`✓ ${PRODUCTS.length} ta mahsulot qo'shildi`)
  } else {
    console.log(`• Katalogda allaqachon ${count} ta mahsulot bor — o'tkazib yuborildi`)
  }

  const tierCount = await prisma.loyaltyTier.count()
  if (tierCount === 0) {
    for (let i = 0; i < LOYALTY_TIERS.length; i++) {
      await prisma.loyaltyTier.create({ data: { ...LOYALTY_TIERS[i], displayOrder: i } })
    }
    console.log(`✓ ${LOYALTY_TIERS.length} ta keshbek pog'onasi qo'shildi`)
  } else {
    console.log(`• Keshbek tizimida allaqachon ${tierCount} ta pog'ona bor — o'tkazib yuborildi`)
  }

  const portfolioCount = await prisma.portfolioItem.count()
  if (portfolioCount === 0) {
    for (let i = 0; i < PORTFOLIO.length; i++) {
      await prisma.portfolioItem.create({ data: { ...PORTFOLIO[i], displayOrder: i } })
    }
    console.log(`✓ ${PORTFOLIO.length} ta portfolio ishi qo'shildi`)
  } else {
    console.log(`• Portfolioda allaqachon ${portfolioCount} ta ish bor — o'tkazib yuborildi`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1) })
