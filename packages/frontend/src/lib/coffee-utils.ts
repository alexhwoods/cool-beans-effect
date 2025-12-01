import { CreateCoffeeRequest } from "@cool-beans/shared";

const coffeeNames = [
  "Ethiopian Yirgacheffe",
  "Colombian Supremo",
  "Guatemala Antigua",
  "Jamaican Blue Mountain",
  "Hawaiian Kona",
  "Sumatra Mandheling",
  "Kenya AA",
  "Costa Rica Tarrazu",
  "Peru Organic",
  "Brazil Santos",
  "Tanzania Peaberry",
  "Nicaragua Maragogype",
  "Panama Geisha",
  "Rwanda Bourbon",
  "Mexico Chiapas",
  "El Salvador Pacamara",
  "Honduras Copan",
  "Bolivia Caranavi",
  "Ecuador Galapagos",
  "Dominican Republic Barahona",
];

const origins = [
  "Ethiopia",
  "Colombia",
  "Guatemala",
  "Jamaica",
  "Hawaii",
  "Indonesia",
  "Kenya",
  "Costa Rica",
  "Peru",
  "Brazil",
  "Tanzania",
  "Nicaragua",
  "Panama",
  "Rwanda",
  "Mexico",
  "El Salvador",
  "Honduras",
  "Bolivia",
  "Ecuador",
  "Dominican Republic",
];

const roastLevels = ["Light", "Medium", "Medium-Dark", "Dark"];

const weights = ["8oz", "10oz", "12oz", "16oz"];

const descriptions = [
  "Bright and floral with notes of jasmine and citrus",
  "Rich and balanced with chocolate and nutty undertones",
  "Full-bodied with smoky notes and a spicy finish",
  "Smooth and mild with a clean, bright finish",
  "Rich and smooth with a hint of sweetness",
  "Earthy and full-bodied with low acidity",
  "Wine-like acidity with berry and wine notes",
  "Clean and bright with citrus and floral notes",
  "Chocolatey with caramel and nutty flavors",
  "Fruity and complex with tropical fruit notes",
  "Spicy with cinnamon and clove undertones",
  "Sweet and syrupy with molasses notes",
  "Elegant and refined with tea-like qualities",
  "Bold and intense with dark chocolate notes",
  "Delicate and nuanced with herbal notes",
];

/**
 * Generates a random coffee request with random values from predefined lists
 */
export function generateRandomCoffeeRequest(): CreateCoffeeRequest {
  const randomName =
    coffeeNames[Math.floor(Math.random() * coffeeNames.length)];
  const randomOrigin = origins[Math.floor(Math.random() * origins.length)];
  const randomRoast =
    roastLevels[Math.floor(Math.random() * roastLevels.length)];
  const randomWeight = weights[Math.floor(Math.random() * weights.length)];
  const randomDescription =
    descriptions[Math.floor(Math.random() * descriptions.length)];
  const randomPrice = Math.round((Math.random() * 80 + 15) * 100) / 100; // $15-$95
  const randomInStock = Math.random() > 0.2; // 80% chance of being in stock

  return {
    name: randomName,
    origin: randomOrigin,
    roast: randomRoast,
    price: randomPrice,
    weight: randomWeight,
    description: randomDescription,
    inStock: randomInStock,
  };
}
